const API_PREFIX = '/api/v1';
const NODE_API_PREFIX = '/api/v2';
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

export function getTaskStatus$(simulationModel) {
    const commands = [
        {'type': 'get_file', 'path': '/media/share/data/' + simulationModel.dataset_id + '/task.mark'},
        {'type': 'get_file', 'path': '/media/share/data/' + simulationModel.dataset_id + '/parameters.json'},
        {'type': 'get_file', 'path': '/media/share/results/' + simulationModel.dataset_id + '/task.mark'},
        {'type': 'get_file', 'path': '/media/share/results/' + simulationModel.dataset_id + '/parameters.json'},
    ]
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
                .then(parseJSON)
                .then(function(report) {
                    return {
                        data_import: {
                            completed: report[0] !== FNF,
                            in_progress: report[1] !== FNF,
                            not_started: (report[0] !== FNF) && (report[1] !== FNF),
                        },
                        data_read: {
                            completed: (report[2] !== FNF),
                            in_progress: (report[3] !== FNF),
                            not_started: (report[2] !== FNF) && (!report[3] !== FNF),
                        }
                    }
                });
        })
        .catch(error => {
            console.log('Cannot download the endpoint');
            console.dir(error)
        });

        
}
