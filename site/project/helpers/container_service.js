import EventEmitter from "libs/ComponentHeap/eventEmitter";
import { useEffect, useRef, useState } from "react";

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
        // _containers.current[0] = containers;
        // _containers.current[1] = containersChanges;
        _containers.current = [containers, containersChanges];
    })
}

export function stop(){
    emitter.off('container_list_change');
}

init();

export function useContainers(){
    const [state, setState] = useState(_containers.current);

    useEffect(() => {
        let _handler = emitter.on('container_list_change', (containers, containersChanges) => {
            setState([containers, containersChanges])
        })
        return () => {
            emitter.off('container_list_change', _handler);
            _handler = null;
        }
    }, []);

    return state;
}

export function useGetContainers(){
    // return useRef(_containers.current);
    return useRef(_containers);
}
