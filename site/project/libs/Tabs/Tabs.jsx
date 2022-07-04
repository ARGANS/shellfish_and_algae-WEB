import S from './Tabs.module.css'
import { useState } from "react"
import TabNavItem from './TabNavItem';
import { classList } from 'utils/strings';


const TabItems = ['Algae', 'Shellfish'];

export default function Tabs(props) {
    const [activeTab, setActiveTab] = useState(TabItems[0]);

    return (<div className={classList('bflex-column', S.root)}>
        <ul className={classList('flex-size-own', S.nav)}>{
            TabItems.map((id) => (<TabNavItem 
                key={id}
                id={id} 
                title={id} 
                className={activeTab === id ? S.active : ''} 
                setActiveTab={setActiveTab}
            />))
        }</ul>
        <div className={classList('flex-size-fill', S.outlet)}>
            { Array.isArray(props.children) && props.children.map((TabContent, i ) => {
                console.log('TabContent');
                console.dir(TabContent);
                return activeTab === TabContent.props.id && TabContent;
            })}
        </div>
    </div>)
}
