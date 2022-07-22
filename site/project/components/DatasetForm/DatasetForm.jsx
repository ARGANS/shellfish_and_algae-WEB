import datasets_per_region from 'models/datasets.json';
import { useCallback, useEffect, useState } from 'react';
import { classList } from 'utils/strings';
import S from './DataForm.module.css';

const headers = 'Parameter,Name,Type,Level,resolution,first obs,last obs,Frequency,Link'.split(',');
const RENDER_PPOPERTIES = 'Parameter,Name,type,level,resolution,first obs,last obs,frequency,link'.split(',');

function Link({value, className}) {
    if (!value) return <span className={className}>&nbsp;</span>
    return <a href={value} target="_blank" className={classList("with-ellipsis", className || '')}>More info</a>
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
                    {/* To remove */}
                    {/* {props.isActive && <div className={S.dropdown}>
                        {headers.slice(1).map(header => <h5 key={header} className="with-ellipsis">{header}</h5>)}
                        {props.datasets.map(dataset => {
                            return <div className={S.dropdownRow}>
                            return <>
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
                            </>
                        })}
                    </div>} */}
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
        {props.isActive && <>
            {props.datasets.map(dataset => {
                return <>
                    <span className={S.dropdowned}>&nbsp;</span>
                    <span className={classList('with-ellipsis', S.dropdowned, 'btn-link')} title={dataset['Name']}>{dataset['Name']}</span>
                    <span className={classList('with-ellipsis', S.dropdowned)} title={dataset['type']}>{dataset['type']}</span>
                    <span className={classList('with-ellipsis', S.dropdowned)} title={dataset['level']}>{dataset['level']}</span>
                    <span className={classList('with-ellipsis', S.dropdowned)} title={dataset['resolution']}>{dataset['resolution']}</span>
                    <span className={classList('with-ellipsis', S.dropdowned)} title={dataset['first obs']}>{dataset['first obs']}</span>
                    <span className={classList('with-ellipsis', S.dropdowned)} title={dataset['last obs']}>{dataset['last obs']}</span>
                    <span className={classList('with-ellipsis', S.dropdowned)} title={dataset['frequency']}>{dataset['frequency']}</span>
                    <Link className={S.dropdowned} value={dataset['link']}/>
                </>
            })}
        </>}
    </>)
}

export default function DatasetForm(props){
    const [datasets_per_parameter, setDatasetPerParameter] = useState({})
    const [activeParameter, setActiveParameter] = useState(null);
    const onParameterActivationHandler = useCallback((parameter) => {
        setActiveParameter(parameter);
    })
    useEffect(() => {
        setDatasetPerParameter(datasets_per_region[props.region]);
        setActiveParameter(null);
    }, [props.region])

    return <fieldset className={classList('regular-grid', S.root)}>
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
