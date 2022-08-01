import EventEmitter from "libs/ComponentHeap/eventEmitter";
import { useEffect, useState } from "react";

export const emitter = new EventEmitter();
const _containers = createInitState();

function createInitState() {
    return {
        current: [
            [], {
                added:[], 
                removed: []
            }
        ]
    };
}

function init() {
    emitter.on('container_list_change', (containers, containersChanges) => {
        _containers.current = [containers, containersChanges]
    })
}

export function stop(){
    emitter.off('container_list_change');
}

init();

export function useContainers(){
    const [state, setState] = useState(_containers.current);

    useEffect(() => {
        const _handler = emitter.on('container_list_change', (containers, containersChanges) => {
            setState([containers, containersChanges])
        })
        return () => {
            emitter.off('container_list_change', _handler);
            _handler = null;
        }
    }, []);

    return state;
}
