import { memo, useCallback, useEffect, useState } from "react"
import model_parameters from 'settings/macroalgae_model_parameters.json'
import { downloadFileFromText } from "utils/downloadFile";
import { cloneObject, dset } from "../../utils/deepClone";
import S from './ModelProperties.module.css'
import model_data from 'settings/model_data';

// TODO move into the model
const SECTION_ORDER = {
    species: 1,
    farm: 2,
    harvest: 3,
    run: 4
}


function createDefaultModel(initData) {
    return Object.entries(initData).reduce(function (store, [sectionName, {defaults}]) {
        const sectionNames = Object.keys(defaults).sort()
        const defaultSection = sectionNames[0]

        store[sectionName] = {
            [defaultSection]: {
                options: defaults[defaultSection].options,
                parameters: defaults[defaultSection].parameters
            } 
        }
        return store;
    }, {});
}

function createDefaultMetadata(initData) {
    return {
        name: '',
        _suggestedName: suggestName('Alaria', initData.zones[0]),
        zone: initData.zones[0]
    }
}


function suggestName(species, zone) {
    return [
        // TODO: login
        species,
        zone,
        // TODO: date
    ].join('_')
}

function ModelProperties(props) {
    const [state, setState] = useState(createDefaultModel(model_parameters));
    const [metadata, setMetadata] = useState(createDefaultMetadata(model_data));

    
    const onSectionChange = useCallback((event) =>{
        const {target: $select} = event;
        const {dataset} = $select;
        const {options, parameters} = model_parameters[dataset?.section].defaults[$select.value];

        console.log('[onSectionChange] section:%s val: %s', dataset?.section, $select.value);
        console.dir(model_parameters[dataset?.section])
        
        const nextState = {
            ...cloneObject(state), 
            [dataset?.section]: {
                [$select.value]: {options, parameters}
            }
        }
            
        console.dir(nextState);
        setState(nextState)
    }, [setState]);

    const onSubmitHandler = useCallback(event => {
        event.preventDefault();
        console.log('state')
        console.dir(state)
        console.dir(metadata)

        // TODO
    }, [state, metadata]);

    const onDownloadHandler = useCallback(event => {
        event.preventDefault();
        downloadFileFromText('form.json', JSON.stringify(state, null, '\t'))
    }, [state]);
    
    const onChangeHandler = useCallback(event => {
        const {target} = event;
        const {dataset} = target;
        const isParameter = target.tagName === 'INPUT';
        const nextState = dset(
            cloneObject(state), 
            [
                dataset?.section, 
                dataset?.prop, 
                isParameter ? 'parameters' : 'options',
                target.name
            ].join('.'), 
            target.value - 0
        )
        setState(nextState)
    }, [state, setState]);

    const metaDataChangeHandler = useCallback(event => {
        event.stopPropagation()
        const {target: $input} = event;
        console.log('[metaDataChangeHandler] `%s`', $input.value)
        setMetadata({
            ...metadata,
            [$input.name]: $input.value
        })
    }, [metadata, setMetadata])

    const sectionOrder = Object.keys(model_parameters)
        .sort((section_name1, section_name2) => 
            (SECTION_ORDER[section_name1] || 0) > (SECTION_ORDER[section_name2] || 0) 
                ? 1
                : (SECTION_ORDER[section_name1] || 0) < (SECTION_ORDER[section_name2] || 0)
                    ? -1 : 0
        )
    
    useEffect(() => {
        if (metadata.hasOwnProperty('name')) return;

        console.log('Update suggestion')
        // TODO
        
        setMetadata({
            ...metadata,
            _suggestedName: suggestName(Object.keys(state.species)[0], metadata.zone)
        })
    }, [state, metadata, setMetadata])

    console.log('RERENDER FORM %s', metadata.zone);

    return <form class={S.root} onSubmit={onSubmitHandler}>
        
        <label>Name</label>
        <input 
            type="text" 
            name="name" 
            defaultValue={metadata.name || metadata._suggestedName} 
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

        {/*  TODO */}
        <span></span>
        <div>
            <label>Depth min</label>
            <label>Depth max</label>
            <label>Depth Year</label>
            {/* TODO min & max values, step? */}
            <input type="number" />
            <input type="number" />
            <input type="number" min="1980" max="2022" step="1" />
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
                                    const dimension = Math.floor(Math.log10(paramDefValue));
                                    const step = (dimension < 0) ? 1 / Math.pow(10, Math.abs(dimension)) : Math.pow(10, dimension); 
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
    <button type="submit" class="btn">Submit</button>
    <button class="btn __secondary" onClick={onDownloadHandler}>Download</button>
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
