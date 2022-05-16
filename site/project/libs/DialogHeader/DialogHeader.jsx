import { useCallback, useEffect, useState } from 'react'
import { getStaticProps } from 'pages/service'
import S from './DialogHeader.module.css'
import { removeLastComponent } from 'libs/ComponentHeap/ComponentHeap';

export default function DialogHeader(props) {
    const closeDialogHandler = useCallback(() => {
        removeLastComponent();
    })

    return <div className={S.root}>
        <div class={'bflex-row ' + S.header}>
            <h3 class="flex-size-fill">{props.title}</h3>
            <div class="flex-size-own" onClick={closeDialogHandler}>[X]</div>
        </div>
        <div class={S.body}>{props.children}</div>
    </div>
}
