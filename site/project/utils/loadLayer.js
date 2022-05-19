// import * as parse_georaster from 'georaster';
import * as GeoRasterLayer from 'georaster-layer-for-leaflet';
import * as parse_georaster from 'libs/georaster/dist/georaster.browser.bundle'
import 'utils/proj4-src';

const COLORS = ['0,0,0,0', '86,1,253', '86,84,255', '87,169,253', '85,255,255', '0,255,127', '170,255,126', '170,255,3', '253,255,122', '255,255,1', '255,248,44', '255,229,93', '255,171,127', '255,170,1', '255,137,57', '255,85,0', '255,3,67'];


function getColor(value_n, min_n, max_n, colors) {
	let pos = ~~((value_n - min_n) * (colors.length / (max_n - min_n)));
	if (pos < 0) pos = 0;
	if (pos >= colors.length) pos = colors.length - 1; 
	return colors[pos];
}

function fetchArrayBuffer$(resource_s) {
	return fetch(resource_s)
		.then(response => {
			if (response.status >= 400) throw(response.status);
			return response.arrayBuffer();
		})
}

export default function loadLayer(imageTiffLink) {
	return fetchArrayBuffer$(imageTiffLink)
		.then(arrayBuffer => parse_georaster(arrayBuffer, { 
			projection: 4326, 
		}))
		.then(georaster => {
			console.log('GEORASTER')
			console.dir(georaster)
			const MAX = georaster.maxs[0];
			const MIN = georaster.mins[0];
			const layer = new GeoRasterLayer({
				georaster: georaster,
				pixelValuesToColorFn: values => {
					if (values.length === 1) {
						const value = values[0];
						if (value <= MIN) return 'rgba(0,0,0,0)';
						
						let color = getColor(value, MIN, MAX, COLORS);
						if (!color) {
							return 'rgba(0,0,0,0)';
						}
						return 'rgba(' + color + ')';
					} else {
						if (values[0] === 255 && values[1] === 255 && values[2] === 255) return 'rgba(0,0,0,0)';
						return 'rgba(' + values.join(',') + ')';
					}
				},
				// opacity: 1,
				resolution: 512 // optional parameter for adjusting display resolution
			});
			return layer;
		})
}

export function loadDebugTiff(tiffLink) {
	return fetchArrayBuffer$(tiffLink)
		.then(arrayBuffer => parse_georaster(arrayBuffer, { 
			projection: 4326, 
		}))
		.then(georaster => {
			console.log('georaster');
			console.dir(georaster);
			const colorStat = {};
			const MAX = georaster.maxs[0];
			const MIN = georaster.mins[0];
			
			const layer = new GeoRasterLayer({
				georaster: georaster,
				pixelValuesToColorFn: values => {
					const pixel = values.join(',');
					
					if (colorStat.hasOwnProperty(pixel)) {
						colorStat[pixel]++;
					} else {
						colorStat[pixel] = 0;
					}
					if (values[0] <= MIN) return 'rgba(0,0,0,0)';
						
					
					const red = values[0] > 0 ? (~~((values[0] - MIN) * 256 / MAX)): 0;
					
					if (red === 0) return 'rgba(0,0,0,0)';
					
					return 'rgba(' + red + ',0,0,1)';
					// 0 - 1 - from transprent to non transparent
				},
				// opacity: 1,
				resolution: 512 // optional parameter for adjusting display resolution
			});
			return layer;
		})
		.catch(exc => {
			console.log('EXC2');
			console.dir(exc);
		})

}
