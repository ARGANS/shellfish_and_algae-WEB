import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, useRef } from 'react'
import S from './PipelineModal.module.css'
import { getPipelineStatus$, runDataReadTask$, deleteDataImportResults$, deleteDataReadResults$, deletePostprocessingResults$, runPostprocessingTask$, runContainer$ } from 'helpers/api';
import ContainerLogs from 'components/ContainerLogs/ContainerLogs';
import Dialog from 'libs/Dialogs/Dialog';
import DialogHeader from 'libs/DialogHeader/DialogHeader';
import { addComponent } from 'libs/ComponentHeap/ComponentHeap';
import { classList } from 'utils/strings';
import { compilePipelineManifest, pipeline_manifest } from 'helpers/pipelines';
import { useContainers } from 'helpers/container_service';
const DynamicMap = dynamic(() => import('libs/Map/Map'), { ssr: false })

/**
 * 
 * @param {Object} state 
 */
function typeDataImportStatus(state) {
    return state.not_started 
        ? 'Not downloaded' 
        : state.in_progress 
            ? 'Downloading now'
            : state.completed
                ? 'Already downloaded'
                : '-'
}
function typeDataReadStatus(state) {
    return state.not_started 
        ? 'Not processed' 
        : state.in_progress 
            ? 'In progress now'
            : state.completed
                ? 'Already processed'
                : '-'
}



const JOB_STATUS = {
    not_started: 0,
    in_progress: 1,
    completed: 2,
    failed: 3
}

function typeStepStatus(status) {
    if (status === JOB_STATUS.not_started) {
        return 'Not started';
    }
    else if (status === JOB_STATUS.in_progress) {
        return 'In progress';
    }
    else if (status === JOB_STATUS.failed) {
        return 'Failed';
    }
    else if (status === JOB_STATUS.completed) {
        return 'Completed';
    }

    return 'unknown'
}

function jobTitle(jobId) {
    if (jobId === JOB_STATUS.not_started) {
        return 'Import the dataset';
    }
    else if (jobId === JOB_STATUS.in_progress) {
        return 'Pretreat the dataset';
    }
    else if (jobId === JOB_STATUS.failed) {
        return 'Run a simulation of the model';
    }
    else if (jobId === JOB_STATUS.completed) {
        return 'Generate GeoTIFF files';
    }

    return 'unknown'
}

const JOB_LIST = ['dataimport', 'pretreatment', 'dataread', 'posttreatment']
const INIT_JOB_STATUS = {
    dataimport: JOB_STATUS.not_started,
    pretreatment: JOB_STATUS.not_started,
    dataread: JOB_STATUS.not_started,
    posttreatment: JOB_STATUS.not_started,
};


export default function PipelineModal(props) {
    const [jobStatus, setJobStatus] = useState(INIT_JOB_STATUS)
    const [state, setState] = useState({});
    const [watchingContainer, setWatchingContainer] = useState(null);
    const _pipelineManifestRef = useRef();
    const _containers = useContainers();

    const synchronizeState = useCallback(() => {
        // _pipelineManifestRef.current
        const [allContainers,] = _containers;
        // Docker label values are strings
        const modelId = props.model.id + '';

        console.log('[CALL synchronizeState] modelId: %s', modelId);
        // console.dir(_pipelineManifestRef.current);
        console.dir(_containers);

        
        const containersBelongsToTheModel = allContainers.filter(containerProps => containerProps.labels['task.model.id'] === modelId)
        const jobsInProgress = containersBelongsToTheModel.map(containerProps => containerProps.labels['task.type']);

        console.log('taskStatuses');
        console.dir(jobsInProgress);

        // return getPipelineStatus$(props.model)
        //     .then(status => {
        //         console.log('Pipeline Status:');
        //         console.dir(status);
        //         setState(_state => ({
        //             ..._state,
        //             ...status
        //         }))

        //         if (status.data_import.in_progress) {
        //             setWatchingContainer(props.model.metadata.data_import_container)
        //         } else if (status.data_read.in_progress){
        //             setWatchingContainer(props.model.metadata.data_read_container)
        //         }
        //     })
    }, [_containers])
    
    // Once modal is opened
    useEffect(() => {
        _pipelineManifestRef.current = compilePipelineManifest(pipeline_manifest, props.model);
        synchronizeState();
    }, []);

    const startJobHandler = useCallback((e) => {
        const jobId = e.target.dataset.job;
        const containerManifest = pipeline_manifest[jobId].container
        const body_s = JSON.stringify(containerManifest, (key, value) => {
            if (typeof(value) == 'function') return value(props.model);
            return value;
        })

        // console.log('Start Job');
        // console.dir(jobData);
        // console.dir(props.model)
        // console.dir(body_s);

        return runContainer$(body_s)
            .then(data => {
                console.log('[runDataImportTask]');
                console.dir(data);
                synchronizeState();
                setWatchingContainer(data.id);
            })
    });

    const startDataReadTaskHandler = useCallback(() => {
        const {model} = props;
        return runDataReadTask$(model)
            .then(data => {
                console.log('[runDataReadTask$]');
                console.dir(data);
                // Does not work properly here
                synchronizeState();
                
                setWatchingContainer(data.id);

                console.log('Model update')
                console.dir(model);
             
                return model
                    .init(model.atbd_parameters, {
                        ...model.metadata,
                        data_read_container: data.id
                    })
                    .synchronize()
                    .finally(synchronizeState)
            });
    });

    
    const startPostprocessingTaskHandler = useCallback(() => {
        const {model} = props;
        return runPostprocessingTask$(model)
            .then(data => {
                console.log('[runPostprocessingTask$]');
                console.dir(data);
                // Does not work properly here
                synchronizeState();
                
                setWatchingContainer(data.id);

                console.log('Model update')
                console.dir(model);
             
                return model
                    .init(model.atbd_parameters, {
                        ...model.metadata,
                        postprocessing_container: data.id
                    })
                    .synchronize()
                    .finally(synchronizeState)
            });
    });

    const removeDataImportResults = useCallback(() => {
        const {model} = props;
        return deleteDataImportResults$(model)
            .then(() => {
                synchronizeState();
                const {data_import_container, ...rest} = model.metadata;
                
                setWatchingContainer(null);
                model
                    .init(props.model.atbd_parameters, {...rest})
                    .synchronize();
            })
    });

    const removeDataReadResults = useCallback(() => {
        const {model} = props;
        return deleteDataReadResults$(model)
            .then(() => {
                synchronizeState();
                const {data_read_container, ...rest} = model.metadata;
                
                setWatchingContainer(null);
                model
                    .init(model.atbd_parameters, {...rest})
                    .synchronize();
            })
    });

    const removePostprocessingResults = useCallback(() => {
        const {model} = props;
        return deletePostprocessingResults$(model)
            .then(() => {
                synchronizeState();
                const {postprocessing_container, ...rest} = model.metadata;
                
                setWatchingContainer(null);
                model
                    .init(model.atbd_parameters, {...rest})
                    .synchronize();
            })
    });


    useEffect(() => {
        console.log('[watchingContainer] %s', watchingContainer);
    }, [watchingContainer]);

    const onStartHandler = useCallback(() => {
        setTimeout(()=> {
            synchronizeState();
        }, 1000);
    }, [])

    const showMapHandler = useCallback(() => {
		const resource_link = '/api/v2/file?path=' + props.model.destination_postprocessing_path + '/';
		
        addComponent(<Dialog key={Math.random()} dialogKey={'MapDialog1'}>
            <DialogHeader title="Map">
                <div className={S.mapDialog}>
                    <DynamicMap dir={resource_link}/>
                </div>
            </DialogHeader>
        </Dialog>, 'default');
    });

    // useEffect(() => {
    //     console.log('[NEW CONTAINERS]');
    //     console.dir(_containers);
    // }, [_containers])


    

    // TODO
    // Currently the app starts showing logs once the watchingContainer is changing.
    // But The app should listen the changes in the container list to request the log

    return <div className={S.root}>
            <div className={classList("regular-grid", S.stageList)}>
                <h4>#</h4>
                <h4>Name</h4>
                <h4>Status</h4>
                <h4>Artefacts</h4>
                <h4>Actions</h4>
                {JOB_LIST.map((jobId, i) => {
                    const isDisabled = JOB_LIST[i - 1] ? jobStatus[JOB_LIST[i - 1]] !== JOB_STATUS.completed : null;
                    const className = isDisabled ? S.disabled : '';

                    return (<>
                        <div className={className}>{i + 1}</div>
                        <div className={className}>{jobTitle(jobId)}</div>
                        <div className={className}>{typeStepStatus(JOB_STATUS[jobId])}</div>
                        <div className={className}>{jobId}</div>
                        <div className={className}>
                            {jobStatus[jobId] === JOB_STATUS.not_started && (
                                <button 
                                    className="btn __small btn-primary" 
                                    data-job={jobId}
                                    onClick={startJobHandler}>Start task</button>
                            )}
                            &nbsp;</div>
                    </>)
                })}
            </div>
            {watchingContainer && <div className={S.logs}>
                <ContainerLogs 
                    container_id={watchingContainer} 
                    onStart={onStartHandler}
                    onTermination={synchronizeState}
                />
            </div>}
        </div>

    return <div className={S.root}>
        {!!state.data_import && <>
            <p>To get the simulation results, you need to complete three steps.</p>
            <h3>#1 Import the dataset</h3>
            <p>
                <span>{typeDataImportStatus(state.data_import)}</span> &nbsp;
                {state.data_import.not_started && <button className="btn __small btn-primary" onClick={startDataImportTaskHandler}>Start task</button>}
            </p>
            <p>
                {!!state.data_import.completed && <>
                    <a  title={props.model.destination_dataimport_path}
                        href={'/api/v2/archive?path=' + props.model.destination_dataimport_path}
                        download={props.model.metadata.name + '_dataset'}
                    >Download assets</a>&nbsp;
                    <button className="btn __small btn-secondary" onClick={removeDataImportResults}>Delete</button>
                </>}
            </p>
        </>}
        {!!state.data_read && <>
            <h3>#2 Run a simulation of the model</h3>
            <p>
                <span>{typeDataReadStatus(state.data_read)}</span>&nbsp;
                {state.data_read.not_started && state.data_import.completed && <button className="btn __small btn-primary" onClick={startDataReadTaskHandler}>Start task</button>}
            </p>            
            <p>
                {!!state.data_read.completed && <>
                    <a  title={props.model.destination_dataread_path}
                        href={'/api/v2/archive?path=' + props.model.destination_dataread_path}
                        download={props.model.metadata.name + '_files'}
                    >Download assets</a>,&nbsp;
                    <a  title={props.model.destination_postprocessing_path}
                        href={'/api/v2/file?path=' + props.model.destination_dataread_path + '/error.txt'}
                        download={props.model.metadata.name + '_dataread_warnings'}
                    >Download list of warnings</a>,&nbsp;
                    <button className="btn __small btn-secondary" onClick={removeDataReadResults}>Delete</button>
                </>}
            </p>
        </>}
        {!!state.postprocessing && <>
            <h3>#3 Generate GeoTIFF files</h3>
            <p>
                <span>{typeDataReadStatus(state.postprocessing)}</span>&nbsp;
                {state.postprocessing.not_started && state.data_read.completed && <button className="btn __small btn-primary" onClick={startPostprocessingTaskHandler}>Start task</button>}
            </p>            
            <p>
                {!!state.postprocessing.completed && <>
                    <button className="btn __small btn-primary" onClick={showMapHandler}>Map</button>&nbsp;
                    <a  title={props.model.destination_postprocessing_path}
                        href={'/api/v2/archive?path=' + props.model.destination_postprocessing_path}
                        download={props.model.metadata.name + '_images'}
                    >Download assets</a>,&nbsp;
                    <a  title={props.model.destination_postprocessing_path}
                        href={'/api/v2/file?path=' + props.model.destination_postprocessing_path + '/error.txt'}
                        download={props.model.metadata.name + '_postprocessing_warnings'}
                    >Download list of warnings</a>,&nbsp;
                    <button className="btn __small btn-secondary" onClick={removePostprocessingResults}>Delete</button>
                </>}
            </p>
        </>}
        {/* <div>
            <button onClick={showMapHandler}>Map</button>
        </div> */}
        
        {!state.data_import && <>
            {/* TODO add spiner */}
            <p>Loading...</p>
        </>}
        {!!state.data_import && watchingContainer && <div className={S.logs}>
            <ContainerLogs 
                container_id={watchingContainer} 
                onStart={onStartHandler}
                onTermination={synchronizeState}
            />
        </div>}
    </div>
}
