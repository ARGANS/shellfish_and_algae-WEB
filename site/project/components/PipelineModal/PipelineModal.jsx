import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import S from './PipelineModal.module.css'
import { getPipelineStatus$, runDataImportTask$, runDataReadTask$, deleteDataImportResults$, deleteDataReadResults$, deletePostprocessingResults$, runPostprocessingTask$ } from 'helpers/api';
import ContainerLogs from 'components/ContainerLogs/ContainerLogs';
import Dialog from 'libs/Dialogs/Dialog';
import DialogHeader from 'libs/DialogHeader/DialogHeader';
import { addComponent } from 'libs/ComponentHeap/ComponentHeap';
const DynamicMap = dynamic(() => import('libs/Map/Map'), { ssr: false })

/**
 * 
 * @param {Object} state 
 */
function typeDataImportStatus(state) {
    return state.not_started 
        ? 'Not downloaded' 
        : state.in_progress 
            ? 'Downloading now'
            : state.completed
                ? 'Already downloaded'
                : '-'
}
function typeDataReadStatus(state) {
    return state.not_started 
        ? 'Not processed' 
        : state.in_progress 
            ? 'In progress now'
            : state.completed
                ? 'Already processed'
                : '-'
}


export default function PipelineModal(props) {
    const [state, setState] = useState({});
    const [watchingContainer, setWatchingContainer] = useState(null);

    const synchronizeState = useCallback(() => {
        return getPipelineStatus$(props.model)
            .then(status => {
                console.log('Pipeline Status:');
                console.dir(status);
                setState(_state => ({
                    ..._state,
                    ...status
                }))

                if (status.data_import.in_progress) {
                    setWatchingContainer(props.model.metadata.data_import_container)
                } else if (status.data_read.in_progress){
                    setWatchingContainer(props.model.metadata.data_read_container)
                }
            })
    })
    
    // Once modal is opened
    useEffect(() => {
        synchronizeState();
        return () => {}
    }, []);

    const startDataImportTaskHandler = useCallback(() => {
        const {model} = props;
        return runDataImportTask$(model)
            .then(data => {
                console.log('[runDataImportTask$]');
                console.dir(data);
                synchronizeState();
                setWatchingContainer(data.id);
                
                return model
                    .init(model.atbd_parameters, {
                        ...model.metadata,
                        data_import_container: data.id
                    })
                    .synchronize()
                    .finally(synchronizeState)
            })
    });

    const startDataReadTaskHandler = useCallback(() => {
        const {model} = props;
        return runDataReadTask$(model)
            .then(data => {
                console.log('[runDataReadTask$]');
                console.dir(data);
                // Does not work properly here
                synchronizeState();
                
                setWatchingContainer(data.id);

                console.log('Model update')
                console.dir(model);
             
                return model
                    .init(model.atbd_parameters, {
                        ...model.metadata,
                        data_read_container: data.id
                    })
                    .synchronize()
                    .finally(synchronizeState)
            });
    });

    
    const startPostprocessingTaskHandler = useCallback(() => {
        const {model} = props;
        return runPostprocessingTask$(model)
            .then(data => {
                console.log('[runPostprocessingTask$]');
                console.dir(data);
                // Does not work properly here
                synchronizeState();
                
                setWatchingContainer(data.id);

                console.log('Model update')
                console.dir(model);
             
                return model
                    .init(model.atbd_parameters, {
                        ...model.metadata,
                        postprocessing_container: data.id
                    })
                    .synchronize()
                    .finally(synchronizeState)
            });
    });

    const removeDataImportResults = useCallback(() => {
        const {model} = props;
        return deleteDataImportResults$(model)
            .then(() => {
                synchronizeState();
                const {data_import_container, ...rest} = model.metadata;
                
                setWatchingContainer(null);
                model
                    .init(props.model.atbd_parameters, {...rest})
                    .synchronize();
            })
    });

    const removeDataReadResults = useCallback(() => {
        const {model} = props;
        return deleteDataReadResults$(model)
            .then(() => {
                synchronizeState();
                const {data_read_container, ...rest} = model.metadata;
                
                setWatchingContainer(null);
                model
                    .init(model.atbd_parameters, {...rest})
                    .synchronize();
            })
    });

    const removePostprocessingResults = useCallback(() => {
        const {model} = props;
        return deletePostprocessingResults$(model)
            .then(() => {
                synchronizeState();
                const {postprocessing_container, ...rest} = model.metadata;
                
                setWatchingContainer(null);
                model
                    .init(model.atbd_parameters, {...rest})
                    .synchronize();
            })
    });


    useEffect(() => {
        console.log('[watchingContainer] %s', watchingContainer);
    }, [watchingContainer]);

    const onStartHandler = useCallback(() => {
        setTimeout(()=> {
            synchronizeState();
        }, 1000);
    }, [])

    const showMapHandler = useCallback(() => {
        addComponent(<Dialog key={Math.random()} dialogKey={'MapDialog1'}>
            <DialogHeader title="Map">
                <div className={S.mapDialog}>
                    <DynamicMap model={props.model}/>
                </div>
            </DialogHeader>
        </Dialog>, 'default');
    })

    // TODO
    // Currently the app starts showing logs once the watchingContainer is changing.
    // But The app should listen the changes in the container list to request the log

    return <div className={S.root}>
        {!!state.data_import && <>
            <h3>#1 Dataset</h3>
            <p>
                <span>{typeDataImportStatus(state.data_import)}</span> 
                {state.data_import.not_started && <button onClick={startDataImportTaskHandler}>Start task</button>}
            </p>
            <p>
                {!!state.data_import.completed && <>
                    <a  title={props.model.destination_dataimport_path}
                        href={'/api/v2/archive?path=' + props.model.destination_dataimport_path}
                        download={props.model.metadata.name + '_dataset'}
                    >Download</a>
                    <button onClick={removeDataImportResults}>Delete</button>
                </>}
            </p>
        </>}
        {!!state.data_read && <>
            <h3>#2 Processed data</h3>
            <p>
                <span>{typeDataReadStatus(state.data_read)}</span> 
                {state.data_read.not_started && state.data_import.completed && <button onClick={startDataReadTaskHandler}>Start task</button>}
            </p>            
            <p>
                {!!state.data_read.completed && <>
                    <a  title={props.model.destination_dataread_path}
                        href={'/api/v2/archive?path=' + props.model.destination_dataread_path}
                        download={props.model.metadata.name + '_files'}
                    >Download</a>
                    <button onClick={removeDataReadResults}>Delete</button>
                </>}
            </p>
        </>}
        {!!state.postprocessing && <>
            <h3>#3 Post-processing</h3>
            <p>
                <span>{typeDataReadStatus(state.postprocessing)}</span> 
                {state.postprocessing.not_started && state.data_read.completed && <button onClick={startPostprocessingTaskHandler}>Start task</button>}
            </p>            
            <p>
                {!!state.postprocessing.completed && <>
                    <a  title={props.model.destination_postprocessing_path}
                        href={'/api/v2/archive?path=' + props.model.destination_postprocessing_path}
                        download={props.model.metadata.name + '_images'}
                    >Download</a>
                    <button onClick={removePostprocessingResults}>Delete</button>
                </>}
            </p>
        </>}
        <div>
            <button onClick={showMapHandler}>Map</button>
        </div>
        
        {!state.data_import && <>
            {/* TODO add spiner */}
            <p>Loading...</p>
        </>}
        {!!state.data_import && watchingContainer && <div className={S.logs}>
            <ContainerLogs 
                container_id={watchingContainer} 
                onStart={onStartHandler}
                onTermination={synchronizeState}
            />
        </div>}
    </div>
}