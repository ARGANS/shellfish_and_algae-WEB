import { useEffect, useState, useCallback } from 'react'
import S from './JobList.module.css'
import { removeAllComponents } from 'libs/ComponentHeap/ComponentHeap';
import {containerService} from 'helpers/container2_service';

export default function JobList(props) {
    const [containers, setContainers] = useState([])

    useEffect(() => {
        const callback = containerService.emitter.on('container_list_change', (containers, removedContainer) => {
            console.log('[container_list_change2]')
            console.dir([containers, removedContainer]);
            setContainers(containers);
        });

        return () => {
            containerService.emitter.off('container_list_change', callback);
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
