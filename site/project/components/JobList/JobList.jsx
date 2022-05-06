import { useEffect, useState, useCallback } from 'react'
import S from './JobList.module.css'
import { removeAllComponents } from 'libs/ComponentHeap/ComponentHeap';

export default function JobList(props) {
    const [containers, setContainers] = useState([])
    useEffect(() => {
        const _evtSource = new EventSource('/api/v2/container/stream');
        console.log('START source');
        console.dir(_evtSource);
        _evtSource.onmessage = function(e) {
            const response = JSON.parse(e.data)
        
            setContainers(response.map(containerData => {
                containerData.state.StartedAt = Date.parse(containerData.state.StartedAt)
                containerData.state.FinishedAt = Date.parse(containerData.state.FinishedAt)
                if (containerData.state.FinishedAt < 0) {
                    containerData.state.FinishedAt = null;
                }
                return containerData;
            }).sort((a, b) => a.StartedAt - b.StartedAt));
        };
        return () => {
            _evtSource.close();
            
        }
    }, [])
    
   
    return <div className={S.root}>
        <ul>
            {containers.map(container => (
                <li key={container.short_id}>
                    {container.short_id}&nbsp;{container.name && ('(' +  container.name + ')')}&nbsp;{container.status}
                    {/* TODO render how long ago the container has been started! */}
                </li>
            ))}
        </ul>
    </div>
}

