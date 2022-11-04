import { useEffect, useState } from "react";
import EventEmitter from "./eventEmitter";


const CHANNELS = {};

function getEmitter(hostId) {
	if (!CHANNELS.hasOwnProperty(hostId)) return;
	if (!(CHANNELS[hostId] instanceof EventEmitter)) return;
	return CHANNELS[hostId];
}


export const DEFAULT_CHANNEL = 'default';

export function removeLastComponent(hostId=DEFAULT_CHANNEL) {
	const emitter = getEmitter(hostId);

	if (!emitter) return;
	emitter.emit('removeLast');
}

export function removeAllComponents(hostId=DEFAULT_CHANNEL) {
	const emitter = getEmitter(hostId);

	if (!emitter) return;
	emitter.emit('removeAll');
}

export function addComponent(component, hostId=DEFAULT_CHANNEL) {
	const emitter = getEmitter(hostId);

	if (!emitter) return;
	emitter.emit('add', component);
}

export function filterComponents(callback, hostId=DEFAULT_CHANNEL) {
	const emitter = getEmitter(hostId);

	if (!emitter) return;
	emitter.emit('filterComponets', callback);
}



function useComponentHost(hostId = DEFAULT_CHANNEL) {
	const [componentList, setComponentList] = useState([]);
	useEffect(() => {
		const emitter = new EventEmitter();

		// TODO use useCallback for all callbacks
		// emitter.on('add', component => setComponentList(list => [...list, component]));
		emitter.on('add', component => setComponentList(list => list.concat(component)));
		emitter.on('removeAll', () => setComponentList(() => []));
		emitter.on('removeLast', () => setComponentList(list => list.slice(0, -1)));
		emitter.on('filterComponets', callback => setComponentList(list => list.filter(callback)));

		CHANNELS[hostId] = emitter;

		return () => {
			if (!CHANNELS[hostId]) return;
			CHANNELS[hostId].off();
			delete CHANNELS[hostId];
		};
	}, [hostId]);

	return componentList;
}

export function ComponentHeap(props) {
	const hostId = props.id || DEFAULT_CHANNEL;
	const dialogs = useComponentHost(hostId);
	const hostprops = {
		'data-host': hostId,
		tabIndex: 1,
	};
	if (props.zIndex) {
		hostprops.style = {zIndex: props.zIndex};
	}

	return <div {...hostprops}>{ dialogs }</div>
}
