export default class SimulationModel {
    atbd_parameters = null;
    metadata = null;

    constructor() {

    }
    
    init(state, metadata) {
        this.atbd_parameters = state;
        this.metadata = metadata;
    }

    export() {
        return JSON.stringify({
            parameters: this.atbd_parameters,
            metadata: this.metadata
        }, null, '\t')
    }
}