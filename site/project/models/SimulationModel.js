import { DateZ } from "libs/DatePicker/dates";
import { remove_spaces } from "utils/strings";
import { addModel$, updateModel$ } from 'helpers/api';
import md5 from 'utils/md5'; 

export default class SimulationModel {
    atbd_parameters = null;
    metadata = null;
    dataset_parameters = null;
    id = null;
    owner_id = null;
    owner_name = null;
    type = null;

    constructor(id, owner_id, owner_name, type_s) {
        this.id = id;
        this.owner_id = owner_id;
        this.owner_name = owner_name;
        this.type = type_s; // Algae | Shellfish
    }

    init(parameters, metadata, dataset_parameters) {
        this.atbd_parameters = parameters;
        this.metadata = metadata;
        this.dataset_parameters = dataset_parameters;
        return this;
    }

    get body() {
        return {
            parameters: this.atbd_parameters,
            metadata: this.metadata,
            dataset_parameters: this.dataset_parameters,
            type: this.type,
        }
    }

    export(formatted = false) {
        if (formatted) {
            return JSON.stringify(this.body, null, '\t')
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

    static createDefaultMetadata(defaultZone, login, defaultSpecies) {
        return {
            name: '',
            zone: defaultZone,
            _suggested: {
                login: remove_spaces(login),
                species: defaultSpecies, 
                zone: remove_spaces(defaultZone),
                date: DateZ.from().DDMMYYYY('-'),    
            },
            scenario: 'A',
        }
    }

    static createDefaultDatasetParameters() {
        return {
            'depth-min': 0,
            'depth-max': 20,
            // year: new Date().getFullYear()
            year: 2021,
            datasets: {},
        }
    }

    /**
     * 
     * @param {Object} data = {id, user_id, user_name, properties : {parameters, metadata}}
     * @returns 
     */
    static validateProperties(data) {
        return data.properties && data.properties.parameters && data.properties.metadata && data.properties.dataset_parameters;
    }

    get dataset_id() {
        const dataset_serialized = JSON.stringify(this.dataset_parameters);
        return md5(dataset_serialized);
    }

    get dataread_id() {
        return md5(JSON.stringify(this.atbd_parameters));
    }

    synchronize() {
        return this.id !== null 
            ? updateModel$(this.id, this.body) 
            : addModel$(this.body);
    }

    static fromJSON({id, user_id, user_name, properties : {parameters, metadata, type, dataset_parameters}}) {
        return new SimulationModel(id, user_id, user_name, type)
            .init(parameters, metadata, dataset_parameters);
    }
}
