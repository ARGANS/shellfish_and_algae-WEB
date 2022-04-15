import { DateZ } from "libs/DatePicker/dates";

export default class SimulationModel {
    atbd_parameters = null;
    metadata = null;
    id = null;
    user_id = null;

    constructor(id, user_id) {
        this.id = id;
        this.user_id = user_id;
    }

    init(state, metadata) {
        this.atbd_parameters = state;
        this.metadata = metadata;
        return this;
    }

    export() {
        return JSON.stringify({
            parameters: this.atbd_parameters,
            metadata: this.metadata
        }, null, '\t')
    }

    static createDefaultATBDParameters(scheme) {
        return Object.entries(scheme)
            .reduce(function (store, [sectionName, {defaults}]) {
                const sectionNames = Object.keys(defaults).sort()
                const defaultSection = sectionNames[0]
        
                store[sectionName] = {
                    [defaultSection]: {
                        options: defaults[defaultSection].options,
                        parameters: defaults[defaultSection].parameters
                    } 
                }
                return store;
            }, {});
    }

    static createDefaultMetadata(initData) {
        return {
            name: '',
            zone: initData.zones[0],
            _suggested: {
                login: '<username>',
                species: 'Alaria',
                zone: initData.zones[0],
                date: DateZ.from().DDMMYYYY('-'),    
            },
            depth_min: 0,
            depth_max: 0,
            year: new Date().getFullYear()
        }
    }
}
