const API_PREFIX = '/api/v1';
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
    }).
        then(validateJSONResponse).
        then(parseJSON);
}


export function addModel$(data) {
    return fetch(API_PREFIX + '/data/models', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(data)
    }).
        then(validateJSONResponse).
        then(parseJSON);
}


export function updateModel$(id, data) {
    return fetch(API_PREFIX + '/data/models/' + id, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(data)
    }).
    then(validateJSONResponse).
    then(parseJSON);
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
    }).
    then(validateJSONResponse).
    then(parseJSON);
}
