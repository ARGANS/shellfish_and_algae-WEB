import { useEffect, useRef, useCallback } from 'react';
import { removeLastComponent } from '../ComponentHeap/ComponentHeap';
import S from './Dialog.module.css';

export default function Dialog(props) {
	const dialogRef = useRef();
	useEffect(() => {
		if (dialogRef.current) {
			dialogRef.current.focus();
		}
	}, []);
	const handleKeyPress = useCallback((e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		if (e.keyCode === 27) {
			removeLastComponent(props?.hostId);
		}
	}, [props.hostId]);

	const dialogProps = {
		className: S.root,
		'data-key': props.dialogKey,
		ref: dialogRef,
		tabIndex: 1,
		onKeyDown: handleKeyPress,
	};
	return <dialog open {...dialogProps}>
		<div className={S.inner}>{props.children}</div>
	</dialog>
}
