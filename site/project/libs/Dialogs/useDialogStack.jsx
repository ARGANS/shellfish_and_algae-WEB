import { useCallback } from "react";
import { addComponent, filterComponents, removeAllComponents} from '../ComponentHeap/ComponentHeap';

export function useDialogStack(hostId) {
	const addDialog = useCallback((component) => {
		addComponent(component, hostId)
	}, [hostId]);
	const removeAllDialogs = useCallback(() => {
		removeAllComponents(hostId);
	}, [hostId]);

	return [addDialog, removeAllDialogs];
}

export function findClosestDialog(node) {
	const dialog = node.closest('dialog');
	const host = dialog?.parentNode?.dataset?.host;
	return host ? [dialog.dataset.key, host] : [];
}

export function closeDialog(dialogKey, hostId) {
	filterComponents(comp => comp.props.dialogKey.toString() !== dialogKey, hostId)
}
