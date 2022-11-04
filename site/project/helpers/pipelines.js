const CHECK_ACTIONS = {
    checkFile: 'file_exists'
}
const CONTAINER_CONF = {
    Volumes: {
        "/media/global": {},
        "/media/share": {}
    },
    HostConfig: {
        "AutoRemove": true,
        "Binds": [
            "ac_share:/media/share",
            "ac_global:/media/global"
        ],
    },
}

export const pipeline_manifest = {
    _JOB_LIST: ['dataimport', 'pretreatment', 'dataread', 'posttreatment', 'OptimalFarmsRepartition'],
    // [stage_id]: props
    dataimport: {
        title: 'Import datasets',
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_dataset/start.mark`
            },
            completed: {
                // Proofs that the task finished, and results are corrected
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_dataset/end.mark`
            }
        },
        container: {
            ...CONTAINER_CONF,
            Image: 'ac-import/runtime:latest',
            Env: (model) => ([
                `INPUT_DESTINATION=/media/share/data/${model.id}/_dataset`,
                'INPUT_PARAMETERS=' + JSON.stringify(model.dataset_parameters) + '',
                'MOTU_LOGIN=mjaouen',
                'MOTU_PASSWORD=Azerty123456',
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'container.action:termination.notification.link': 'mailto:{{user_email}}?subject=Shellfish and Algae platform: model {{model_id}}&body=This email is just to let you know that the dataimport task has been completed.',
                'task.model.id': '{{model_id}}',
                'task.type': 'dataimport',
                'task.user': '{{user_username}}'
            },
        },
        dir: (model) => `/media/share/data/${model.id}/_dataset`
    },
    pretreatment: {
        title: 'Pretreat datasets',
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_pretreated/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_pretreated/end.mark`
            }
        },
        container: {
            Image: 'ac-pretreatment/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `INPUT_SOURCE=/media/share/data/${model.id}/_dataset`,
                `INPUT_DESTINATION=/media/share/data/${model.id}/_pretreated`,
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'container.action:termination.notification.link': 'mailto:{{user_email}}?subject=Shellfish and Algae platform: model {{model_id}}&body=This email is just to let you know that the pretreatment task has been completed.',
                'task.model.id': '{{model_id}}',
                'task.type': 'pretreatment',
                'task.user': '{{user_username}}'
            },
        },
        dir: (model) => `/media/share/data/${model.id}/_pretreated`
    },

    // TODO `/_dataread/${model.dataread_id}` -> `/_dataread`
    
    dataread: {
        title: 'Run model simulation',
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_dataread/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_dataread/end.mark`
            }
        },
        container: {
            Image: (model) => model.type === 'Algae' ? 'ac-dataread/runtime' : 'ac-dataread_shellfish/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `INPUT_SOURCE=/media/share/data/${model.id}/_pretreated`,
                `INPUT_DESTINATION=/media/share/data/${model.id}/_dataread`,
                'INPUT_MODEL_PROPERTIES_JSON='+ JSON.stringify(model.body),
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'container.action:termination.notification.link': 'mailto:{{user_email}}?subject=Shellfish and Algae platform: model {{model_id}}&body=This email is just to let you know that the dataread task has been completed.',
                'task.model.id': '{{model_id}}',
                'task.model.type': '{{model_type}}',
                // has an impact on tracking pipeline tasks!
                'task.type': 'dataread',
                'task.user': '{{user_username}}'
            },
        },
        dir: (model) => `/media/share/data/${model.id}/_dataread`,
    },
    posttreatment: {
        title: 'Generate GeoTIFF files',
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_posttreatment/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_posttreatment/end.mark`
            }
        },
        container: {
            Image: 'ac-posttreatment/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `SOURCE_DIR=/media/share/data/${model.id}/_dataread`,
                `INPUT_DESTINATION=/media/share/data/${model.id}/_posttreatment`,
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'container.action:termination.notification.link': 'mailto:{{user_email}}?subject=Shellfish and Algae platform: model {{model_id}}&body=This email is just to let you know that the posttreatment task has been completed.',
                'task.model.id': '{{model_id}}',
                'task.type': 'posttreatment',
                'task.user': '{{user_username}}'
            },
        },
        dir: (model) => `/media/share/data/${model.id}/_posttreatment`
    },
    OptimalFarmsRepartition: {
        title: 'Calculate the optimal repartition of farms',
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_farmdistribution/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_farmdistribution/end.mark`
            }
        },
        container: {
            Image: 'ac-farmrepartition/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `INPUT_SOURCE=/media/share/data/${model.id}/_posttreatment`,
                `INPUT_DESTINATION=/media/share/data/${model.id}/_farmdistribution`,
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'container.action:termination.notification.link': 'mailto:{{user_email}}?subject=Shellfish and Algae platform: model {{model_id}}&body=This email is just to let you know that the farm distribution task has been completed.',
                'task.model.id': '{{model_id}}',
                // task.type label must be equal to the stage_id
                'task.type': 'OptimalFarmsRepartition',
                'task.user': '{{user_username}}'
            },
        },
        dir: (model) => `/media/share/data/${model.id}/_farmdistribution`
    }
}

export function compilePipelineManifest(manifest, simulationModel) {
    // Return s the list of containers and files to check
    return Object.entries(manifest).reduce((state, [stageName, stageProps]) => {
        if (stageName.startsWith('_')) {
            // Skip all manifest properties that start with an underscore
            return state;
        }

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
