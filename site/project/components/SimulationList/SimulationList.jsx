import { useCallback, useEffect, useState } from 'react'
import S from './SimulationList.module.css'
import ModelProperties from 'components/ModelProperties/ModelProperties';
import { downloadFileFromText } from "utils/downloadFile";
import SimulationModel from 'models/SimulationModel';
import useDebounce from 'utils/useDebounce';
import { deleteModel$, getActiveUser$, getModels$ } from 'helpers/api';
import { addComponent } from 'libs/ComponentHeap/ComponentHeap';
import Dialog from 'libs/Dialogs/Dialog';
import PipelineModal from 'components/PipelineModal/PipelineModal';
import DialogHeader from 'libs/DialogHeader/DialogHeader';
import Sicon from 'libs/Sicon/Sicon';

const DEBUG_POLLING = false;
const LONG_POLLING_IS_ACTIVE = true;

function findModel(event, _models) {
    const index = parseInt(event.target.closest('button').dataset.index)
    const model = _models[index]

    if (!model || model.id === undefined) return;
    return model;
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

    const onDeleteHandler = useCallback(async event => {
        event.preventDefault();
        const model = findModel(event, models);
        if (!model) return;
        await deleteModel$(model.id);
        triggeRecheck(value => !value);
    }, [models]);
    
    const onSelectHandler = useCallback(event => {
        event.preventDefault();
        const model = findModel(event, models);
        if (!model) return;

        addComponent(<Dialog key={Math.random()} dialogKey={'TaskManager1'}>
            <DialogHeader title={'Steps to execute the model: ' + model.metadata.name}>
                <PipelineModal model={model}/>
            </DialogHeader>
        </Dialog>, 'default');
    }, [models]);

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
        console.log('SimulationList %s', props.id);
        console.dir(props);
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

    const isDisabled = user && model && model.owner_id !== user.id;
    
    return <div className={S.root}>
        {model === null ? ( <>
            <div className={S.header}>
                <button className="btn" onClick={createModel}>+ Create a model</button>
            </div>
            <div className={S.body}>
                <div className={S.body_inner}>
                    <div className={S.list}>
                        <div className={S.list_header1}>#</div>
                        <div className={S.list_header2}>Title</div>
                        {models.map((modelItem, modelIndex) => {
                            return <>
                                <div>{modelIndex + 1}</div>
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
                                    ><Sicon link={'/assets/images/service_icons.svg#gear'}/></button>
                                    {/* <button 
                                        data-index={modelIndex}
                                        onClick={onViewHandler}
                                    >View</button> */}
                                    <button 
                                        title="Delete"
                                        className="icon-btn"
                                        data-index={modelIndex}
                                        onClick={onDeleteHandler}
                                    ><Sicon link={'/assets/images/service_icons.svg#burn'} /></button>
                                    <button 
                                        title="Export"
                                        className="icon-btn"
                                        data-index={modelIndex} 
                                        onClick={onDownloadHandler}
                                    ><Sicon link={'/assets/images/service_icons.svg#chart-file'} /></button>
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
