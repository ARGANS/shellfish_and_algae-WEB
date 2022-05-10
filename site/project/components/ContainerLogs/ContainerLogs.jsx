import { getLogs$, NODE_API_PREFIX } from 'helpers/api';
import { useEffect, useState } from 'react'
import S from './ContainerLogs.module.css'

const LIMIT = 50

export default function ContainerLogs(props) {
    const [records, setRecords] = useState([]);

    // Depends on props.container_id
    useEffect(() => {
        console.log('[ContainerLogs] %s', props.container_id);
        const _esource = new ListenEvent(
            NODE_API_PREFIX + '/container/log/stream?id=' + props.container_id, 
            // On message:
            ({data: message}) => {
                // console.log('Message: %s', message);
                setRecords((_records) => {
                    return [..._records.slice(_records.length - LIMIT -1), message]
                })
            },
            // On termination:
            props.onTermination
        );
        
        getLogs$(props.container_id, LIMIT)
            .then((logRecords) => {
                if (!logRecords) return;
                setRecords(logRecords)
            })
            .catch(e => {
                console.log('[getLogs$ ERROR]');
                console.dir(e);
            })
            .finally(() => {
                props.onStart();
                _esource.reconnect();
            })
      
        return () => {
            _esource.close();
        }
    }, [props.container_id])

    return <div className={S.root}>
        {records.map((logRecord, i) => {
            return <pre key={i} className={S.record}>{logRecord}</pre>
        })}
    </div>
}

class ListenEvent {
    #link = null;
    #source = null;
    #onMessage = null;
    #onTermination = null;
    #n_attempts = 0;

    constructor(link_s, onMessage, onTermination){
        this.#link = link_s;
        this.#onMessage = onMessage;
        this.#onTermination = onTermination;
    }

    reconnect() {
        if (this.#source && this.#source?.readyState !== EventSource.CLOSED) {
            this.close();
        }
    
        this.#source = new EventSource(this.#link);
        this.#source.onmessage = this.#onMessage;
        this.#source.onerror = (e) => {
            console.log('SSE error #%s, readyState: %s / %s', this.#n_attempts, this.#source.readyState, e.target.readyState)
            console.dir(e)
            if (e.target.readyState === EventSource.CLOSED) {
                // TODO connection closed!
                this.#onTermination()
            }
        }
        this.#n_attempts++;
    }

    close() {
        this.#source.onerror = null;
        this.#source.onmessage = null;
        this.#source.close();
    }
}

