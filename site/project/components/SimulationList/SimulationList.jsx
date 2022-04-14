import { useCallback, useEffect, useState } from 'react'
import S from './SimulationList.module.css'
import ModelProperties from 'components/ModelProperties/ModelProperties';
import { downloadFileFromText } from "utils/downloadFile";

import SimulationModel from 'settings/SimulationModel';

// TODO rename settings into models

export default function ModelList(props) {
    const [model, setModel] = useState(null);
    const [models, setModels] = useState([])

    const createModel = useCallback(() => {
        setModel(new SimulationModel())
    }, [setModel])

    const showList = useCallback(() => {
        setModel(null)
    }, [setModel])

    // TODO refactor this method
    const handleModelSubmit = useCallback((state, metadata) => {
        model.init(state, metadata);
        
        setModels(_models => {
            const index = _models.indexOf(model)
            // This is a new model
            if (index < 0) return [..._models, model];

            // The model has been edited
            return [
                ..._models.slice(0, index), 
                model,
                ..._models.slice(index + 1)
            ];
        });
        
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

    const onDeleteHandler = useCallback(event => {
        event.preventDefault();
        const index = parseInt(event.target.dataset.index)

        setModels(_models => {
            if (!_models[index]) return _models;

            return [..._models.slice(0, index), ..._models.slice(index + 1)];
        });
    }, []);
    
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
        // TODO retrieve models via API
        fetch('/api/v1/data/models', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((content) => {
            console.log('Received')
            console.dir(content)
        }).catch((e) => {
            // not authorized
            console.log('Error');
            console.dir(e)
        })
        // TODO use longpolling
        
        return () => {
            // TODO stol longpolling
        }
    }, [])

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
                {/* TODO when submitting, fill the model with properties from the form */}
            
                <ModelProperties 
                    model={model}
                    parameters={props.model_parameters}
                    onSubmit={handleModelSubmit}
                />	
            
                <button className="btn __secondary" onClick={showList}>[X]</button>
            </div>
        </div>) 
        }
        
    </div>
}