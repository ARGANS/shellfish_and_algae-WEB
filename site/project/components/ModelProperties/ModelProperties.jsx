import { memo, useCallback, useEffect, useState } from "react"
import { cloneObject, dset } from "utils/deepClone";
import S from './ModelProperties.module.css'
import model_data from 'models/model_data';
import SimulationModel from "models/SimulationModel";
import { getDimension } from "utils/alg";
import { classList } from "utils/strings";
import DatasetForm from "components/DatasetForm/DatasetForm";

const {section_order: SECTION_ORDER} = model_data;

function printSuggestedName(_suggested) {
    return [
        _suggested.login,
        _suggested.species,
        _suggested.zone,
        _suggested.date,
    ].join('_')
}
const DEBUG_RENDER = false;

/**
 * 
 * @param {*} props 
 * @param {SimulationModel|null} props.model 
 * @param {boolean} props.disabled = [false]
 * @param {Object} props.parameters
 * @param {Function} props.onSubmit
 * @returns 
 */
function ModelProperties(props) {
    // TODO rename state to atbd_parameters  
    const [state, setState] = useState(props.model?.atbd_parameters || SimulationModel.createDefaultATBDParameters(props.parameters));
    // Name, zone, scenario
    const [metadata, setMetadata] = useState(
        props.model?.metadata 
        || SimulationModel.createDefaultMetadata(
            model_data.zone_id['Arctic'], 
            props.model?.owner_name,
            props.model?.type == 'Algae' ? 'alaria' : 'C_gigas' 
        )
    );
    // year, depth-min, depth-max, datasets
    const [datasetParameters, setDatasetParameters] = useState(props.model?.dataset_parameters || SimulationModel.createDefaultDatasetParameters());

    const onSectionChange = useCallback((event) => {
        const {target: $select} = event;
        const {dataset} = $select;
        const {options, parameters} = props.parameters[dataset?.section].defaults[$select.value];

        // console.log('[onSectionChange] section:%s val: %s', dataset?.section, $select.value);
        // console.dir(props.parameters[dataset?.section])
        
        setState(_state => {
            return {
                ...cloneObject(_state), 
                [dataset?.section]: {
                    [$select.value]: {options, parameters}
                }
            }
        });

        setMetadata(_metadata => ({
            ..._metadata,
            _suggested: {
                ..._metadata._suggested,
                species: $select.value,
            }
        }))
    }, []);

    const onSubmitHandler = useCallback(event => {
        event.preventDefault();

        metadata.name = metadata.name || printSuggestedName(metadata._suggested)

        if (props.onSubmit) {
            props.onSubmit(state, metadata, datasetParameters);
        }
    }, [state, metadata, datasetParameters]);

    const onChangeHandler = useCallback(event => {
        event.preventDefault();
        event.persist();
        event.stopPropagation()
        const {target} = event;
        const {dataset} = target;
        const isParameter = target.tagName === 'INPUT';
        
        setState(_state => {
            const nextState = dset(
                cloneObject(_state), 
                [
                    dataset?.section, 
                    dataset?.prop, 
                    isParameter ? 'parameters' : 'options',
                    target.name
                ].join('.'), 
                target.value - 0
            )

            return nextState
        })
    }, []);


    const metaDataChangeHandler = useCallback(event => {
        event.preventDefault();
        event.persist();
        event.stopPropagation();
        const {target: $input} = event;
        // console.log('[metaDataChangeHandler] `%s`', $input.value)
        setMetadata(_metadata => ({
            ..._metadata,
            _suggested: {
                ..._metadata._suggested,
                zone: $input.name === 'zone' ? $input.value : _metadata.zone,
            },
            [$input.name]: $input.value,
        }))
    }, [])

    const datasetParameterChangeHandler = useCallback(event => {
        event.preventDefault();
        event.persist();
        event.stopPropagation();
        const {target: $input} = event;
        setDatasetParameters(_datasetParameters => ({
            ..._datasetParameters,
            [$input.name]: $input.value,
        }))
    }, [])


    const onDatasetChangeHandler = useCallback((property, datasetOptions) => {
        // console.log('[onDatasetChangeHandler] %s %s', property, JSON.stringify(datasetOptions));
        setDatasetParameters(_datasetParameters => ({
            ..._datasetParameters,
            datasets: {
                ..._datasetParameters.datasets,
                [property]: datasetOptions,
            }
        }))
    })

    const sectionOrder = Object.keys(props.parameters)
        .sort((section_name1, section_name2) => 
            (SECTION_ORDER[section_name1] || 0) > (SECTION_ORDER[section_name2] || 0) 
                ? 1
                : (SECTION_ORDER[section_name1] || 0) < (SECTION_ORDER[section_name2] || 0)
                    ? -1 : 0
        )
    

    // TODO fix form rerendering on change
    if (DEBUG_RENDER) console.log('RERENDER FORM %s', metadata.zone);

    return <form 
        className={classList(S.root, props.disabled && S.disabled)} 
        onSubmit={onSubmitHandler}
    >
        
        <label>Name</label>
        <input 
            type="text" 
            name="name" 
            value={metadata.name || printSuggestedName(metadata._suggested)} 
            onChange={metaDataChangeHandler}
        />
        
        <label>Zone</label>
        <select 
            name="zone" 
            value={metadata.zone}
            onChange={metaDataChangeHandler}
        >{model_data.zones.map(zone_name => <option 
            key={zone_name} 
            selected={metadata.zone === zone_name}
            value={model_data.zone_id[zone_name]}
        >{zone_name}</option>)}</select>

        <label>Dataset properties</label>
        <div className={S.metadata_list}>
            <label>Depth min</label>
            <label>Depth max</label>
            <label>Year</label>
            <input 
                type="number" 
                name="depth-min" 
                value={datasetParameters['depth-min']}
                onChange={datasetParameterChangeHandler}    
            />
            <input 
                type="number" 
                name="depth-max" 
                value={datasetParameters['depth-max']}
                onChange={datasetParameterChangeHandler}
            />
            <input 
                type="number" 
                min="1980" 
                max="2022" 
                step="1" 
                name="year" 
                value={datasetParameters.year}
                onChange={datasetParameterChangeHandler}
            />
            <div className={S.metadataRow}>
                <DatasetForm 
                    datasets={datasetParameters.datasets || {}}
                    region={metadata.zone} 
                    onChange={onDatasetChangeHandler}
                />
            </div>
        </div>
        <label>Scenario</label>
        <select 
            name="scenario" 
            value={metadata.scenario}
            onChange={metaDataChangeHandler}
        >{model_data.scenarios.map(scenario_name => <option 
            key={scenario_name} 
            selected={metadata.scenario === scenario_name}
            value={scenario_name}
        >{scenario_name}</option>)}</select>

        {sectionOrder.map(sectionName => {
            const sectionData = props.parameters[sectionName];
            const sectionDefaults = Object.entries(sectionData.defaults);
            const keys = Object.keys(state[sectionName]);
            const secPropId = keys[0];
            const secProp = state[sectionName][secPropId];
            const propOptions = Object.entries(secProp.options);
            
            return (<>
                <label>{sectionData.section_name}</label>
                <div>
                    {sectionDefaults.length > 1 ? (
                        <select 
                            className={S.tab_switcher} 
                            name={'tabs_' + sectionName} 
                            onChange={onSectionChange}
                            data-section={sectionName}
                        >{
                            sectionDefaults.map(([secPropId, secProp], index) => (
                                <option key={secPropId} value={secPropId} title={secProp.description} selected={keys.indexOf(secPropId) > -1}>{secProp.name}</option>
                            ))
                        }</select>
                    ) : (sectionDefaults || []).map(([secPropId, secProp]) => (
                        <span>{secProp.name}</span>
                    ))}
                    <p className={S.description}>{sectionData.section_description}</p>
                </div>
                <fieldset key={sectionName} class={S.section}>
                    <fieldset 
                        className={S.subsection} 
                        key={secPropId} 
                        value={secPropId} 
                    >{
                        Object.entries(secProp.parameters)
                            .map(([paramId, paramDefValue]) => {
                                const step = getDimension(paramId, paramDefValue);
                                const [patramDescription, paramMesure] = sectionData.parameters_descriptions.hasOwnProperty(paramId) 
                                    ? sectionData.parameters_descriptions[paramId]
                                    : [null, null];

                                return <label key={paramId}>
                                    <div>{patramDescription || paramId} {paramMesure && ', ' + paramMesure + ''}</div>
                                    <input 
                                        className="flex-size-fill" 
                                        type="number" 
                                        name={paramId} 
                                        defaultValue={paramDefValue} 
                                        step={step}
                                        data-section={sectionName}
                                        data-prop={secPropId}
                                        onChange={onChangeHandler}
                                    />
                                </label>
                            })
                    }
                    {
                        propOptions.length > 0 && propOptions.map(([optionId, optionValue]) => {
                            const options = sectionData.options_descriptions[optionId];
                            if (!Array.isArray(options)) return null;

                            return (<select 
                                defaultValue={optionValue}
                                data-section={sectionName}
                                data-prop={secPropId}
                                name={optionId}
                                onChange={onChangeHandler}
                            >{options.map((optionLabel, index) => (
                                <option key={optionLabel} value={index}>{optionLabel}</option>
                            ))}
                            </select>)
                        })
                    }</fieldset>
                </fieldset>
            </>)
        })}
        {props.children}
    </form>
}

export default memo(ModelProperties, (props, nextProps) => {
    if (DEBUG_RENDER) {
        console.log('Rerender');
        console.dir([props, nextProps]);
    }
    
    // TODO calculate hash on the back-end!
    // TODO compare props.model.hash == nextProps.model.hash
    if(props.prop1 === nextProps.prop1) {
        // don't re-render/update
        return true
    }
})
