import EventEmitter from "libs/ComponentHeap/eventEmitter";
import { cloneArray } from "utils/deepClone";
import { getContainers$ } from "./api";

function fromPythonDate(date) {
    return new Date((date - 0) * 1000);
}

export const containerService = new (class {
    constructor() {
        this._state = [];
        this.emitter = new EventEmitter();

        if (typeof(window) === 'object') {
            window.addEventListener('DOMContentLoaded', (event) => {
                this._init()
            });
        }
        
    }

    _init() {
        console.warn('INIT Container2_service')

        getContainers$().then((containers) => {
            console.log('[Container]')
            console.dir(containers);

            return containers.map(containerData => {
                containerData.started_at = Date.parse(containerData.started_at ? containerData.started_at : containerData.state.StartedAt)
                return containerData;
            })
                .sort((a, b) => b.started_at - a.started_at);
        }).then((containers) => {
            this.setState(containers)
            this.emitter.emit('container_list_change', cloneArray(this._state), null)
        });

        this._evtSource = new EventSource('/api/v2/stream/events/container');

        this._evtSource.onmessage = (e) => {
            const response = JSON.parse(e.data)
            console.log('SSE Response')
            console.dir(response)
            const containerModel = this.constructor.transformContainerEventToContainerModel(response)

            let mutator;

            if (response.Action === 'create' || response.Action === 'start') {
                mutator = (_models) => {
                    const pos = _models.findIndex(model => model.id === containerModel.id)

                    if (pos < 0) {
                        return [containerModel, ..._models];
                    }

                    return _models;
                }
            } 
            else if (response.Action === 'die' || response.Action === 'destroy') {
                mutator = (_models) => {
                    const pos = _models.findIndex(model => model.id === containerModel.id)
                    
                    if (pos > -1) {
                        return [..._models.slice(0, pos), ..._models.slice(pos + 1)];
                    }
                    
                    return _models;
                }
            } 

            if (mutator) {
                const previousState = this._state;
                this.setState(mutator);

                console.log('[Service] shallow check %s prev: %s  next: %s', previousState !== this._state, this.constructor.print(previousState), this.constructor.print(this._state));

                if (previousState !== this._state) {
                    const removedItem = (response.Action === 'die' || response.Action === 'destroy') && containerModel
                    this.emitter.emit('container_list_change', cloneArray(this._state), removedItem)
                }
            }
        };
    }

    setState(newState) {
        if (typeof(newState) === 'function') {
            this._state = newState(this._state);
        } else {
            this._state = newState
        }
    }

    destroy() {
        this._evtSource.close();
        this.emitter.off();
    }

    /*
        @input {String} data.Action - create/start/die/destroy
        @input data.id
        @input data.time
        @input data.status
        @input data.from - image
        @input data.Actor.Attributes
        @input data.Actor.Attributes.image
        @input data.Actor.Attributes.name

        @return ret.id
        @return ret.image
        @return ret.labels
        @return ret.name
        @return ret.short_id
    */
    static transformContainerEventToContainerModel(data) {
        if (!data.hasOwnProperty('Actor')) {
            console.log('[No Actor]');
            console.dir(data);
        }

        if (data.hasOwnProperty('original')) {
            return {
                id: data.id,
                image: data.original.Actor.Attributes.image,
                name: data.original.Actor.Attributes.name,
                short_id: data.id.substr(0, 10),
                labels: data.original.Actor.Attributes,
                started_at: fromPythonDate(data.time),
                _origin: data.original,    
            }
        }

        return {
            id: data.id,
            image: data.Actor.Attributes.image,
            name: data.Actor.Attributes.name,
            short_id: data.id.substr(0, 10),
            labels: data.Actor.Attributes,
            started_at: fromPythonDate(data.time),
            _origin: data,
        }
    }

    static print(models) {
        return models.map(model => model.name).join(',')
    }
})
