import { useCallback, useEffect, useState } from "react"
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

export default function ModelProperties(props) {
    const [state, setState] = useState({});
    
    const onSectionChange = useCallback((event) =>{
        const $select = event.target;
        $select.setAttribute('data-value', $select.value)
        
        const section = $select.dataset.section
        const $node = $select.parentNode.nextElementSibling;
        Array.from($node.querySelectorAll(`[data-${section}]`)).forEach(node => {node.style.display = 'none'});
        Array.from($node.querySelectorAll(`[data-${section}="${$select.value}"]`)).forEach(node => {node.style.display = ''});

        return;

        const nextState = dset(
            cloneObject(state), 
            [
                dataset?.section, 
                dataset?.prop, 
            ].join('.'), 
            {} // use default properties
        )
        setState(nextState)
    }, []);

    const onSubmitHandler = useCallback(event => {
        event.preventDefault();
        console.log('state')
        console.dir(state)

        // downloadFileFromText('form.json', JSON.stringify(state, null, '\t'))
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

    const sectionOrder = Object.keys(model_parameters)
        .sort((section_name1, section_name2) => 
            (SECTION_ORDER[section_name1] || 0) > (SECTION_ORDER[section_name2] || 0) 
                ? 1
                : (SECTION_ORDER[section_name1] || 0) < (SECTION_ORDER[section_name2] || 0)
                    ? -1 : 0
        )

    return <form class={S.root} onSubmit={onSubmitHandler}>
        
        <label>Name</label>
        <input type="text" name="model-name"/>
        
        <label>Zone</label>
        <select name="model-zone">{model_data.zones.map(zone_name => <option key={zone_name} value={zone_name}>{zone_name}</option>)}</select>
        
        {sectionOrder.map(sectionName => {
            const sectionData = model_parameters[sectionName];
            const sectionDefaults = Object.entries(sectionData.defaults);
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
                                <option key={secPropId} value={secPropId} title={secProp.description} selected={index === 0}>{secProp.name}</option>
                            ))
                        }</select>
                    ) : sectionDefaults.map(([secPropId, secProp]) => (
                        <span>{secProp.name}</span>
                    ))}
                    <p className={S.description}>{sectionData.section_description}</p>
                </div>
                <fieldset key={sectionName} class={S.section}>
                    {/*
                    
                        TODO filter sectionDefaults
                    
                    */}
                    {sectionDefaults.map(([secPropId, secProp], index) => {
                        const propOptions = Object.entries(secProp.options);
                        const props = {[`data-${sectionName}`]: secPropId}

                        return <fieldset 
                            className={S.subsection} 
                            key={secPropId} 
                            value={secPropId} 
                            {...props}
                            style={{display: index > 0 ? 'none' : ''}}
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
                    })}
                </fieldset>
            </>)
        })}
    <button type="submit">Submit</button>
    </form>
}
