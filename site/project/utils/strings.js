export function remove_spaces(str) {
    return str.replace(/\s+/g, '')
}

export function classList(...classes) {
    if (classes.length < 1) return '';
    let out_s = classes[0];

    if (classes.length < 2) return out_s;
    
    for (let i = 1; i < classes.length; i++) {
        if (!classes[i]) continue;
        out_s += ' ' + classes[i];
    }
    
    return out_s;
}
