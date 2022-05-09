import { DateZ } from "libs/DatePicker/dates";
import { remove_spaces } from "utils/strings";
import { addModel$, updateModel$ } from 'helpers/api';
import md5 from 'utils/md5'; 

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

    get body() {
        return {
            parameters: this.atbd_parameters,
            metadata: this.metadata
        }
    }

    export(formatted = false) {
        if (formatted) {
            JSON.stringify(this.body, null, '\t')
        }
        return JSON.stringify(this.body)
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

    /**
     * 
     * @param {Object} data = {id, user_id, user_name, properties : {state, metadata}}
     * @returns 
     */
    static validateProperties(data) {
        return data.properties && data.properties.state && data.properties.metadata;
    }

    get dataset_id() {
        return [this.metadata.zone, this.metadata.year, this.metadata.depth_min, this.metadata.depth_max].join('-')
    }

    get dataread_id() {
        return md5(JSON.stringify(this.atbd_parameters));
    }

    get destination_dataimport_path() {
        return '/media/share/data/' + this.dataset_id;
    }

    get destination_dataread_path() {
        return '/media/share/results/' + this.dataset_id + '/' + this.dataread_id;
    }

    synchronize() {
        return this.id !== null 
            ? updateModel$(this.id, this.body) 
            : addModel$(this.body);
    }
}
