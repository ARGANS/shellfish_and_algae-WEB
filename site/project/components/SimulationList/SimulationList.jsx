import { useCallback, useEffect, useState } from 'react'
import S from './SimulationList.module.css'
import ModelProperties from 'components/ModelProperties/ModelProperties';
import { downloadFileFromText } from "utils/downloadFile";
import SimulationModel from 'models/SimulationModel';
import useDebounce from 'utils/useDebounce';
import { deleteModel$, deleteResults$, getActiveUser$, getModels$ } from 'helpers/api';
import { addComponent } from 'libs/ComponentHeap/ComponentHeap';
import Dialog from 'libs/Dialogs/Dialog';
import PipelineModal from 'components/PipelineModal/PipelineModal';
import DialogHeader from 'libs/DialogHeader/DialogHeader';
import Sicon from 'libs/Sicon/Sicon';
import { classList } from 'utils/strings';
import { ConfirmDialog } from 'libs/ConfirmDialog/ConfirmDialog';

const DEBUG_POLLING = false;
const LONG_POLLING_IS_ACTIVE = true;

function findModel(event, _models) {
    const index = parseInt(event.target.closest('button').dataset.index)
    const model = _models[index]

    if (!model || model.id === undefined) return;
    return model;
}

function removeModelAndFiles$(model) {
    if (!model) return;
    
    return deleteModel$(model.id)
        .then(function() {
            deleteResults$(`/media/share/data/${model.id}`)
        })
}

export default function ModelList(props) {
    const [model, setModel] = useState(null);
    const [models, setModels] = useState([]);
    const [isReadyToRecheck, triggeRecheck] = useState(false);
    const debouncedValue = useDebounce(isReadyToRecheck, 500);
    const [user, setUser] = useState(null);

    const createModel = useCallback(() => {
        setModel(new SimulationModel(null, user?.id, user?.username, props.id))
    }, [setModel, user])

    const showList = useCallback(() => {
        setModel(null)
    }, [setModel])

    const handleModelSubmit = useCallback(async (parameters, metadata, dataset_parameters) => {
        await model
            .init(parameters, metadata, dataset_parameters)
            .synchronize()
            .then((response) => {
                console.log('Model has changed')
                console.dir(model)
                console.dir(response);
            })
            .catch(e => {
                console.log('Fail to change the model')
                console.dir(e)
            });

        triggeRecheck(value => !value);

        // Close the form
        setModel(null);
    }, [model])

    const onDownloadHandler = useCallback(event => {
        event.preventDefault();
        
        const model = findModel(event, models);
        if (!model) return;

        downloadFileFromText(model.metadata.name + '.json', model.export(true))
    }, [models]);

    const onDeleteHandler = useCallback(event => {
        event.preventDefault();
        const model = findModel(event, models);

        addComponent(<Dialog key={Math.random()} dialogKey={'confirmDialog1'}>
            <ConfirmDialog 
                title='This action requires confirmation' 
                onResolve={() => removeModelAndFiles$(model)}
            >
                <p className="boffset-c">Are you sure you want to delete this model?</p>
            </ConfirmDialog>
        </Dialog>)

        // TODO deprecated
        // triggeRecheck(value => !value);
    }, [models]);
    
    const onSelectHandler = useCallback(event => {
        event.preventDefault();
        const model = findModel(event, models);
        if (!model) return;

        addComponent(<Dialog key={Math.random()} dialogKey={'TaskManager1'}>
            <DialogHeader title={'Steps to execute the model:'}>
                <div className={classList('regular-grid', S.modelProps)}>
                    <h4>Name:</h4>
                    <div>{model.metadata.name}</div>
                    <h4>Id:</h4>
                    <div>{model.id}</div>
                    <h4>Owner:</h4>
                    <div>{model.owner_name}/{model.owner_id}</div>
                    <h4>dataset_id:</h4>
                    <div>{model.dataset_id}</div>
                </div>
                <PipelineModal model={model} user={user}/>
            </DialogHeader>
        </Dialog>, 'default');
    }, [models, user]);

    const onModifyHandler = useCallback(event => {
        event.preventDefault();
        const model = findModel(event, models);
        if (!model) return;

        setModel(model)
    }, [models]);

    const onViewHandler = useCallback(event => {
        event.preventDefault();
        const model = findModel(event, models);
        if (!model) return;

        console.log('[onViewHandler]');
        console.dir(model);
    }, [models]);

    useEffect(() => {
        // console.log('SimulationList %s', props.id);
        // console.dir(props);
        getActiveUser$().
            then(user_data => {
                if (!user_data) {
                    window.location.reload();
                }
                setUser(user_data);
            });

        let _interval;

        if (LONG_POLLING_IS_ACTIVE) {
            _interval = setInterval(_ => {
                if (DEBUG_POLLING) console.log('[NEXT tick]');
                triggeRecheck(value => !value);
            }, 10000)
        }
        
        
        return () => {
            if (LONG_POLLING_IS_ACTIVE) {
                clearInterval(_interval)
            }
        }
    }, [])

    useEffect(() => {
        const typeId_s = props.id;
        getModels$(typeId_s)
            .then((_models) => {
                if (DEBUG_POLLING) console.log('[getModels$]')
                setModels(_ => _models
                    .filter(model_props => SimulationModel.validateProperties(model_props))
                    .map(model_props =>  SimulationModel.fromJSON(model_props))
                );
            })
            .catch((e) => {
                // not authorized
                console.log('[getModels$ error:]');
                console.dir(e)
            })
    }, [debouncedValue])

    const onFormResetHandler = useCallback((e) => {
        e.preventDefault();
        showList();
    })

    const isDisabled = false; // user && model && model.owner_id !== user.id;
    
    return <div className={S.root}>
        {model === null ? ( <>
            <div className={S.header}>
                <button className="btn" onClick={createModel}>+ Create a new model</button>
            </div>
            <div className={S.body}>
                <div className={S.body_inner}>
                    <div className={S.list}>
                        <div className={classList(S.list_header1, 'lpad-d')}>#</div>
                        <div className={S.list_header2}>Title</div>
                        {models.map((modelItem, modelIndex) => {
                            return <>
                                <div className="lpad-d">{modelItem.id}</div>
                                <div>{modelItem.metadata.name}</div>
                                <div>
                                    <button 
                                        title="Select"
                                        className="icon-btn"
                                        data-index={modelIndex}
                                        onClick={onSelectHandler}
                                    ><Sicon link={'/assets/images/service_icons.svg#rocket'}/></button>
                                    <button 
                                        title="Modify model"
                                        className="icon-btn"
                                        data-index={modelIndex}
                                        onClick={onModifyHandler}
                                    ><Sicon link={'/assets/images/service_icons.svg#edit'}/></button>
                                    {/* <button 
                                        data-index={modelIndex}
                                        onClick={onViewHandler}
                                    >View</button> */}
                                    <button 
                                        title="Delete"
                                        className="icon-btn"
                                        data-index={modelIndex}
                                        onClick={onDeleteHandler}
                                    ><Sicon link={'/assets/images/service_icons.svg#trash'} /></button>
                                    <button 
                                        title="Export"
                                        className="icon-btn"
                                        data-index={modelIndex} 
                                        onClick={onDownloadHandler}
                                    ><Sicon link={'/assets/images/service_icons.svg#download'} /></button>
                                </div>
                            </>
                        })}
                    </div>
                </div>
            </div>
        </>) : (<div className={S.formWrapper}>
            <div className={S.formWrapperInner}>
                <ModelProperties 
                    model={model}
                    disabled={isDisabled}
                    parameters={props.parameters}
                    onSubmit={handleModelSubmit}
                >
                    <div className={S.formBtns}>
                        {!isDisabled && <button type="submit" className="btn btn-primary">Submit</button>}
                        <button className="btn btn-secondary" onClick={onFormResetHandler}>Go back to the list</button>
                    </div>
                </ModelProperties>	
            </div>
        </div>) 
        }
        
    </div>
}
