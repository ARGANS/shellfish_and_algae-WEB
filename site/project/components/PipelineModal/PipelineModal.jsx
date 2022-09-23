import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, useRef } from 'react'
import S from './PipelineModal.module.css'
import { runContainer$, checkFiles$, FNF, deleteResults$, stopContainer$ } from 'helpers/api';
import ContainerLogs from 'components/ContainerLogs/ContainerLogs';
import Dialog from 'libs/Dialogs/Dialog';
import DialogHeader from 'libs/DialogHeader/DialogHeader';
import { addComponent } from 'libs/ComponentHeap/ComponentHeap';
import { classList } from 'utils/strings';
import { compilePipelineManifest, pipeline_manifest } from 'helpers/pipelines';
import Sicon from 'libs/Sicon/Sicon';
const DynamicMap = dynamic(() => import('libs/Map/Map'), { ssr: false })
import {containerService} from 'helpers/container2_service';

/**
 * 
 * @param {Object} state 
 */
// DEPRECATED
// function typeDataImportStatus(state) {
//     return state.not_started 
//         ? 'Not downloaded' 
//         : state.in_progress 
//             ? 'Downloading now'
//             : state.completed
//                 ? 'Already downloaded'
//                 : '-'
// }

// DEPRECATED
// function typeDataReadStatus(state) {
//     return state.not_started 
//         ? 'Not processed' 
//         : state.in_progress 
//             ? 'In progress now'
//             : state.completed
//                 ? 'Already processed'
//                 : '-'
// }

const JOB_STATUS = {
    not_started: 0,
    in_progress: 1,
    completed: 2,
    failed: 3
}
const JOB_LIST = ['dataimport', 'pretreatment', 'dataread', 'posttreatment']
const INIT_JOB_STATUS = {
    dataimport: JOB_STATUS.not_started,
    pretreatment: JOB_STATUS.not_started,
    dataread: JOB_STATUS.not_started,
    posttreatment: JOB_STATUS.not_started,
};


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
    if (jobId === JOB_LIST[0]) {
        return 'Import datasets';
    }
    else if (jobId === JOB_LIST[1]) {
        return 'Pretreat datasets';
    }
    else if (jobId === JOB_LIST[2]) {
        return 'Run model simulation';
    }
    else if (jobId === JOB_LIST[3]) {
        return 'Generate GeoTIFF files';
    }

    return 'unknown'
}

function typeContainers(containers) {
    return containers.map(c => c.name).join(',')
}

function typeContainerChanges(containersSnapShot) {
    return 'ALL: ' + 
        typeContainers(containersSnapShot[0]) + 
        '; ADDED: ' + 
        typeContainers(containersSnapShot[1].added) + 
        '; REMOVED: ' + 
        typeContainers(containersSnapShot[1].removed);
}

export default function PipelineModal(props) {
    const [jobStatus, setJobStatus] = useState(INIT_JOB_STATUS)
    const [watchingContainer, setWatchingContainer] = useState(null);
    const [isBlocked, setUIBlocked] = useState(false);
    const _pipelineManifestRef = useRef();
    const _containersRef = useRef();
    const _prevJobStatusRef = useRef();

    // To be good this callback depends on _containers
    const synchronizeState = useCallback(() => {
        // List of files that the application needs to monitor in order to understand what happened to the task
        const fileChecks = _pipelineManifestRef.current.files;
        const fileChecksRequest = fileChecks.map(checkProps => ({
            type: 'get_file',
            path: checkProps.path
        }));

        return checkFiles$(fileChecksRequest)
            .then((fileContents) => {
                const allContainers = _containersRef.current;
                console.log('Continue %s', _containersRef.current.length);
                
                // Docker label values are strings
                const modelId = props.model.id + '';
                const filterContainersLinkedToTheModel = containerProps => containerProps.labels['task.model.id'] === modelId;
                const containersBelongsToTheModel = allContainers.filter(filterContainersLinkedToTheModel)
                // TODO get container that belong to the active Job type
                const activeContainers = containersBelongsToTheModel.filter(containerProps => !!containerProps.labels['task.type']);

                if (true) {
                    // TODO: Disabled
                    setWatchingContainer(activeContainers.length > 0 ? activeContainers[0].short_id : null)
                }

                
                const _executingTasks = activeContainers.reduce((state, containerProps) => {
                    state[containerProps.labels['task.type']] = JOB_STATUS.in_progress;
                    return state;
                }, {
                    ...INIT_JOB_STATUS
                });

                const fileCheckReports = fileChecks.reduce((report, checkProps, i) => {
                    if (!report.hasOwnProperty(checkProps.stage_id)) report[checkProps.stage_id] = {};
                    report[checkProps.stage_id][checkProps.check_id] = fileContents[i] !== FNF
                    return report;
                }, {})

                console.log('[synchronizeState]')
                console.dir([_executingTasks, fileCheckReports])
                
                setJobStatus(curJobStatus => {
                    const nextJobStatus = Object.entries(_executingTasks)
                        .reduce((nextJobStatus, [jobId, curStatus]) => {
                            if (curStatus !== JOB_STATUS.in_progress) {
                                if (fileCheckReports[jobId].started) {
                                    if (fileCheckReports[jobId].completed) {
                                        nextJobStatus[jobId] = JOB_STATUS.completed        
                                    } else {
                                        nextJobStatus[jobId] = JOB_STATUS.failed;
                                    }
                                } else {
                                    nextJobStatus[jobId] = JOB_STATUS.not_started
                                }
                            } else {
                                nextJobStatus[jobId] = JOB_STATUS.in_progress;
                            }

                            return nextJobStatus;
                        }, {});

                    // console.log('[synchronizeState] nextJobStatus: %s, curJobStatus %s, _executingTasks: %s', 
                    //     JSON.stringify(nextJobStatus), 
                    //     JSON.stringify(curJobStatus),
                    //     JSON.stringify(_executingTasks),
                        
                    // );
                    // console.log('fileCheckReports');
                    // console.dir(fileCheckReports);

                    return nextJobStatus;
                })
            })
    });

    useEffect(() => {
        console.warn('[INIT PipelineDialog]');
        if (!_pipelineManifestRef.current) {
            _pipelineManifestRef.current = compilePipelineManifest(pipeline_manifest, props.model);
            console.dir(_pipelineManifestRef.current);
        }

        const callback = containerService.emitter.on('container_list_change', (containers, removedContainer) => {
            console.log('[container_list_change3]')
            console.dir([containers, removedContainer]);

            _containersRef.current = containers;
            synchronizeState();
        });

        _containersRef.current = containerService._state
        synchronizeState();

        return () => {
            containerService.emitter.off('container_list_change', callback);
        }
    }, []);


    useEffect(() => {
        // console.log('Job statsu schanged');
        // console.dir(jobStatus);
        const jobStatusHash = Object.values(jobStatus).map(code => code + '').join('')

        if (_prevJobStatusRef.current && _prevJobStatusRef.current !== jobStatusHash) {
            setUIBlocked(false);
        }

        _prevJobStatusRef.current = jobStatusHash;
    }, [jobStatus]);

    const startJobHandler = useCallback((e) => {
        const jobId = e.target.dataset.job;
        const containerManifest = pipeline_manifest[jobId].container
        const body_s = JSON.stringify(containerManifest, (key, value) => {
            if (typeof(value) == 'function') return value(props.model);
            return value;
        }).replaceAll('{{user}}', props.user.username);
        setUIBlocked(true);
        // console.log('StartJobHandler %s', props.user.username);
        // console.dir(JSON.stringify(props.user, null, '\t'));

        return runContainer$(body_s)
    });

    const deleteJobHandler = useCallback((e) => {
        const jobId = e.target.dataset.job;
        // const containerManifest = pipeline_manifest[jobId].container
        console.log('[deleteJobHandler] %s', jobId)
        console.dir(pipeline_manifest[jobId].dir(props.model))

        setUIBlocked(true);
        
        return deleteResults$(pipeline_manifest[jobId].dir(props.model))
            .then(() => {
                synchronizeState();
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
        const resource_link = '/api/v2/file?path=' + pipeline_manifest.posttreatment.dir(props.model) + '/';
		
        addComponent(<Dialog key={Math.random()} dialogKey={'MapDialog1'}>
            <DialogHeader title="Map">
                <div className={S.mapDialog}>
                    <DynamicMap dir={resource_link}/>
                </div>
            </DialogHeader>
        </Dialog>, 'default');
    });

    const stopJobHandler = useCallback((e) => {
        // stop container and remove job artifacts
        const jobId = e.target.dataset.job;
        const allContainers = _containersRef.current;
        // Docker label values are strings
        const modelId = props.model.id + '';
        const containersBelongsToTheJob = allContainers.filter(containerProps => (containerProps.labels['task.model.id'] === modelId) && (containerProps.labels['task.type'] === jobId))
        
        console.log('[stopJobHandler]');
        console.dir(containersBelongsToTheJob);
        if (containersBelongsToTheJob.length < 1) return;

        setUIBlocked(true);
        
        stopContainer$(containersBelongsToTheJob[0].short_id)
            .then(() => deleteResults$(pipeline_manifest[jobId].dir(props.model)))
            .then(() => {
                synchronizeState();
            })
    });
    

    // TODO
    // Currently the app starts showing logs once the watchingContainer is changing.
    // But The app should listen the changes in the container list to request the log

    return <div className={S.root}>
            <div className={S.gridWrapper}>
                <div className={classList('regular-grid', S.stageList)}>
                    <h4>#</h4>
                    <h4>Name</h4>
                    <h4>Status</h4>
                    <h4>Artifacts</h4>
                    <h4>Actions</h4>
                    {JOB_LIST.map((jobId, i) => {
                        const isDisabled = JOB_LIST[i - 1] ? jobStatus[JOB_LIST[i - 1]] !== JOB_STATUS.completed : null;
                        const className = isDisabled ? S.disabled : '';

                        return (<>
                            <div className={className}>{i + 1}</div>
                            <div className={className}>{jobTitle(jobId)}</div>
                            <div className={className}>{typeStepStatus(jobStatus[jobId])}</div>
                            <div className={className}>
                                {(jobStatus[jobId] === JOB_STATUS.completed || jobStatus[jobId] === JOB_STATUS.failed) && ([
                                    <a  title={props.model.dataset_id}
                                        className="roffset-d"
                                        href={'/api/v2/archive?path=' + pipeline_manifest[jobId].dir(props.model) + '&filename=' + (props.model.metadata.name + '_' + jobId)}
                                    >Download assets</a>,
                                    <a  title={props.model.dataset_id}
                                        href={'/api/v2/file?path=' + pipeline_manifest[jobId].dir(props.model) + '/error.txt' + '&filename=' + (props.model.metadata.name + '_' + jobId + 'log.txt')}
                                    >Execution log</a>
                                ])}
                            </div>
                            <div className={className}>
                                {jobStatus[jobId] === JOB_STATUS.completed && jobId === 'posttreatment' && (
                                    <button className="btn __small btn-primary roffset-d" onClick={showMapHandler}>Show map</button>
                                )}
                                {jobStatus[jobId] === JOB_STATUS.not_started ? (
                                    <button 
                                        className="btn __small btn-primary" 
                                        data-job={jobId}
                                        onClick={startJobHandler}>Start task</button>
                                ) : jobStatus[jobId] === JOB_STATUS.in_progress ? (
                                    <button 
                                        className="btn __small btn-secondary" 
                                        data-job={jobId}
                                        onClick={stopJobHandler}>Stop</button>
                                ) : (jobStatus[jobId] === JOB_STATUS.completed || jobStatus[jobId] === JOB_STATUS.failed) ? (
                                    <button 
                                        className="btn __small btn-secondary" 
                                        data-job={jobId}
                                        onClick={deleteJobHandler}>Cancel</button>
                                ) : null }
                            </div>
                        </>)
                    })}
                </div>
                {isBlocked && (
                    <div className={classList(S.gridBlocker, 'vmiddle')}>
                        <div className="vmiddle-inner">
                            <Sicon link={'/assets/images/service_icons.svg#spinner2'} className="ui-spinner"/>
                        </div>
                    </div>
                )}
            </div>
            
            {watchingContainer && <div className={S.logs}>
                <ContainerLogs 
                    container_id={watchingContainer} 
                    onStart={onStartHandler}
                    onTermination={synchronizeState}
                />
            </div>}
        </div>
}
