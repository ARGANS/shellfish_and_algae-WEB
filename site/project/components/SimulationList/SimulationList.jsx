import { useCallback, useState } from 'react'
import S from './SimulationList.module.css'
import ModelProperties from 'components/ModelProperties/ModelProperties';

import SimulationModel from 'settings/SimulationModel';

// TODO rename settings into models

export default function ModelList(props) {
    const [model, setModel] = useState(null);

    const createModel = useCallback(() => {
        setModel(new SimulationModel())
    }, [setModel])
    const showList = useCallback(() => {
        setModel(null)
    }, [setModel])

    return <div className={S.root}>
        {model === null? ( <>
            <div className={S.header}>
                <button className="btn" onClick={createModel}>+ Create a model</button>
            </div>
            <div className={S.body}>
                <div className={S.list}>
                    <div>123</div>
                    <div>abc</div>
                    <div>xyz</div>
                    <div>123</div>
                    <div>abc</div>
                    <div>xyz</div>
                </div>
            </div>
        </>) : (<div className={S.formWrapper}>
            <div className={S.formWrapperInner}>
            {/* TODO when submitting, fill the model with properties from the form */}
            
            <ModelProperties parameters={props.model_parameters}/>	
            
            <button className="btn __secondary" onClick={showList}>[X]</button>
            </div>
        </div>) }
        
    </div>
}