import S from './DialogForm.module.css';
import React, { useCallback } from 'react';

function buildFields(order, map) {
	return order.map((item, i) => {
		if (Array.isArray(item)) {
			return <div key={i} className={S.formrow + ' df_row'}>{buildFields(item, map)}</div>
		}
		else if (map.hasOwnProperty(item)){
			const conf = map[item];
			const formElementId = conf.name || item;
			const key = formElementId + ':'+ i;

			if (conf.type === 'email' || conf.type === 'password' || conf.type === 'text') {
				const props = {
					type: conf.type,
					name: formElementId,
				};
				if (conf.isRequired) props.required = true;
				if (conf.onInput) props.onInput = conf.onInput;
				if (conf.onInvalid) props.onInvalid = conf.onInvalid;
				if (conf.minLength) props.minLength = conf.minLength;
				if (conf.maxLength) props.maxLength = conf.maxLength;
				if (conf.placeholder) props.placeholder = conf.placeholder;
				if (conf.pattern) props.pattern = conf.pattern;
				if (conf.title) props.title = conf.title;
				return <span className={S.formInput} key={key}><input {...props}/>{conf.icon && <i className={conf.icon}/>}</span>
			}
			else if (conf.type === 'checkbox') {
				const props = {
					type: 'checkbox',
					name: formElementId,
				};
				return <label key={key} className={S.formCheckbox}><input {...props}/><span>{conf.label}</span></label>
			}
			else if (conf.type === 'submitBtn') {
				const props = {
					type: 'submit',
					className: conf.className
				};
				return <button {...props} key={key}>{conf.label}</button>
			}
			else if (conf.type === 'resetBtn') {
				const props = {
					type: 'reset',
					className: conf.className
				};
				return <button {...props} key={key}>{conf.label}</button>
			}
			else if (conf.type === 'link') {
				const props = {href: '#'};
				if (conf.onClick) props.onClick = conf.onClick;
				return <a key={key} {...props}>{conf.label}</a>
			}
			else if (conf.type === 'article') {
				return <p key={key}>{conf.content}</p>
			}
			else if (conf.type === 'select') {
				const props = {
					title: conf.title,
					style: {},
					name: formElementId,
				};
				if (conf.isHidden) {
					props.style.display = 'none';
				}
				return <select key={key} {...props}>
					{conf.options.map((option, i) => <option value={option.value} key={option.value + ':' + i}>{option.label}</option>)}
				</select>
			}
		}
		return null;
	});
}

export function DialogForm(props) {
	const {title, order, fields, ...other} = props;
	return <form className={S.root + ' DialogForm' } {...other}>
		{title && <h4>{title}</h4>}
		{fields && buildFields(order, fields)}
	</form>
}

export function getFormValues($form) {
	if (!$form.elements) return null;
	const out = {};

	for(let i = 0; i < $form.elements.length; i++) {
		if (!$form.elements[i].name) continue;
		
		if ($form.elements[i].type === 'checkbox') {
			out[$form.elements[i].name] = $form.elements[i].checked
		}
		else {
			out[$form.elements[i].name] = $form.elements[i].value;
		}
	}
	return out;
}

export function ActiveForm({children, onSubmit, onReset, onChange}) {
	if (!React.isValidElement(children)) {
        return children;
    }
	const props = {...children.props};
	if (onSubmit) {
		props.onSubmit = (e) => {
			e.preventDefault();
			onSubmit(e.target);
		};
	}
	if (onReset) {
		props.onReset = (e) => {
			e.preventDefault();
			onReset(e.target);
		};
	}
	if (onChange) {
		props.onChange = (e) => onChange(e.target);
	}
	return React.cloneElement(children, props);
}
