import { useEffect, useState, useCallback } from 'react'
import S from './PipelineModal.module.css'
import { removeAllComponents } from 'libs/ComponentHeap/ComponentHeap';
import { getPipelineStatus$, runDataImportTask$, runDataReadTask$, deleteDataImportResults$, deleteDataReadResults$ } from 'helpers/api';
import ContainerLogs from 'components/ContainerLogs/ContainerLogs';

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
                // TODO was disabled temporary
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

    const closeDialogHandler = useCallback(() => {
        removeAllComponents();
    })

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
                    .synchronize();
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
                    .synchronize();
            });
    });

    const removeDataImportResults = useCallback(() => {
        const {model} = props;
        return deleteDataImportResults$(model)
            .then(() => {
                synchronizeState();
                const {data_import_container, ...rest} = model.metadata;
                
                console.log('Removing data_import_container %s', data_import_container);
                console.dir(model);

                setWatchingContainer(null);
                model
                    .init(props.model.atbd_parameters, {...rest})
                    .synchronize();
                // TODO remove file
            })
    });

    const removeDataReadResults = useCallback(() => {
        const {model} = props;
        return deleteDataReadResults$(model)
            .then(() => {
                synchronizeState();
                const {data_read_container, ...rest} = model.metadata;
                
                console.log('Removing data_reas_container %s', data_read_container);
                console.dir(model);
                
                setWatchingContainer(null);
                model
                    .init(model.atbd_parameters, {...rest})
                    .synchronize();
                // TODO remove file
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
                <span>{props.model.destination_dataimport_path}</span>
                {!!state.data_import.completed && <>
                    <button>Download</button>
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
                <span>{props.model.destination_dataread_path}</span>
                {!!state.data_read.completed && <>
                    <button>Download</button>
                    <button onClick={removeDataReadResults}>Delete</button>
                </>}
            </p>
        </>}
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
        <button onClick={closeDialogHandler}>Close</button>
    </div>
}
