import { getLogs$, NODE_API_PREFIX } from 'helpers/api';
import { useEffect, useState } from 'react'
import S from './ContainerLogs.module.css'

const LIMIT = 50

export default function ContainerLogs(props) {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        console.log('[ContainerLogs] %s', props.container_id);
        getLogs$(props.container_id, LIMIT)
            .then((logRecords) => {
                setRecords(logRecords)
            });

        const _esource = new ListenEvent(NODE_API_PREFIX + '/container/log/stream?id=' + props.container_id, ({data: message}) => {
            console.log('Message: %s', message);
            setRecords((_records) => {
                return [..._records.slice(_records.length - LIMIT -1), message]
            })
        });
        _esource.reconnect();
        
        return () => {
            _esource.close();
        }
    }, [])
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
    #count = 0;

    constructor(link_s, onMessage){
        this.#link = link_s;
        this.#onMessage = onMessage;
    }

    reconnect() {
        if (this.#source && this.#source?.readyState !== EventSource.CLOSED) {
            this.close();
        }
    
        this.#source = new EventSource(this.#link);
        this.#source.onmessage = this.#onMessage;
        this.#source.onerror = (e) => {
            console.log('SSE error %s', this.#count)
            console.dir(e)
            // this.reconnect();
            if (this.#count++ < 10) {
                setTimeout(() => {
                    this.reconnect();
                }, 1000);
            }
        }
    }

    close() {
        this.#source.onerror = null;
        this.#source.onmessage = null;
        this.#source.close();
    }
}

