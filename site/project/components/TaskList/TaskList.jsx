import { useEffect, useState, useCallback } from 'react'
import S from './TaskList.module.css'
import { removeAllComponents } from 'libs/ComponentHeap/ComponentHeap';
import { updateModel$, getTaskStatus$, runDataImportTask$, runDataReadTask$, deleteDataImportResults$, deleteDataReadResults$ } from 'helpers/api';

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


export default function TaskList(props) {
    const [state, setState] = useState({})
    const synchronizeState = useCallback(() => getTaskStatus$(props.model)
        .then(status => {
            console.log('TaskList');
            console.dir(status);
            setState(_state => ({
                ..._state,
                ...status
            }))
        }))
    
    useEffect(() => {
        synchronizeState();
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
                // TODO Probably unused:
                
                model.metadata = {
                    ...model.metadata,
                    data_import_container: data.id
                };
                return updateModel$(model.id, {
                    state: model.atbd_parameters,
                    metadata: model.metadata
                })
            })
    });

    const startDataReadTaskHandler = useCallback(() => {
        const {model} = props;
        return runDataReadTask$(model)
            .then(data => {
                console.log('[runDataReadTask$]');
                console.dir(data);
                synchronizeState();
                // TODO Probably unused:
                model.metadata = {
                    ...model.metadata,
                    data_read_container: data.id
                };
                return updateModel$(model.id, {
                    state: model.atbd_parameters,
                    metadata: model.metadata
                });
            });
    });

    const removeDataImportResults = useCallback(() => {
        return deleteDataImportResults$(props.model).then(() => {
            synchronizeState();
        })
    })
    const removeDataReadResults = useCallback(() => {
        return deleteDataReadResults$(props.model).then(() => {
            synchronizeState();
        })
    })

    return <div className={S.root}>
        {!!state.data_import && <>
            <h3>Dataset</h3>
            <p>
                <span>{typeDataImportStatus(state.data_import)}</span> 
                {!state.data_import.in_progress && <button onClick={startDataImportTaskHandler}>Start task</button>}
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
            <h3>Processed data</h3>
            <p>
                <span>{typeDataReadStatus(state.data_read)}</span> 
                {!state.data_read.in_progress && state.data_import.completed && <button onClick={startDataReadTaskHandler}>Start task</button>}
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
        <button onClick={closeDialogHandler}>Close</button>
    </div>
}
