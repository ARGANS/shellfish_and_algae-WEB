import DialogHeader from 'libs/DialogHeader/DialogHeader';
import { useCallback } from 'react';
import { removeLastComponent } from 'libs/ComponentHeap/ComponentHeap';

export function ConfirmDialog(props){
    const clickHandler = useCallback((e) => {
        // console.log('CLICK');
        // console.dir(e)
        // console.dir(props);
        // console.dir(e.target);
        if (e.target.tagName !== 'BUTTON') return;

        removeLastComponent();
    })

    return <DialogHeader title={props.title}>
        {props.children}
        <div className="ta-c" onClick={clickHandler}>
            <button className="btn btn-primary" onClick={props.onResolve ? props.onResolve : null}>{props.confirmBtnText || 'Ok'}</button>
            <button className="btn btn-secondary" onClick={props.onReject ? props.onReject : null}>{props.rejectBtnText || 'Cancel'}</button>
        </div>
    </DialogHeader>
}
