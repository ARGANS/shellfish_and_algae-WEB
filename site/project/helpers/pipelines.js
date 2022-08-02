export const pipeline_manifest = {
    // [stage_id]: props
    dataimport: {
        status: {
            // DEPRECATED
            // [check_id]: props
            // in_progress: {
            //     action: 'container_exists',
            // },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id}/start.mark`
            },
            completed: {
                action: 'file_exists',
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
        }
    },
    pretreatment: {
        status: {
            // DEPRECATED
            // in_progress: {
            //     action: 'container_exists',
            // },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id}/_pretreated/start.mark`
            },
            completed: {
                action: 'file_exists',
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
        }
    },
    dataread: {
        status: {
            // DEPRECATED
            // in_progress: {
            //     action: 'container_exists',
            // },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}/start.mark`
            },
            completed: {
                action: 'file_exists',
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
        }
    },
    posttreatment: {
        status: {
            // DEPRECATED
            // in_progress: {
            //     action: 'container_exists',
            // },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id}/_dataread/${model.dataread_id}/posttreatment/start.mark`
            },
            completed: {
                action: 'file_exists',
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
        }
    }
}

// TODO get/check containers from the service. Create this service from the component used to display the list of containers.

export function compilePipelineManifest(manifest, simulationModel) {
    // Return s the list of containers and files to check
    return Object.entries(manifest).reduce((state, [stageName, stageProps]) => {

        return Object.entries(stageProps.status).reduce((state, [checkName, checkProps]) => {
            // DEPRECATED
            // if (checkProps.action == 'container_exists') {
            //     state.containers.push({
            //         container_labels: stageProps.container.labels,
            //         stage_id: stageName,
            //         check_id: checkName
            //     })
            // }
            // else 
            if (checkProps.action == 'file_exists') {
                state.files.push({
                    path: checkProps.path(simulationModel),
                    stage_id: stageName,
                    check_id: checkName
                })
            }

            return state;
        }, state);

    }, {
        // DEPRECATED
        // containers: [],
        files: []
    })
}




///
// {'type': 'get_file', 'path': destination_dataimport_path + '/task.mark'},
//         {'type': 'get_file', 'path': destination_dataimport_path + '/parameters.json'},
//         data_import: {
//             completed: report[0] !== FNF,
//             started: report[1] !== FNF, // The task has been started
//         },


// fileStatus.data_import.in_progress = !!dataImportContainerData;
//         fileStatus.data_import.not_started = !fileStatus.data_import.completed && !fileStatus.data_import.in_progress;
//         fileStatus.data_import.failed = fileStatus.data_import.started && !fileStatus.data_import.in_progress;
