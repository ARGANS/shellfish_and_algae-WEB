const CHECK_ACTIONS = {
    checkFile: 'file_exists'
}

export const pipeline_manifest = {
    // [stage_id]: props
    dataimport: {
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/start.mark`
            },
            completed: {
                // Proofs that the task finished, and results are corrected
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/end.mark`
            }
        },
        container: {
            image: 'ac-import/runtime:latest',
            environment: {
                INPUT_DESTINATION: (model) => `/media/share/data/${model.dataset_id}`,
                INPUT_PARAMETERS: (model) => JSON.stringify(model.dataset_parameters),
                MOTU_LOGIN: "mjaouen",
                MOTU_PASSWORD: "Azerty123456",
                PYTHONDONTWRITEBYTECODE: '1',
            },
            labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'dataimport',
            },
            volumes: [
                'ac_share:/media/share',
                'ac_global:/media/global'
            ]
        },
        dir: (model) => `/media/share/data/${model.dataset_id}`
    },
    pretreatment: {
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_pretreated/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_pretreated/end.mark`
            }
        },
        container: {
            image: 'ac-pretreatment/runtime',
            environment: {
                INPUT_SOURCE: (model) => `/media/share/data/${model.dataset_id}`,
                INPUT_DESTINATION: (model) => `/media/share/data/${model.dataset_id}/_pretreated`,
                PYTHONDONTWRITEBYTECODE: '1',
            },
            labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'pretreatment',
            },
            volumes: [
                'ac_share:/media/share',
                'ac_global:/media/global'
            ]
        },
        dir: (model) => `/media/share/data/${model.dataset_id}/_pretreated`
    },
    dataread: {
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}/end.mark`
            }
        },
        container: {
            image: 'ac-dataread/runtime',
            environment: {
                INPUT_SOURCE: (model) => `/media/share/data/${model.dataset_id}/_pretreated`,
                INPUT_DESTINATION: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}`,
                INPUT_MODEL_PROPERTIES_JSON: (model) => JSON.stringify(model.body),
                PYTHONDONTWRITEBYTECODE: '1',
            },
            labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'dataread',
            },
            volumes: [
                'ac_share:/media/share',
                'ac_global:/media/global'
            ]
        },
        dir: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}`,
    },
    posttreatment: {
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}/posttreatment/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}/posttreatment/end.mark`
            }
        },
        container: {
            image: 'ac-posttreatment/runtime',
            environment: {
                SOURCE_DIR: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}`,
                PYTHONDONTWRITEBYTECODE: '1',
            },
            labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'posttreatment',
            },
            volumes: [
                'ac_share:/media/share',
                'ac_global:/media/global'
            ]
        },
        dir: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}/posttreatment`
    }
}

// TODO get/check containers from the service. Create this service from the component used to display the list of containers.

export function compilePipelineManifest(manifest, simulationModel) {
    // Return s the list of containers and files to check
    return Object.entries(manifest).reduce((state, [stageName, stageProps]) => {

        return Object.entries(stageProps.status).reduce((state, [checkName, checkProps]) => {

            if (checkProps.action === CHECK_ACTIONS.checkFile) {
                state.files.push({
                    path: checkProps.path(simulationModel),
                    stage_id: stageName,
                    check_id: checkName
                })
            }

            return state;
        }, state);

    }, {
        files: []
    })
}
