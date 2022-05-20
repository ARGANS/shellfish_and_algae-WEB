import S from './Legend.module.css';

export default function Legend(props) {
    const {colors, min, max} = props;
    const step = (max - min) / colors.length;
    return <>
        {props.title && <h5 className={S.title}>{props.title}</h5>}
        <ul className={S.root}>{colors.map((color, i) => {
            return <li key={color} style={{'--step-color': color}}>{`[${(min + i * step).toFixed(2)}, ${(min + (i + 1) * step).toFixed(2)})`}</li>
        })}</ul>
    </>
}

