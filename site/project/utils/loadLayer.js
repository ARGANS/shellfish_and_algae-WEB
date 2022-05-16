import * as parse_georaster from 'georaster';
import * as GeoRasterLayer from 'georaster-layer-for-leaflet';
import '../utils/proj4-src';

const TRESHOLDS = [0.1, 1, 1.8, 2.5, 3, 4, 5, 6, 7, 8, 10, 12, 16, 21, 25];
const COLORS = ['86,1,253', '86,84,255', '87,169,253', '85,255,255', '0,255,127', '170,255,126', '170,255,3', '253,255,122', '255,255,1', '255,248,44', '255,229,93', '255,171,127', '255,170,1', '255,137,57', '255,85,0', '255,3,67'];
const MAX_COLOR = COLORS[COLORS.length - 1];
const N_TRESHOLDS = TRESHOLDS.length;


export default function loadLayer(imageTiffLink) {
	return fetch(imageTiffLink)
		.then(response => {
			if (response.status >= 400) throw(response.status);
			return response.arrayBuffer();
		})
		.then(arrayBuffer => parse_georaster(arrayBuffer))
		.then(georaster => {
			const layer = new GeoRasterLayer({
				georaster: georaster,
				pixelValuesToColorFn: values => {
					if (values.length === 1) {
						const value = values[0];
						if (value < 0) return 'rgba(0,0,0,0)';
						let color = MAX_COLOR;

						for (let i = 0; i < N_TRESHOLDS; i++) {
							color = COLORS[i];
							if (value < TRESHOLDS[i]) {
								break;
							}
						}
						return 'rgba(' + color + ',255)';
					} else {
						if (values[0] === 255 && values[1] === 255 && values[2] === 255) return 'rgba(0,0,0,0)';
						return 'rgba(' + values.join(',') + ')';
					}
				},
				// opacity: 1,
				resolution: 512 // optional parameter for adjusting display resolution
			});
			return layer;
		});
}

export function loadDebugTiff(tiffLink) {
	return fetch(tiffLink)
		.then(response => {
			if (response.status >= 400) throw(response.status);
			return response.arrayBuffer();
		})
		
		.then(arrayBuffer => parse_georaster(arrayBuffer))
		.then(georaster => {
			const colorStat = {};
			const MAX = georaster.maxs[0];
			// const MAX = 100;
			const MIN = 0;
			const layer = new GeoRasterLayer({
				georaster: georaster,
				pixelValuesToColorFn: values => {
					const pixel = values.join(',');

					if (colorStat.hasOwnProperty(pixel)) {
						colorStat[pixel]++;
					} else {
						colorStat[pixel] = 0;
					}
					if (values[0] < 0) return 'rgba(0,0,0,0)';
					const red = values[0] > 0 ? (~~((values[0] - MIN) * 256 / MAX)): 0;
					
					return 'rgba(' + red + ',0,0,255)';
				},
				// opacity: 1,
				resolution: 512 // optional parameter for adjusting display resolution
			});
			return layer;
		});
}
