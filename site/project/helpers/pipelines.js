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

const BASE_MODEL_LIST = ['dataimport', 'pretreatment', 'dataread', 'posttreatment', 'OptimalFarmsRepartition'];
export const pipeline_manifest = {
    _JOB_LIST: (model) => {
        // NutrientImpact should only be available to algae!
        const list = [...BASE_MODEL_LIST];
        if (model.type === 'Algae') list.push('NutrientImpact');
        return list;
    },
    
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
    },
    // _nutrientimpact
    NutrientImpact: {
        title: 'Nutrient impact',
        status: {
            started: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_nutrientimpact/start.mark`
            },
            completed: {
                action: CHECK_ACTIONS.checkFile,
                path: (model) => `/media/share/data/${model.id}/_nutrientimpact/end.mark`
            }
        },
        container: {
            Image: 'ac-dataread/runtime',
            ...CONTAINER_CONF,
            Env: (model) => ([
                `INPUT_SOURCE=/media/share/data/${model.id}/_pretreated`,
                `INPUT_DESTINATION=/media/share/data/${model.id}/_nutrientimpact`,
                'INPUT_MODEL_PROPERTIES_JSON='+ JSON.stringify(model.body),
                'RUN_SIMULATION_WITH_FARMS=1',
                'PYTHONDONTWRITEBYTECODE=1',
            ]),
            Labels: {
                'container.action:termination.notification.link': 'mailto:{{user_email}}?subject=Shellfish and Algae platform: model {{model_id}}&body=This email is just to let you know that the NutrientImpact task has been completed.',
                'task.model.id': '{{model_id}}',
                'task.model.type': '{{model_type}}',
                // has an impact on tracking pipeline tasks!
                'task.type': 'NutrientImpact',
                'task.user': '{{user_username}}'
            },
        },
        dir: (model) => `/media/share/data/${model.id}/_nutrientimpact`,
    },
}

export const JOB_STATUS = {
    not_started: 0,
    in_progress: 1,
    completed: 2,
    failed: 3
}

export function compilePipelineManifest(manifest, simulationModel) {
    
    const jobs = manifest._JOB_LIST(simulationModel);
    // Return s the list of containers and files to check
    return {
        jobs,

        init_job_status: jobs.reduce((state, jobId) => {
            state[jobId] = JOB_STATUS.not_started;
            return state;
        }, {}),
        
        init_job_disable_status: jobs.reduce((state, jobId, index) => {
            state[jobId] = index > 0; // <is step disabled>
            return state;
        }, {}),

        files: Object.entries(manifest)
            .reduce((state, [stageName, stageProps]) => {
                if (stageName.startsWith('_') || !stageProps.status) {
                    // Skip all manifest properties that start with an underscore
                    return state;
                }
                
        
                return Object.entries(stageProps.status).reduce((state, [checkName, checkProps]) => {
                    if (checkProps.action === CHECK_ACTIONS.checkFile) {
                        state.push({
                            path: checkProps.path(simulationModel),
                            stage_id: stageName,
                            check_id: checkName
                        })
                    }
        
                    return state;
                }, state);
            }, [])
    }
}
