import { useCallback, useEffect, useState } from 'react'
import S from './SimulationList.module.css'
import ModelProperties from 'components/ModelProperties/ModelProperties';
import { downloadFileFromText } from "utils/downloadFile";
import SimulationModel from 'models/SimulationModel';
import useDebounce from 'utils/useDebounce';
import { addModel$, deleteModel$, getActiveUser$, getModels$, updateModel$ } from 'helpers/api';

const DEBUG_POLLING = false;

export default function ModelList(props) {
    const [model, setModel] = useState(null);
    const [models, setModels] = useState([]);
    const [isReadyToRecheck, triggeRecheck] = useState(false);
    const debouncedValue = useDebounce(isReadyToRecheck, 500);
    const [user, setUser] = useState(null);

    const createModel = useCallback(() => {
        setModel(new SimulationModel(null, user?.id, user?.username))
    }, [setModel, user])

    const showList = useCallback(() => {
        setModel(null)
    }, [setModel])

    // TODO refactor this method
    const handleModelSubmit = useCallback(async (state, metadata) => {
        model.init(state, metadata);
        console.log('Model has changed')
        console.dir(model)

        await (model.id !== null 
            ? updateModel$(model.id, {state, metadata}) 
            : addModel$({state, metadata})
        ).
            then((response) => {
                console.log('[addModel$] response')
                console.dir(response);
            }).
            catch(e => {
                console.log('[addModel$] error')
                console.dir(e)
            })

        triggeRecheck(value => !value);

        // Close the form
        setModel(null);
    }, [model])

    const onDownloadHandler = useCallback(event => {
        event.preventDefault();
        const {index} = event.target.dataset
        if (models[index] !== undefined) {
            downloadFileFromText(models[index].metadata.name + '.json', models[index].export())
        }
    }, [models]);

    const onDeleteHandler = useCallback(async event => {
        event.preventDefault();
        const index = parseInt(event.target.dataset.index)
        const model = models[index]
        if (!model || model.id === undefined) return;
        await deleteModel$(model.id);
        triggeRecheck(value => !value);
    }, [models]);
    
    const onSelectHandler = useCallback(event => {
        event.preventDefault();
        const index = parseInt(event.target.dataset.index)

        console.log('[onSelectHandler]');
        console.dir(models[index]);
    }, [models]);

    const onModifyHandler = useCallback(event => {
        event.preventDefault();
        const index = parseInt(event.target.dataset.index)

        // console.log('[onSelectHandler]');
        // console.dir();
        setModel(models[index])
    }, [models]);

    const onViewHandler = useCallback(event => {
        event.preventDefault();
        const index = parseInt(event.target.dataset.index)

        console.log('[onViewHandler]');
        console.dir(models[index]);
    }, [models]);

    useEffect(() => {
        getActiveUser$().
            then(user_data => {
                if (!user_data) {
                    window.location.reload();
                }
                setUser(user_data);
            });

        const _interval = setInterval(_ => {
            if (DEBUG_POLLING) console.log('[NEXT tick]');
            triggeRecheck(value => !value);
        }, 10000)
        
        return () => {
            clearInterval(_interval)
        }
    }, [])

    useEffect(() => {
        getModels$().
            then((_models) => {
                if (DEBUG_POLLING) console.log('[getModels$]')
                setModels(_ => _models.map(
                    ({id, user_id, user_name, properties : {state, metadata}}) => new SimulationModel(id, user_id, user_name).init(state, metadata)
                ));
            }).
            catch((e) => {
                // not authorized
                console.log('[getModels$ error:]');
                console.dir(e)
            })

    }, [debouncedValue])

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
                                        data-index={modelIndex}
                                        onClick={onSelectHandler}
                                    >Select</button>
                                    <button 
                                        data-index={modelIndex}
                                        onClick={onModifyHandler}
                                    >Modify</button>
                                    <button 
                                        data-index={modelIndex}
                                        onClick={onViewHandler}
                                    >View</button>
                                    <button 
                                        data-index={modelIndex}
                                        onClick={onDeleteHandler}
                                    >Delete</button>
                                    <button 
                                        data-index={modelIndex} 
                                        onClick={onDownloadHandler}
                                    >Download</button>
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
                    disabled={user && model.owner_id !== user.id}
                    parameters={props.model_parameters}
                    onSubmit={handleModelSubmit}
                />	
            
                <button className="btn __secondary" onClick={showList}>[X]</button>
            </div>
        </div>) 
        }
        
    </div>
}
