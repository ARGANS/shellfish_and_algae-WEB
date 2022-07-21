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


function groupByColumn(matrix, columnNumber) {
    return matrix.reduce((index, row) => {
        const value = row[columnNumber];
        if (!index.hasOwnProperty(value)) index[value] = [];
        index[value].push(row);
        return index;
    }, {});
};

if (process.stdin.isTTY) {
    // called without pipe
    console.log('called without pipe');
    // TODO
} else {
    // called with data streamed in
    read_stdin()
        .then(function (input) {
            return JSON.parse(input);
        })
        .then(function (input) {
            const parameters = 'Temperature,eastward_Water_current,northward_Water_current,Nitrate,Ammonium,Phosphate,par'.split(',');
            // TODO parametrize 
            const collection = groupByColumn(
                input.filter(row => parameters.indexOf(row.Parameter) > -1),
                'Place'
            )
            for (let place in collection) {
                collection[place] = groupByColumn(
                    collection[place],
                    'Parameter'
                )
            }
            return collection;
        })
        .then(function (grid) {
            // TODO parametrize JSON serialization
            process.stdout.write(JSON.stringify(grid, null, '\t'))
        })
}
