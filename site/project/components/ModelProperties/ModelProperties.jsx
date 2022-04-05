import { useCallback, useEffect, useState } from "react"
import model_parameters from 'settings/macroalgae_model_parameters.json'
import { downloadFileFromText } from "utils/downloadFile";
import { cloneObject, dset } from "../../utils/deepClone";
import S from './ModelProperties.module.css'

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
        let $node = $select.parentNode.firstChild;
        do {
            if ($node.tagName === 'FIELDSET') {
                if ($node.getAttribute('value') === $select.value) {
                    $node.style.display = '';
                } else {
                    $node.style.display = 'none';
                }
            }
        } while($node = $node.nextElementSibling);
    }, []);

    const onSubmitHandler = useCallback(event => {
        event.preventDefault();
        console.log('state')
        console.dir(state)

        downloadFileFromText('form.json', JSON.stringify(state, null, '\t'))
    }, [state]);
    
    const onChangeHandler = useCallback(event => {
        const {target} = event;
        const {dataset} = target;
        console.log('Change [%s/%s/%s]', target.value, dataset?.section, dataset?.prop)
        console.dir(event);
        const isParameter = target.tagName === 'INPUT';

        // 
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

    return <form class={S.root} onSubmit={onSubmitHandler}>{sectionOrder.map(sectionName => {
        const sectionData = model_parameters[sectionName];
        const sectionDefaults = Object.entries(sectionData.defaults);
        return <fieldset key={sectionName} class={S.section}>
            <legend>{sectionData.section_name}</legend>
            <p className={S.description}>{sectionData.section_description}</p>

            {sectionDefaults.length > 1 ? (
                <select className={S.tab_switcher} name={'tabs_' + sectionName} onChange={onSectionChange}>{
                    sectionDefaults.map(([secPropId, secProp], index) => (
                        <option key={secPropId} value={secPropId} title={secProp.description} selected={index === 0}>{secProp.name}</option>
                    ))
                }</select>
            ) : sectionDefaults.map(([secPropId, secProp]) => (
                <p>{secProp.name}</p>
            ))}

            {sectionDefaults.map(([secPropId, secProp], index) => {
                const propOptions = Object.entries(secProp.options);

                return <fieldset className={S.subsection} key={secPropId} value={secPropId} style={{display: index > 0 ? 'none' : ''}}>{
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
    })}
    <button type="submit">Submit</button>
    </form>
}

{/* <select>
					<optgroup label="Zone">
					</optgroup>
				</select>
				<select>
					<optgroup label="Species">
						<otion value="0">Shellfish</otion>
						<otion value="1">Algae</otion>
					</optgroup>
				</select>
				<select>
					<optgroup label="Model">
					</optgroup>
				</select>
				<h3>Model Configuration</h3> */}
