const API_PREFIX = '/api/v1';
export const NODE_API_PREFIX = '/api/v2';
export const EXCEPTION_403 = 'Not authorized';


function validateJSONResponse(response) {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError(EXCEPTION_403);
    }
    return response
}
function parseJSON(response) {
    return response.json();
}
const JSON_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export function getModels$() {
    return fetch(API_PREFIX + '/data/models', {
        method: 'GET',
        headers: JSON_HEADERS
    })
        .then(validateJSONResponse)
        .then(parseJSON);
}


export function addModel$(data) {
    return fetch(API_PREFIX + '/data/models', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(data)
    })
        .then(validateJSONResponse)
        .then(parseJSON);
}


export function updateModel$(id, data) {
    return fetch(API_PREFIX + '/data/models/' + id, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(data)
    })
        .then(validateJSONResponse)
        .then(parseJSON);
}

export function deleteModel$(id) {
    return fetch(API_PREFIX + '/data/models/' + id, {
        method: 'DELETE',
    });
}

export function getActiveUser$() {
    return fetch(API_PREFIX + '/auth/whoami', {
        method: 'GET',
        headers: JSON_HEADERS,
    })
        .then(validateJSONResponse)
        .then(parseJSON);
}

const FNF = 'FileNotFound';


/**
 * 
 * @param {SimulationModel} simulationModel 
 * @returns {Promise<Object>} fileStatus
 *  {bool} fileStatus.data_import.in_progress
    {bool} fileStatus.data_import.not_started
    {bool} fileStatus.data_import.failed

    {bool} fileStatus.data_read.in_progress
    {bool} fileStatus.data_read.not_started
    {bool} fileStatus.data_read.failed

    {bool} fileStatus.postprocessing.in_progress
    {bool} fileStatus.postprocessing.not_started
    {bool} fileStatus.postprocessing.failed
 */
export function getPipelineStatus$(simulationModel) {
    const {destination_dataimport_path, destination_dataread_path, destination_postprocessing_path} = simulationModel;
    const {data_import_container, data_read_container, postprocessing_container} = simulationModel.metadata;
    const commands = [
        // Proofs that the task finished, and results are corrected
        {'type': 'get_file', 'path': destination_dataimport_path + '/task.mark'},
        {'type': 'get_file', 'path': destination_dataimport_path + '/parameters.json'},
        {'type': 'get_file', 'path': destination_dataread_path + '/task.mark'},
        {'type': 'get_file', 'path': destination_dataread_path + '/parameters.json'},
        {'type': 'get_file', 'path': destination_postprocessing_path + '/start.mark'},
        {'type': 'get_file', 'path': destination_postprocessing_path + '/end.mark'},
    ]

    return Promise.all([
        data_import_container 
            ? getContainer$(data_import_container)
            : Promise.resolve(null),
        data_read_container
            ? getContainer$(data_read_container)
            : Promise.resolve(null),
        postprocessing_container
            ? getContainer$(postprocessing_container)
            : Promise.resolve(null),
            // Get file stat
        fetch(NODE_API_PREFIX + '/batch', {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify(commands)
        })
            .then(response => {
                if (!response.ok) {
                    // This trick helps to avoid messages about exception in the JSON.parse method and get a right reason of the error
                    return Promise.reject(response);
                }
                return Promise.resolve(response)
                    .then(validateJSONResponse)
                    .then(parseJSON)
                    .then(function(report) {
                        return {
                            data_import: {
                                completed: report[0] !== FNF,
                                started: report[1] !== FNF, // The task has been started
                            },
                            data_read: {
                                completed: (report[2] !== FNF),
                                started: (report[3] !== FNF),
                            },
                            postprocessing: {
                                completed: (report[4] !== FNF),
                                started: (report[5] !== FNF),
                            }
                        }
                    });
            })
            .catch(error => {
                console.log('Cannot request the endpoint /batch');
                console.dir(error)
            })
    ]).then(([dataImportContainerData, dataReadContainerData, postProcessingContainerData, fileStatus]) => {
        // TODO check information about containers
        console.log('Check container data:');
        console.dir([dataImportContainerData, dataReadContainerData, fileStatus]);
        
        // The container data is proof that the task is running
        // File statistics can lie if we stop the container with a command from the cli utility
        
        fileStatus.data_import.in_progress = !!dataImportContainerData;
        fileStatus.data_import.not_started = !fileStatus.data_import.completed && !fileStatus.data_import.in_progress;
        fileStatus.data_import.failed = fileStatus.data_import.started && !fileStatus.data_import.in_progress;

        fileStatus.data_read.in_progress = !!dataReadContainerData;
        fileStatus.data_read.not_started = !fileStatus.data_read.completed && !fileStatus.data_read.in_progress;
        fileStatus.data_read.failed = fileStatus.data_read.started && !fileStatus.data_read.in_progress;

        fileStatus.postprocessing.in_progress = !!postProcessingContainerData;
        fileStatus.postprocessing.not_started = !fileStatus.postprocessing.completed && !fileStatus.postprocessing.in_progress;
        fileStatus.postprocessing.failed = fileStatus.postprocessing.started && !fileStatus.postprocessing.in_progress;
        
        return fileStatus;
    });
}

function postJSON$(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                // This trick helps to avoid messages about exception in the JSON.parse method and get a right reason of the error
                return Promise.reject(response);
            }
            return Promise.resolve(response)
                .then(validateJSONResponse)
                .then(parseJSON)
        })
        .catch(error => {
            console.log('Cannot request the endpoint %s', url);
            console.dir(error);
        });
}

export function runDataImportTask$(simulationModel){
    return postJSON$(NODE_API_PREFIX + '/container', {
        image: 'ac-import/runtime:latest',
        environment: {
            INPUT_DESTINATION: '/media/share/data/' + simulationModel.dataset_id,
            INPUT_PARAMETERS: JSON.stringify({
                zone: simulationModel.metadata.zone,
                depth_min: simulationModel.metadata.depth_min,
                depth_max: simulationModel.metadata.depth_max,
                year: simulationModel.metadata.year
            }),
            PYTHONDONTWRITEBYTECODE: '1',
        },
        hosts: {},
        volumes: ['ac_share:/media/share']
    });
}

export function runDataReadTask$(simulationModel){
    return postJSON$(NODE_API_PREFIX + '/container', {
        image: 'ac-processing/runtime:latest',
        environment: {
            DATASET_ID: simulationModel.dataset_id,
            TASK_ID: simulationModel.dataread_id,
            PARAMETERS_JSON: simulationModel.export(),
            PYTHONDONTWRITEBYTECODE: '1',
        },
        hosts: {},
        volumes: ['ac_share:/media/share']
    });
}

export function runPostprocessingTask$(simulationModel){
    return postJSON$(NODE_API_PREFIX + '/container', {
        image: 'ac-posttreatment/runtime:latest',
        environment: {
            SOURCE_DIR: simulationModel.destination_dataread_path,
            PYTHONDONTWRITEBYTECODE: '1',
        },
        hosts: {},
        volumes: ['ac_share:/media/share']
    });
}

export function deleteDataImportResults$(simulationModel) {
    return postJSON$(NODE_API_PREFIX + '/batch', [
        {'type': 'rm', 'path': simulationModel.destination_dataimport_path},
    ]);
}

export function deleteDataReadResults$(simulationModel) {
    return postJSON$(NODE_API_PREFIX + '/batch', [
        {'type': 'rm', 'path': simulationModel.destination_dataread_path},
    ]);
}

export function deletePostprocessingResults$(simulationModel) {
    return postJSON$(NODE_API_PREFIX + '/batch', [
        {'type': 'rm', 'path': simulationModel.destination_postprocessing_path},
    ]);
}


export function getLogs$(containerId, limit_n) {
    const link = NODE_API_PREFIX + '/container/log?id=' + containerId + '&tail=' + limit_n;
    return fetch(link, {
        method: 'GET',
        headers: JSON_HEADERS
    })
        .then(response => {
            if (!response.ok) {
                // This trick helps to avoid messages about exception in the JSON.parse method and get a right reason of the error
                return Promise.reject(response);
            }
            return Promise.resolve(response)
                .then(validateJSONResponse)
                .then(parseJSON);
        })
        .catch(error => {
            console.log('Cannot request the endpoint %s', link);
            console.dir(error)
            return null;
        });
}

export function getContainer$(containerId) {
    const link = NODE_API_PREFIX + '/container?id=' + containerId;
    return fetch(link , {
        method: 'GET',
        headers: JSON_HEADERS
    })
        .then(response => {
            if (!response.ok) {
                // This trick helps to avoid messages about exception in the JSON.parse method and get a right reason of the error
                return Promise.reject(response);
            }
            return Promise.resolve(response)
                .then(validateJSONResponse)
                .then(parseJSON);
        })
        .catch(error => {
            console.log('Cannot request the endpoint %s', link);
            console.dir(error)
            return null;
        });
}
