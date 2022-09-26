import { useEffect, useState, useCallback } from 'react'
import S from './JobList.module.css'
import { removeAllComponents } from 'libs/ComponentHeap/ComponentHeap';
import {containerService} from 'helpers/container2_service';
import { DateZ } from 'libs/DatePicker/dates';
import { classList } from "utils/strings";
import { addComponent } from 'libs/ComponentHeap/ComponentHeap';
import Dialog from 'libs/Dialogs/Dialog';
import DialogHeader from 'libs/DialogHeader/DialogHeader';

export default function JobList(props) {
    const [containers, setContainers] = useState([])

    useEffect(() => {
        const callback = containerService.emitter.on('container_list_change', (containers, removedContainer) => {
            console.log('[container_list_change2]')
            console.dir([containers, removedContainer]);
            setContainers(containers);
        });

        return () => {
            containerService.emitter.off('container_list_change', callback);
        }
    }, []);

    const clickHandler = useCallback((e) => {
        const containerId = e.target.dataset.id;
        const containerData = containers.find(container => container.short_id === containerId);
        
        console.log('Container %s', containerId);
        console.dir(containerData);

        addComponent(<Dialog key={Math.random()} dialogKey={'ContainerData1'}>
            <DialogHeader title={'Container: ' + containerData.short_id}>
                <div className="bcontainer">
                    <dl className={classList('regular-grid', S.containerProps_root)}>
                        <dt>Name:</dt>
                        <dd>{containerData.name}</dd>

                        <dt>Image:</dt>
                        <dd>{containerData.image}</dd>

                        <dt>Started:</dt>
                        <dd>{DateZ.from(containerData.started_at).t('DD-MM-YYYY HOUR:MIN:SEC')}</dd>

                        <dt>Labels:</dt>
                        <dd>
                            <div>
                                <dl className={classList('regular-grid', S.containerProps)}>
                                    {Object.entries(containerData.labels).map(([label, value]) => (<>
                                        <dt>{label}</dt>
                                        <dd><div>{value}</div></dd>
                                    </>))}
                                </dl>
                            </div>
                        </dd>
                    </dl>
                </div>
            </DialogHeader>
        </Dialog>, 'default');
    }, [containers]);
    
   
    return <div className={S.root}>
        <ol>
            {containers.map(container => (
                <li 
                    className="regular_vlink"
                    key={container.short_id} 
                    data-id={container.short_id} 
                    onClick={clickHandler}>{typeContainerStat(container)}</li>
            ))}
        </ol>
    </div>
}

function typeContainerStat(container) {
    return [
        container.short_id,
        container.name ? (', ' +  container.name) : '',
        ' ',
        container.labels.hasOwnProperty('task.type') ? container.labels['task.type'] : '',
    ].join('')  
}
