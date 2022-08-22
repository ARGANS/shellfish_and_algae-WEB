
export default function Sicon(props) {
    return <>
        <svg className={props.className} title={props.title}>
            <use xlinkHref={props.link}></use>
        </svg>
        {props.text && <span title={props.title}>{props.text}</span>}
    </>
}
