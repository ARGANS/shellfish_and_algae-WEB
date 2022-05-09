import S from './ContainerLogs.module.css'

export default function ContainerLogs(props) {
    return <div className={S.root}>{props.container_id}</div>
}
