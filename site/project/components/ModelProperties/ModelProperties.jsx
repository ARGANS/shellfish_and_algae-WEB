import { memo, useCallback, useEffect, useState } from "react"
import model_parameters from 'settings/macroalgae_model_parameters.json'
import { cloneObject, dset } from "../../utils/deepClone";
import S from './ModelProperties.module.css'
import model_data from 'settings/model_data';
import SimulationModel from "settings/SimulationModel";

// TODO move into the model
const SECTION_ORDER = {
    species: 1,
    farm: 2,
    harvest: 3,
    run: 4
}

function _getStep(num) {
	const parts = (num+'').split('.')
	if (parts[1]) {
		return Math.pow(10, -1 * parts[1].length)
	} else {
		return 1
	}
}

const _stepCache = {};
function getStep(paramId, num) {
    if (_stepCache.hasOwnProperty(paramId)) {
        return _stepCache[paramId];
    }
    _stepCache[paramId] = _getStep(num);
    return _stepCache[paramId];
}

function printSuggestedName(_suggested) {
    return [
        _suggested.login,
        _suggested.species,
        _suggested.zone,
        _suggested.date,
    ].join('_')
}

/**
 * 
 * @param {*} props 
 * @param {SimulationModel|null} props.model 
 * @returns 
 */
function ModelProperties(props) {
    console.log('Model Properties')
    console.dir(props.model)
    
    // ? createDefaultModel into SimulationModel
    const [state, setState] = useState(props.model?.atbd_parameters || SimulationModel.createDefaultATBDParameters(model_parameters));
    const [metadata, setMetadata] = useState(props.model?.metadata || SimulationModel.createDefaultMetadata(model_data));

    
    const onSectionChange = useCallback((event) =>{
        const {target: $select} = event;
        const {dataset} = $select;
        const {options, parameters} = model_parameters[dataset?.section].defaults[$select.value];

        console.log('[onSectionChange] section:%s val: %s', dataset?.section, $select.value);
        console.dir(model_parameters[dataset?.section])
        
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
        console.log('state')
        console.dir(state)
        console.dir(metadata)

        if (props.onSubmit) {
            props.onSubmit(state, metadata)
        }

        // TODO
    }, [state, metadata]);

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
        event.stopPropagation()
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

    const sectionOrder = Object.keys(model_parameters)
        .sort((section_name1, section_name2) => 
            (SECTION_ORDER[section_name1] || 0) > (SECTION_ORDER[section_name2] || 0) 
                ? 1
                : (SECTION_ORDER[section_name1] || 0) < (SECTION_ORDER[section_name2] || 0)
                    ? -1 : 0
        )
    

    // TODO fix form rerendering on change
    console.log('RERENDER FORM %s', metadata.zone);

    return <form class={S.root} onSubmit={onSubmitHandler}>
        
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
            defaultValue={zone_name}
        >{zone_name}</option>)}</select>

        <span></span>
        <div className={S.metadata_list}>
            <label>Depth min</label>
            <label>Depth max</label>
            <label>Depth year</label>
            {/* TODO min & max values, step? */}
            <input 
                type="number" 
                name="depth_min" 
                value={metadata.depth_min}
                onChange={metaDataChangeHandler}    
            />
            <input 
                type="number" 
                name="depth_max" 
                value={metadata.depth_max}
                onChange={metaDataChangeHandler}
            />
            <input 
                type="number" 
                min="1980" 
                max="2022" 
                step="1" 
                name="depth_year" 
                value={metadata.depth_year}
                onChange={metaDataChangeHandler}
            />
        </div>
        
        {sectionOrder.map(sectionName => {
            const sectionData = model_parameters[sectionName];
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
                    ) : sectionDefaults.map(([secPropId, secProp]) => (
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
                                const step = getStep(paramId, paramDefValue);
                                const [patramDescription, paramMesure] = sectionData.parameters_descriptions.hasOwnProperty(paramId) 
                                    ? sectionData.parameters_descriptions[paramId]
                                    : [null, null];
                                return <label key={paramId}>
                                    <div>{patramDescription || paramId}:</div>
                                    <div className="bflex-row">
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
                                        {paramMesure && <span className="flex-size-own">{paramMesure}</span> }
                                    </div>
                                </label>
                            })}
                            {propOptions.length > 0 && propOptions.map(([optionId, optionValue]) => {
                                const options = sectionData.options_descriptions[optionId]
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
                            })}</fieldset>
                </fieldset>
            </>)
        })}
        <button type="submit" className={'btn ' + S.submit}>Submit</button>
    </form>
}

// export default ModelProperties
export default memo(ModelProperties, (props, nextProps) => {
    console.log('Rerender');
    console.dir([props, nextProps]);
    if(props.prop1 === nextProps.prop1) {
        // don't re-render/update
        return true
    }
})
