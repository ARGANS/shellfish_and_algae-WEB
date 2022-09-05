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
    // [stage_id]: props
    dataimport: {
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_dataset/start.mark`
            },
            completed: {
                // Proofs that the task finished, and results are corrected
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.dataset_id}/_dataset/end.mark`
            }
        },
        container: {
            // TODO comment in the task-runner
            // image: 'ac-import/runtime:latest',
            // environment: {
            //     INPUT_DESTINATION: (model) => `/media/share/data/${model.dataset_id}/_dataset`,
            //     INPUT_PARAMETERS: (model) => JSON.stringify(model.dataset_parameters),
            //     MOTU_LOGIN: "mjaouen",
            //     MOTU_PASSWORD: "Azerty123456",
            //     PYTHONDONTWRITEBYTECODE: '1',
            // },
            // labels: {
            //     'task.model.id': (model) => model.id + '',
            //     'task.type': 'dataimport',
            //     'task.user': '{{user}}'
            // },
            // volumes: [
            //     'ac_share:/media/share',
            //     'ac_global:/media/global'
            // ],


            //  TODO use ... for common settings
            ...CONTAINER_CONF,
            Image: 'ac-import/runtime:latest',
            Env: (model) => ([
                `INPUT_DESTINATION=/media/share/data/${model.dataset_id}/_dataset`,
                'INPUT_PARAMETERS=' + JSON.stringify(model.dataset_parameters) + '',
                'MOTU_LOGIN=mjaouen',
                'MOTU_PASSWORD=Azerty123456',
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'dataimport',
                'task.user': '{{user}}'
            },
        },
        dir: (model) => `/media/share/data/${model.dataset_id}/_dataset`
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
            Image: 'ac-pretreatment/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `INPUT_SOURCE=/media/share/data/${model.dataset_id}/_dataset`,
                `INPUT_DESTINATION=/media/share/data/${model.dataset_id}/_pretreated`,
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'pretreatment',
                'task.user': '{{user}}'
            },
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
            Image: 'ac-dataread/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `INPUT_SOURCE=/media/share/data/${model.dataset_id}/_pretreated`,
                `INPUT_DESTINATION=/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}`,
                'INPUT_MODEL_PROPERTIES_JSON='+ JSON.stringify(model.body),
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'dataread',
                'task.user': '{{user}}'
            },
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
            Image: 'ac-posttreatment/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `SOURCE_DIR=/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}`,
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'task.model.id': (model) => model.id + '',
                'task.type': 'posttreatment',
                'task.user': '{{user}}'
            },
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
