import { useEffect, useState, useCallback } from 'react'
import S from './JobList.module.css'
import { removeAllComponents } from 'libs/ComponentHeap/ComponentHeap';
import { emitter, stop } from 'helpers/container_service';


function diff(left, right){
    const left_id = left.map(obj => obj.id);
    return right.filter(obj => left_id.indexOf(obj.id) === -1);
}

function compare(prevList, curList) {
    return {
        added: diff(prevList, curList),
        removed: diff(curList, prevList)
    };
}

// const CONTAINER_STREAM_ENDPOINT = '/api/v2/container/stream';
const CONTAINER_STREAM_ENDPOINT = '/api/v2/stream/container';

export default function JobList(props) {
    const [containers, setContainers] = useState([])
    // TODO move outside of the component
    useEffect(() => {
        const _evtSource = new EventSource(CONTAINER_STREAM_ENDPOINT);
        let _prev = [];

        _evtSource.onmessage = function(e) {
            const response = JSON.parse(e.data)
            const containers = response
                .map(containerData => {
                    const {state} = containerData;
                    state.StartedAt = Date.parse(state.StartedAt)
                    state.FinishedAt = Date.parse(state.FinishedAt)
                    if (state.FinishedAt < 0) {
                        state.FinishedAt = null;
                    }
                    return containerData;
                })
                .sort((a, b) => a.StartedAt - b.StartedAt)
            
            const containersChanges = compare(_prev, containers);

            if (containersChanges.added.length !== 0 || containersChanges.removed.length !== 0) {
                // console.log('\t\tEmit [container_list_change]');
                // console.dir(containersChanges);
                emitter.emit('container_list_change', containers, containersChanges)
            } 
            _prev = containers;
            setContainers(containers);
        };
        return () => {
            _evtSource.close();
            stop();
        }
    }, []);

    const clickHandler = useCallback((e) => {
        const containerId = e.target.dataset.id;
        const containerData = containers.find(container => container.short_id === containerId);
        console.log('Container %s', containerId);
        console.dir(containerData);
    }, [containers]);
    
   
    return <div className={S.root}>
        <ol>
            {containers.map(container => (
                <li 
                    className="regular_vlink"
                    key={container.short_id} 
                    data-id={container.short_id} 
                    onClick={clickHandler}>{typeContainerStat(container)}</li>
            ))}
        </ol>
        {/* TODO render how long ago the container has been started! */}
    </div>
}

function typeContainerStat(container) {
    return [
        container.short_id,
        container.name ? (', ' +  container.name) : '',
        ' ',
        container.labels.hasOwnProperty('task.type') ? container.labels['task.type'] : '',
    ].join('')  
}
