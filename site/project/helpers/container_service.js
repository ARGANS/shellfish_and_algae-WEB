import EventEmitter from "libs/ComponentHeap/eventEmitter";
import { useEffect, useRef, useState } from "react";

export const emitter = new EventEmitter();
const _containers = createInitState();

// if (typeof(window) != 'undefined') {
//     window._emitter = emitter;
// }


function createInitState() {
    return [
        [], {
            added:[], 
            removed: []
        }
    ];
}

// The application is watching for changes to the list of containers to provide useContainer with the initial data!
(function init() {
    emitter.on('container_list_change', (containers, containersChanges) => {
        _containers[0] = containers;
        _containers[1] = containersChanges;
    })
}());

export function stop(){
    emitter.off('container_list_change');
}

export function printstate(stat) {
    if (!stat) return '';
    return stat[0].length + ' +' + stat[1].added.length + ' -' + stat[1].removed.length;
}

export function useContainers(){
    const [state, setState] = useState(_containers);

    useEffect(() => {
        let _handler = emitter.on('container_list_change', (...stat) => {
            console.log('[ON container_list_change HOOK %s]', printstate(stat));
            setState(stat)
        });
        return () => {
            emitter.off('container_list_change', _handler);
            _handler = null;
        }
    }, []);

    return state;
}

