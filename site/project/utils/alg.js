// console.log(mult(0.2,0.1))
// console.log(0.2*0.1) 
export function mult(...args) {
	let div = 1;
	return args.reduce(function(mult, num)  {
		const s = num +'';
		const pos = s.indexOf('.');
		let n = num;
		
		if (pos > -1) {
			const p = s.substr(pos + 1).length;	
			div *= Math.pow(10, p)
			n *= Math.pow(10, p);
		}
		return mult * n;
	}, 1) / div;
} 
