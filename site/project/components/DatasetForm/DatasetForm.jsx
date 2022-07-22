import datasets_per_region from 'models/datasets.json';
import { useCallback, useEffect, useState } from 'react';
import S from './DataForm.module.css';

const headers = 'Parameter,Name,Type,Level,resolution,first obs,last obs,Frequency,Link'.split(',');
const RENDER_PPOPERTIES = 'Parameter,Name,type,level,resolution,first obs,last obs,frequency,link'.split(',');

function Link({value}) {
    if (!value) return <span>&nbsp;</span>
    return <a href={value} target="_blank" className="with-ellipsis">More info</a>
}

function DatasetList(props){
    const onClickHandler = useCallback(() => {
        props.activateParameter(props.isActive ? null : props.parameter)
    })

    useEffect(() => {
        console.log('[DatasetList]');
        console.dir(props.datasets);
    })

    if (props.datasets.length < 1) return null;
    // TODO refactor
    const defaultDataset = props.datasets[0];
    
    return (<>
        {RENDER_PPOPERTIES.map((propertyKey) => {
            const value = defaultDataset[propertyKey];
            if (propertyKey === 'link') {
                return <Link value={value}/>
            }
            else if (propertyKey === 'Parameter') {
                return (<div title={value} >
                    <div className="with-ellipsis">{value}</div>
                    {props.isActive && <div className={S.dropdown}>
                        {props.datasets.map(dataset => {
                            return <div className={S.dropdownRow}>
                                <span>&nbsp;</span>
                                <span className="with-ellipsis" title={dataset['Name']}>{dataset['Name']}</span>
                                <span className="with-ellipsis" title={dataset['type']}>{dataset['type']}</span>
                                <span className="with-ellipsis" title={dataset['level']}>{dataset['level']}</span>
                                <span className="with-ellipsis" title={dataset['resolution']}>{dataset['resolution']}</span>
                                <span className="with-ellipsis" title={dataset['first obs']}>{dataset['first obs']}</span>
                                <span className="with-ellipsis" title={dataset['last obs']}>{dataset['last obs']}</span>
                                <span className="with-ellipsis" title={dataset['frequency']}>{dataset['frequency']}</span>
                                <Link value={dataset['link']}/>
                            </div>
                        })}
                    </div>}
                </div>)
            }
            else if (propertyKey === 'Name') {
                // TODO find icon 
                return (<div 
                    title={value} 
                    onClick={onClickHandler}
                    className="noselect"
                    style={{
                        cursor: 'pointer'
                    }}
                >
                    <div className="bflex-row">
                        <span className="flex-size-fill with-ellipsis">{value}</span>
                        <span className="flex-size-own">
                            {props.isActive ? <i>[-]</i> : <i>[+]</i>}
                        </span>
                    </div>
                </div>)
            }
            
            return (<div title={value} className="with-ellipsis">{value}</div>)
        })}
    </>)
}

export default function DatasetForm(props){
    const [datasets_per_parameter, setDatasetPerParameter] = useState({})
    useEffect(() => {
        setDatasetPerParameter(datasets_per_region[props.region]);
    }, [props.region])
    const [activeParameter, setActiveParameter] = useState(null);
    const onParameterActivationHandler = useCallback((parameter) => {
        setActiveParameter(parameter);
    })

    return <fieldset 
        className="regular-grid" 
        style={{
            position: 'relative',
            '--description-grid__columns': 'minmax(60px, 1fr) 1fr min-content min-content min-content min-content min-content min-content min-content'
        }}>
        {headers.map(header => <h4 key={header} className="with-ellipsis">{header}</h4>)}
        {datasets_per_parameter && Object
            .entries(datasets_per_parameter)
            .map(([parameter, datasets]) => <DatasetList 
                datasets={datasets}
                parameter={parameter}
                activateParameter={onParameterActivationHandler}
                isActive={activeParameter == parameter}
            />)}
    </fieldset>
}
