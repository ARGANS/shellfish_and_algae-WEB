export function downloadFileFromText(filename, content) {
    const 	a = document.createElement('a'),
            blob = new Blob([content], {type : "text/plain;charset=UTF-8"});
  
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function downloadLink(link_s, filename_s) {
    const 	a = document.createElement('a');
  
    a.href = link_s;
    if (filename_s) a.download = filename_s;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
