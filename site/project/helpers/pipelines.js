export const pipeline_manifest = {
    // [stage_id]: props
    dataimport: {
        status: {
            // [check_id]: props
            in_progress: {
                action: 'container_exists',
                container_id: (model) => model.metadata?.containers?.dataimport 
            },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/start.mark`
            },
            completed: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/end.mark`
            }
        }
    },
    pretreatment: {
        status: {
            in_progress: {
                action: 'container_exists',
                container_id: (model) => model.metadata?.containers?.pretreatment
            },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/_pretreated/start.mark`
            },
            completed: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/_pretreated/end.mark`
            }
        }
    },
    dataread: {
        status: {
            in_progress: {
                action: 'container_exists',
                container_id: (model) => model.metadata?.containers?.pretreatment
            },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/_dataread/${model.dataread_id}/start.mark`
            },
            completed: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/_dataread/${model.dataread_id}/end.mark`
            }
        }
    },
    posttreatment: {
        status: {
            in_progress: {
                action: 'container_exists',
                container_id: (model) => model.metadata?.containers?.pretreatment
            },
            started: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/_dataread/${model.dataread_id}/posttreatment/start.mark`
            },
            completed: {
                action: 'file_exists',
                path: (model) => `/media/share/data/${model.dataset_id[0]}/_dataread/${model.dataread_id}/posttreatment/end.mark`
            }
        }
    }
}

// TODO get/check containers from the service. Create this service from the component used to display the list of containers.

export function compilePipelineManifest(manifest, simulationModel) {
    // Return s the list of containers and files to check
    return Object.entries(manifest).reduce((state, [stageName, stageProps]) => {

        return Object.entries(stageProps.status).reduce((state, [checkName, checkProps]) => {
            if (checkProps.action == 'container_exists') {
                // DEPRECATED
                // if (!state.containers[stageName])  state.containers[stageName] = {};
                // state.containers[stageName][checkName] = checkProps.container_id(simulationModel);
                state.containers.push({
                    container_id: checkProps.container_id(simulationModel),
                    stage_id: stageName,
                    check_id: checkName
                })
            }
            else if (checkProps.action == 'file_exists') {
                // DEPRECATED
                // if (!state.files[stageName])  state.files[stageName] = {};
                // state.files[stageName][checkName] = checkProps.path(simulationModel);
                state.files.push({
                    path: checkProps.path(simulationModel),
                    stage_id: stageName,
                    check_id: checkName
                })
            }

            return state;
        }, state);

    }, {
        containers: [],
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
