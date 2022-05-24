import { useCallback } from 'react'
import S from './DialogHeader.module.css'
import { removeLastComponent } from 'libs/ComponentHeap/ComponentHeap';

export default function DialogHeader(props) {
    const closeDialogHandler = useCallback(() => {
        removeLastComponent();
    })

    return <div className={S.root}>
        <div className={'bflex-row' + ' ' + '__align-center' + ' ' + S.header}>
            <h3 className="flex-size-fill">{props.title}</h3>
            <button className={S.closeBtn + ' ' + 'flex-size-own'} onClick={closeDialogHandler}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" >
                    <path style={{fill:'var(--btn-color)'}} fill-rule="evenodd" d="M5.293 5.293a1 1 0 011.414 0l12 12a1 1 0 01-1.414 1.414l-12-12a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    <path style={{fill:'var(--btn-color)'}} fill-rule="evenodd" d="M18.707 5.293a1 1 0 010 1.414l-12 12a1 1 0 01-1.414-1.414l12-12a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
        <div className={S.body}>{props.children}</div>
    </div>
}
