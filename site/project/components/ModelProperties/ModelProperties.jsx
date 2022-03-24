import { useCallback, useEffect, useState } from "react"
import model_parameters from 'settings/macroalgae_model_parameters.json'
import S from './ModelProperties.module.css'

const SECTION_ORDER = {
    species: 1,
    farm: 2,
    harvest: 3,
    run: 4
}

export default function ModelProperties(props) {
    // const [sectionOrder, setSectionOrder] = useState([])
    // useEffect(() => {
    //     console.log('PROPS');
    //     console.dir(props.parameters);
    //     const _sectionOrder = Object.keys(props.parameters)
    //         .sort((section_name1, section_name2) => 
    //             (SECTION_ORDER[section_name1] || 0) > (SECTION_ORDER[section_name2] || 0) 
    //                 ? 1
    //                 : (SECTION_ORDER[section_name1] || 0) < (SECTION_ORDER[section_name2] || 0)
    //                     ? -1
    //                     : 0
    //         )
    //     setSectionOrder(_sectionOrder)
    //     console.dir(_sectionOrder)
    // }, [setSectionOrder])
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

    const sectionOrder = Object.keys(model_parameters)
            .sort((section_name1, section_name2) => 
                (SECTION_ORDER[section_name1] || 0) > (SECTION_ORDER[section_name2] || 0) 
                    ? 1
                    : (SECTION_ORDER[section_name1] || 0) < (SECTION_ORDER[section_name2] || 0)
                        ? -1 : 0
            )

    return <form class={S.root}>{sectionOrder.map(sectionName => {
        const sectionData = model_parameters[sectionName];
        const sectionDefaults = Object.entries(sectionData.defaults);
        return <fieldset key={sectionName}>
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


                return <fieldset className={''} key={secPropId} value={secPropId} style={{display: index > 0 ? 'none' : ''}}>{
                    Object.entries(secProp.parameters)
                        .map(([paramId, paramDefValue]) => {
                            const step = Math.pow(10, Math.floor(Math.log10(paramDefValue)))
                            const [patramDescription, paramMesure] = sectionData.parameters_descriptions.hasOwnProperty(paramId) 
                                ? sectionData.parameters_descriptions[paramId]
                                : [null, null]
                            return <label key={paramId}>
                                <div className="bflex-row">
                                    <input className="flex-size-fill" type="number" name={paramId} defaultValue={paramDefValue} step={step}/>
                                    {paramMesure && <span className="flex-size-own">{paramMesure}</span> }
                                </div>
                                
                                
                                {paramMesure && <div>{patramDescription}</div>}
                            </label>
                        })}
                    {propOptions.length > 0 && propOptions.map(([optionId, optionValue]) => {
                        const options = sectionData.options_descriptions[optionId]
                        return (<select defaultValue={optionValue}>{options.map((optionLabel, index) => (
                            <option key={optionLabel} value={index}>{optionLabel}</option>
                        ))}

                        </select>)
                    })}</fieldset>
            })}
        </fieldset>
    })}</form>
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
