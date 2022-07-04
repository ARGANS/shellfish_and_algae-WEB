export default function TabNavItem({ id, title, className, setActiveTab }) {
    function handleClick() {
        setActiveTab(id);
    };
    
    return (
        <li onClick={handleClick} className={className}>{title}</li>
    );
};
