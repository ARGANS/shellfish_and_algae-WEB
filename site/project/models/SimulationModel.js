import { DateZ } from "libs/DatePicker/dates";
import { remove_spaces } from "utils/strings";

export default class SimulationModel {
    atbd_parameters = null;
    metadata = null;
    id = null;
    owner_id = null;
    owner_name = null;

    constructor(id, owner_id, owner_name) {
        this.id = id;
        this.owner_id = owner_id;
        this.owner_name = owner_name;
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

    static createDefaultMetadata(initData, login) {
        return {
            name: '',
            zone: initData.zones[0],
            _suggested: {
                login: remove_spaces(login),
                species: 'Alaria',
                zone: remove_spaces(initData.zones[0]),
                date: DateZ.from().DDMMYYYY('-'),    
            },
            depth_min: 0,
            depth_max: 0,
            year: new Date().getFullYear()
        }
    }
}
