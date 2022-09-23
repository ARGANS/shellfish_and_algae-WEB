import algae_datasets_per_region from 'models/algae_datasets.json';
import shellfish_datasets_per_region from 'models/shellfish_datasets.json';
import { useCallback, useEffect, useState } from 'react';
import { classList } from 'utils/strings';
import S from './DataForm.module.css';
import Sicon from 'libs/Sicon/Sicon';

const headers = 'Parameter,Name,Type,Level,resolution,first obs,last obs,Frequency,Link'.split(',');
const RENDER_PPOPERTIES = 'Parameter,Name,type,level,resolution,first obs,last obs,frequency,link'.split(',');

function Link({value, className}) {
    if (!value) return <span className={className}>&nbsp;</span>
    return <a href={value} target="_blank" className={classList("with-ellipsis", className || '')}>More info</a>
}

function datasetIsEmpty(dataset){
    return !dataset || !dataset.hasOwnProperty('Name')
}

function DatasetList(props){
    const [defaultDataset, setDefaultDataset] = useState({});
    const onClickHandler = useCallback(() => {
        props.activateParameter(props.isActive ? null : props.parameter)
    })

    const onSelectHandler = useCallback(props.isActive ? (event) => {
        const index = parseInt(event.target.dataset.index)

        // console.log('[onSelectHandler]');
        // console.dir([index, props.parameter, props.datasets[index], JSON.parse(JSON.stringify(props.datasets))]);

        props.onChange(props.parameter, props.datasets[index]);
        // Close dropdown list after item selection
        props.activateParameter(null)
    } : null)

    useEffect(() => {
        
        // console.dir([
        //     props.datasets,
        //     props.datasets.filter((dataset) => JSON.stringify(dataset) !== JSON.stringify(defaultDataset))
        // ])

        const selectedDatasetReflection = JSON.stringify(props.selectedDataset);
        const defaultDataset = props.datasets.find((dataset) => JSON.stringify(dataset) === selectedDatasetReflection) || {};
        // The fact that defaultDataset is non-zero means that the number of options available is props.datasets - 1.

        // console.log('[DatsetList] %s %s && %s == %s', props.parameter, 
        //     /*JSON.stringify(props.selectedDataset)*/
        //     JSON.stringify(defaultDataset),
        //     // datasetIsEmpty(defaultDataset), 
        //     props.datasets.length > 1,
        //     datasetIsEmpty(defaultDataset) ? true : props.datasets.length > 1
        // );

        setDefaultDataset(defaultDataset)
    }, [props.selectedDataset])

    if (props.datasets.length < 1) return null;
    
    return (<>
        {RENDER_PPOPERTIES.map((propertyKey) => {
            const value = defaultDataset[propertyKey];
            if (propertyKey === 'link') {
                return <Link value={value} className={props.isActive && S.isActive}/>
            }
            else if (propertyKey === 'Parameter') {
                return (<div title={value || props.parameter} className={props.isActive && S.isActive}>
                    <div className="with-ellipsis">{value || props.parameter}</div>
                </div>)
            }
            else if (propertyKey === 'Name') {
                return (<div 
                    title={value} 
                    onClick={onClickHandler}
                    className={classList('noselect', props.isActive && S.isActive)}
                    style={{
                        cursor: 'pointer'
                    }}
                >
                    <div className="bflex-row __align-center">
                        <div className={"flex-size-fill with-ellipsis "  + S.datasetName }>{value || '-'}</div>
                        <div className="flex-size-own">
                            {(datasetIsEmpty(defaultDataset) ? true : props.datasets.length > 1) && (
                                <Sicon className={S.icon} link={props.isActive ? '/assets/images/service_icons.svg#arrow-up' : '/assets/images/service_icons.svg#arrow-down'}/>
                            )}
                        </div>
                    </div>
                </div>)
            }
            
            return (<div title={value} className={classList('with-ellipsis', props.isActive && S.isActive)}>{value || '-'}</div>)
        })}
        {props.isActive && <>
            {props.datasets.map((dataset, index) => {
                if (JSON.stringify(dataset) === JSON.stringify(defaultDataset)) return;

                return <>
                    <span className={S.dropdowned}>{index + 1}</span>
                    <span className={classList('with-ellipsis', S.dropdowned, 'btn-link')} 
                        title={dataset['Name']}
                        data-index={index}
                        onClick={onSelectHandler}
                        >{dataset['Name']}</span>
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
        setDatasetPerParameter(
            (props.type === 'Algae' 
                ? algae_datasets_per_region
                : shellfish_datasets_per_region
            )[props.region]
        );
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
                onChange={props.onChange}
                selectedDataset={props.datasets[parameter]}
            />)}
    </fieldset>
}
