import datasets_per_region from 'models/datasets.json';
import { useEffect, useState } from 'react';

const headers = 'Parameter,Name,Type,Level,resolution,first obs,last obs,Frequency,Link'.split(',');
const RENDER_PPOPERTIES = 'Parameter,Name,type,level,resolution,first obs,last obs,frequency,link'.split(',');

function DatasetList(props){
    if (props.datasets.length < 1) return null;
    // TODO refactor
    const defaultDataset = props.datasets[0];
    
    return (<>
        {RENDER_PPOPERTIES.map((propertyKey) => {
            const value = defaultDataset[propertyKey];
            if (propertyKey === 'link') {
                return <a href={value} target="_blank" className="with-ellipsis">More info</a>
            }
            else if (propertyKey === 'Parameter') {
                // TODO render a list of other options for absolute positions
                return (<div title={value} className="with-ellipsis">{value}</div>)
            }
            else if (propertyKey === 'Name') {
                // TODO find icon 
                return (<div title={value}>
                    <div className="bflex-row">
                        <span className="flex-size-fill with-ellipsis">{value}</span>
                        <i className="flex-size-own">[^]</i>
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

    return <fieldset 
        className="regular-grid" 
        style={{
            '--description-grid__columns': '1fr 1fr min-content min-content min-content min-content min-content min-content min-content'
        }}>
        {headers.map(header => <h4 key={header} className="with-ellipsis">{header}</h4>)}
        {datasets_per_parameter && Object
            .values(datasets_per_parameter)
            .map((datasets) => <DatasetList datasets={datasets}/>)}
        
    </fieldset>
}
