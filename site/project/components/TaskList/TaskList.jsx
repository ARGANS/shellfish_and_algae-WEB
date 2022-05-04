import { useEffect, useState, useCallback } from 'react'
import S from './TaskList.module.css'
import { removeAllComponents } from 'libs/ComponentHeap/ComponentHeap';
import { updateModel$, getTaskStatus$, runDataImportTask$, runDataReadTask$ } from 'helpers/api';

export default function TaskList(props) {
    const [state, setState] = useState({})
    
    useEffect(() => {
        getTaskStatus$(props.model)
            .then(status => {
                console.log('TaskList');
                console.dir(status);
                setState(_state => ({
                    ..._state,
                    status
                }))
            });
    }, []);

    const closeDialogHandler = useCallback(() => {
        removeAllComponents();
    })

    return <div className={S.root}>
        <h3>Dataset</h3>
        <p><span>Not downloaded/Downloading now/Already downloaded</span> <button>Start task</button></p>
        <p><span>/path</span><button>Download</button><button>Delete</button></p>
        <h3>Processed data</h3>
        <p><span>Not processed/In progress now/Already processed</span> <button>Start task</button></p>
        <p><span>/path</span><button>Download</button><button>Delete</button></p>

        <button onClick={closeDialogHandler}>Close</button>
    </div>
}
