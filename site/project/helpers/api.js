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
const BATCH_ACTION_ENDPOINT = '/batch2'; //'/batch'

export function checkFiles$(checkList) {
    const commands = checkList.map(checkProps => ({
        type: 'get_file',
        path: checkProps.path
    })) 
    
    return fetch(NODE_API_PREFIX + BATCH_ACTION_ENDPOINT, {
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
            console.log('Cannot request the endpoint %s', BATCH_ACTION_ENDPOINT);
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


export function deleteResults$(path_s) {
    return postJSON$(NODE_API_PREFIX + BATCH_ACTION_ENDPOINT, [
        {
            type: 'rm', 
            path: path_s
        },
    ]);
}


export function stopContainer$(containerId_s) {
    const url = NODE_API_PREFIX + '/container/' + containerId_s
    return fetch(url, {
        method: 'DELETE',
        headers: JSON_HEADERS,
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
        });
}


export function getLogs$(containerId, limit_n) {
    const link = NODE_API_PREFIX + '/log/container?id=' + containerId + '&tail=' + limit_n;
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

export function getContainers$() {
    const link = NODE_API_PREFIX + '/container';
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

export function uploadFiles$(formData) {
    const link = NODE_API_PREFIX + '/upload';
    
    return fetch(link, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
        }
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
