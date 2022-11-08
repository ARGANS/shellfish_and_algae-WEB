import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, useRef } from 'react'
import S from './PipelineModal.module.css'
import { runContainer$, checkFiles$, FNF, deleteResults$, stopContainer$ } from 'helpers/api';
import ContainerLogs from 'components/ContainerLogs/ContainerLogs';
import Dialog from 'libs/Dialogs/Dialog';
import DialogHeader from 'libs/DialogHeader/DialogHeader';
import { addComponent } from 'libs/ComponentHeap/ComponentHeap';
import { classList } from 'utils/strings';
import { compilePipelineManifest, pipeline_manifest, JOB_STATUS } from 'helpers/pipelines';
import Sicon from 'libs/Sicon/Sicon';
const DynamicMap = dynamic(() => import('libs/Map/Map'), { ssr: false })
import {containerService} from 'helpers/container2_service';
import model_data from 'models/model_data';



function getPart(str) {
    const pos = str.indexOf(' ');
    if (pos < 0) return str;
    return str.substr(0, pos)
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
    const [jobStatus, setJobStatus] = useState({})
    const [jobDisabled, setJobDisabled] = useState({})
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
                // console.log('Continue %s', _containersRef.current.length);
                
                // Docker label values are strings
                const modelId = props.model.id + '';
                const filterContainersLinkedToTheModel = containerProps => containerProps.labels['task.model.id'] === modelId;
                const containersBelongsToTheModel = allContainers.filter(filterContainersLinkedToTheModel)
                // TODO get container that belong to the active Job type
                const activeContainers = containersBelongsToTheModel.filter(containerProps => !!containerProps.labels['task.type']);

                console.warn('activeContainers:')
                console.dir(activeContainers);
                setWatchingContainer(activeContainers.length > 0 ? activeContainers[0].id : null)

                const fileCheckReports = fileChecks.reduce((report, checkProps, i) => {
                    if (!report.hasOwnProperty(checkProps.stage_id)) report[checkProps.stage_id] = {};
                    report[checkProps.stage_id][checkProps.check_id] = fileContents[i] !== FNF
                    return report;
                }, {})

                const _executingTasks = activeContainers.reduce(
                    (state, containerProps) => {
                        state[getPart(containerProps.labels['task.type'])] = JOB_STATUS.in_progress;
                        return state;
                    }, 
                    {..._pipelineManifestRef.current.init_job_status}
                );

                const nextJobStatus = Object.entries(_executingTasks)
                    .reduce((_nextJobStatus, [jobId, curStatus]) => {
                        if (curStatus !== JOB_STATUS.in_progress) {
                            if (fileCheckReports.hasOwnProperty(jobId) && fileCheckReports[jobId].started) {
                                if (fileCheckReports[jobId].completed) {
                                    _nextJobStatus[jobId] = JOB_STATUS.completed        
                                } else {
                                    _nextJobStatus[jobId] = JOB_STATUS.failed;
                                }
                            } else {
                                _nextJobStatus[jobId] = JOB_STATUS.not_started
                            }
                        } else {
                            _nextJobStatus[jobId] = JOB_STATUS.in_progress;
                        }

                        return _nextJobStatus;
                    }, {});

                console.log('[synchronizeState]')
                console.dir([_executingTasks, fileCheckReports])
                
                setJobStatus(nextJobStatus)
                //  TODO setJobDisabledStatuses
            })
    }, [setJobStatus]);

    const containerListChangeHandler = useCallback((allContainers, removedContainer) => {
        console.log('[container_list_change3]')
        console.dir([allContainers, removedContainer]);

        _containersRef.current = allContainers;
        synchronizeState();
    }, [synchronizeState])

    useEffect(() => {
        console.warn('[INIT PipelineDialog]');
        
        if (!_pipelineManifestRef.current) {
            _pipelineManifestRef.current = compilePipelineManifest(pipeline_manifest, props.model);
            setJobStatus(_pipelineManifestRef.current.init_job_status)
        }
        
        _containersRef.current = containerService._state;
        synchronizeState();

        const callback = containerService.emitter.on('container_list_change', containerListChangeHandler);
        return () => {
            containerService.emitter.off('container_list_change', callback);
        }
    }, []);


    useEffect(() => {
        const jobStatusHash = Object.values(jobStatus).map(code => code + '').join('')

        if (_prevJobStatusRef.current && _prevJobStatusRef.current !== jobStatusHash) {
            setUIBlocked(false);
        }

        _prevJobStatusRef.current = jobStatusHash;

        const jobIds = Object.keys(jobStatus);

        setJobDisabled(jobIds.length > 0
            ? jobIds.reduce((state, jobId, i) => {
                state[jobId] = jobIds[i - 1] ? jobStatus[jobIds[i - 1]] !== JOB_STATUS.completed : null;
                return state;
            }, {})
            : {})
    }, [jobStatus, setJobDisabled]);

    const startJobHandler = useCallback((e) => {
        const jobId = e.target.dataset.job;
        const containerManifest = pipeline_manifest[jobId].container;

        console.log('[startJobHandler]')
        console.dir(props.user)

        if (!props.user.email) {
            delete containerManifest.Labels['container.action:termination.notification.link'];
        }

        // TODO refactor manifest properties interpolation
        const body_s = JSON.stringify(containerManifest, (key, value) => {
            if (typeof(value) == 'function') return value(props.model);
            return value;
        })
            .replaceAll('{{user_username}}', props.user.username)
            .replaceAll('{{user_email}}', props.user.email)
            .replaceAll('{{model_id}}', props.model.id)
            .replaceAll('{{model_type}}', props.model.type)

        setUIBlocked(true);

        return runContainer$(body_s).then((data) => {
            const eventData = {
                id: data.Id,
                time: Date.parse(data.Created) / 1000,
                Action: 'create',
                Actor: {
                    Attributes: {
                        ...data?.Config?.Labels,
                        name: data.Name,
                        image: data.Image,
                    },
                }
            }
            // updates the list of containers only for proper removal of spinner in case SSE is not working properly
            containerService._evtSource.onmessage({
                data: eventData
            })
        });
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

    // ???
    const onStartHandler = useCallback(() => {
        setTimeout(()=> {
            synchronizeState();
        }, 1000);
    }, [])

    const showMapHandler = useCallback(e => {
        const jobId = e.target.dataset.job;
        const dir = pipeline_manifest[jobId === 'posttreatment' ? 'posttreatment' : 'NutrientImpactPosttreatment'].dir(props.model)
        const resource_link = '/api/v2/file?path=' + dir + '/';
		
        addComponent(<Dialog key={Math.random()} dialogKey={'MapDialog1'}>
            <DialogHeader title="Map">
                <div className={S.mapDialog}>
                    <DynamicMap 
                        dir={resource_link} 
                        files={model_data.files[props.model.type]}
                    />
                </div>
            </DialogHeader>
        </Dialog>, 'default');
    }, [props.model]);

    const stopJobHandler = useCallback((e) => {
        // stop container and remove job artifacts
        const jobId = e.target.dataset.job;
        const allContainers = _containersRef.current;
        // Docker label values are strings
        const modelId = props.model.id + '';
        const containersBelongsToTheJob = allContainers.filter(
            containerProps => (containerProps.labels['task.model.id'] === modelId) 
                && (getPart(containerProps.labels['task.type']) === jobId)
        )
        
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
                    {Object.keys(jobStatus).map((jobId, i) => {
                        const className = jobDisabled[jobId] ? S.disabled : '';
                        
                        return (<>
                            <div className={className}>{i + 1}</div>
                            <div className={className}>{pipeline_manifest[jobId].title || 'unknown'}</div>
                            <div className={className}>{typeStepStatus(jobStatus[jobId])}</div>
                            <div className={className}>
                                {(jobStatus[jobId] === JOB_STATUS.completed || jobStatus[jobId] === JOB_STATUS.failed) && ([
                                    <a  title={pipeline_manifest[jobId].dir(props.model)}
                                        className="roffset-d"
                                        href={'/api/v2/archive?path=' + pipeline_manifest[jobId].dir(props.model) + '&filename=' + (props.model.metadata.name + '_' + jobId)}
                                    >Download assets</a>,
                                    <a  title={pipeline_manifest[jobId].dir(props.model)}
                                        href={'/api/v2/file?path=' + pipeline_manifest[jobId].dir(props.model) + '/error.txt' + '&filename=' + (props.model.metadata.name + '_' + jobId + 'log.txt')}
                                    >Execution log</a>
                                ])}
                            </div>
                            <div className={className}>
                                {jobStatus[jobId] === JOB_STATUS.completed && (jobId === 'posttreatment' || jobId === 'NutrientImpactPosttreatment') && (
                                    <button 
                                        className="btn __small btn-primary roffset-d" 
                                        onClick={showMapHandler} 
                                        data-job={jobId}>Show map</button>
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
