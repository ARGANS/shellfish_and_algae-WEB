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

export function getModels$(type_s) {
    return fetch(API_PREFIX + '/data/models' + (type_s ? '?filter_property=properties.type&filter_value=' + type_s : ''), {
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

export const FNF = 'FileNotFound';

export function checkFiles$(checkList) {
    const commands = checkList.map(checkProps => ({
        type: 'get_file',
        path: checkProps.path
    })) 
    
    return fetch(NODE_API_PREFIX + '/batch', {
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
                .then(parseJSON);
        })
        .catch(error => {
            console.log('Cannot request the endpoint /batch');
            console.dir(error)
        })
}


function postJSON$(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: typeof(data) !== 'string' ? JSON.stringify(data) : data
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


export function runContainer$(manifest_s){
    return postJSON$(NODE_API_PREFIX + '/container', manifest_s);
}


//  DEPRECATED
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

//  DEPRECATED
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
