#!/usr/bin/env node

// V1

function read_stdin(){
    return new Promise((resolve, reject) => {
        const chunks = [];
        process.stdin
            .on('data', data => {
                chunks.push(data)
            })
            .on('end', () => {
                const input = Buffer.concat(chunks).toString('utf8');
                resolve(input);
            });
    })
}

function parseCsvLine(line, delimeter=',') {
	let out = [];
	let prev = 0;
	let p = 0;
	let slug, bracketCount, start, brStartPos;

	while (p !== -1 && p < line.length){
		p = line.indexOf(delimeter, prev);
		slug = p !== -1 ? line.substring(prev, p) : line.substring(prev);
		brStartPos = slug.indexOf('"'); // It's opening bracket
		
		if (brStartPos !== -1) {
			bracketCount = 1;
			start = prev + brStartPos;
			slug = line.substring(prev, start);
			p = ++start;
			for (; p < line.length; p++) {
				if (line.charAt(p) === '"') { // It's closing bracket
					if (p > 0) {
						if (line.charAt(p - 1) === '\\') {
							slug += line.substring(start, p - 1);
							start = p;
						} 
						else {
							bracketCount++;
							slug += line.substring(start, p);
							start = p + 1;
						}
					}
				} 
				else if (line.charAt(p) === delimeter && bracketCount === 2) {
					break;
				}
			}
			slug += line.substring(start, p);
			out.push(slug);
		} 
		else {
			out.push(slug);
		}
		prev = p+1;
	}
	return out;
}

function csv2array(content, delimeter, postprocess){
    const reducer = !postprocess ? (list, line) => {
        if (line) list.push(parseCsvLine(line, delimeter));
        return list;
    } : (list, line) => {
        if (line) list.push(parseCsvLine(line, delimeter).map(cell => postprocess(cell)));
        return list;
    }
	return content
        .split('\n')
        .reduce(reducer, []);
}

function normalizeValue(value) {
    if (/^[+\-]?\d+\.?\d+?$|^[+\-]?\d+?\.?\d+$/.test(value)) return value - 0;
    else if(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(value)) return Date.parse(value);
    return value;
}

///////////////////////////////////////////////////////////////////////////

const DELIMETER = ';';

if (process.stdin.isTTY) {
    // called without pipe
    console.log('called without pipe');
    // TODO
} else {
    // called with data streamed in
    read_stdin()
        .then(function (input) {
            const grid = csv2array(input, DELIMETER, normalizeValue);

            return grid;
        })
        .then(function (grid) {
            // TODO make it optional:
            // Converting a Matrix to a List of Objects
            const keys = grid.shift();
            
            return grid.map((row) => {
                const out = {};
                for(let i = 0; i < keys.length; i++) {
                    out[keys[i]] = row[i];
                }

                return out;
            }) 
        })
        .then(function (grid) {
            // TODO parametrize JSON serialization
            process.stdout.write(JSON.stringify(grid, null, '\t'))
        })
}
