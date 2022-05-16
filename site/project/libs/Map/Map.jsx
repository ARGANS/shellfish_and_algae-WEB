import S from './Map.module.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useCallback, useRef } from 'react';
// import Switcher from '../ui/Switcher/Switcher';
// import { DEBUG } from '../../content/main';
// import List from '../ui/list/List';


const DEBUG = false;


const MAP_NODE = 'leaflet-map';
const LAYERS = {
	// ospar2: '/content/OSPAR2_P90_MODIS_2015-2020.tif',
	// ospar3: '/content/OSPAR3_P90_MODIS_2015-2020.tif',
	// ospar4: '/content/OSPAR4_P90_MODIS_2015-2020.tif',
	ospar2: '/content/p90_modis_chlorophyll_a_2015-2020_3to10_OSPARII.tif',
	ospar3: '/content/p90_modis_chlorophyll_a_2015-2020_3to10_OSPARIII.tif',
	ospar4: '/content/p90_modis_chlorophyll_a_2015-2020_3to10_OSPARIV.tif',
};
const LayerList = [
	{name: 'ospar2', label: 'OSPAR II'},
	{name: 'ospar3', label: 'OSPAR III'},
	{name: 'ospar4', label: 'OSPAR IV'},
];
const LAYER_FLAG = '__name';

if (DEBUG) {
	LAYERS.test = '/content/chlorophyll_a_20210228.tif';
	LayerList.push({name: 'test', label: 'Test'});
};


export default function Map() {
	const mapRef = useRef();
	useEffect(() => {
		// let $footer = document.getElementById('footer');
		// if ($footer) {
		// 	$footer.checked = true;
		// }
		const mapWidget = mapRef.current = L.map(MAP_NODE, {
            attributionControl: false,
            zoom : 5,
            center : [53, 0],
            zoomControl: false,
            maxZoom: 17,
        });
		L.control.zoom({
            position: 'topright'
        }).addTo(mapWidget);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(mapWidget);

		if (DEBUG) {
			console.log('mapWidget');
			console.dir(mapWidget);
			mapWidget.on('click', e => {
				const selectedGeoPoint = e.latlng;
				console.log('CLICK %s', JSON.stringify(e.latlng));
				console.dir(e);

				mapWidget.eachLayer(layer => {
					if (!layer.hasOwnProperty('georasters')) return;
					const layerBounds = layer.getBounds();
					if (!layerBounds.contains(selectedGeoPoint)) return;

					const NEpoint = mapWidget.options.crs.latLngToPoint(layerBounds.getNorthEast(), mapWidget.getZoom())
					const SWpoint = mapWidget.options.crs.latLngToPoint(layerBounds.getSouthWest, mapWidget.getZoom())

					console.log('L:');
					console.dir(layer);
					console.log('Bounds:');
					console.dir([
						NEpoint,
						SWpoint,
						NEpoint.x - SWpoint.x,
						NEpoint.y - SWpoint.y,
					])
					const tileBounds = layer._getTiledPixelBounds(e.latlng);
					const dX = tileBounds.max.x - tileBounds.min.x;
					const dY = tileBounds.max.y - tileBounds.min.y;
					console.dir(tileBounds);
					console.log('Layer dX %s, dY %s ', dX,dY);
					var x = e.layerPoint.x;
					var y = e.layerPoint.y;
					console.log([x, y]);
				});
			});
		}
	}, []);

	// const onChangeHandler = useCallback((e) => {
	// 	const {name, checked} = e.target;
	// 	const {current: map} = mapRef;

	// 	if (!map || !LAYERS[name]) {
	// 		console.warn('Map wasnt found');
	// 		return;
	// 	}

	// 	if (checked) {
	// 		let layerExist = false;
	// 		map.eachLayer(layer => {
	// 			if (layer.hasOwnProperty('georasters') && layer[LAYER_FLAG] === name) {
	// 				layer.setZIndex(1);
	// 				layerExist = !layerExist;
	// 			}
	// 		});
	// 		if (!layerExist) {
	// 			let layerAdapter;

	// 			if (name !== 'test') {
	// 				layerAdapter = ({default: loadLayer}) => loadLayer(LAYERS[name]);
	// 			} else {
	// 				layerAdapter = ({loadDebugTiff}) => loadDebugTiff(LAYERS[name]);
	// 			}
	// 			import('../../utils/loadLayer')
	// 				.then(layerAdapter)
	// 				.then(layer => {
	// 					layer[LAYER_FLAG] = name;
	// 					layer.addTo(map);
	// 					// map.fitBounds(layer.getBounds());    
	// 				})
	// 				.catch(error => {
	// 					console.warn('ERROR');
	// 					console.dir(error);
	// 				});
	// 		}
	// 	} else {
	// 		map.eachLayer(layer => {
	// 			if (layer.hasOwnProperty('georasters') && layer[LAYER_FLAG] === name) {
	// 				layer.setZIndex(-100);
	// 				// map.removeLayer(layer);
	// 			}
	// 		});
	// 	}
	// }, []);

	return <div className={S.root}>
		<div className={S.header}>
			<input type="checkbox" id="toggleLayerMenu" className="invisible act-toggle__target"/>
			<label htmlFor="toggleLayerMenu"><i className=""></i><span>Layers</span></label>
			{/* <h1>Percentiles 90 products 2015-2020 (MODIS-AQUA)</h1> */}
			<ul className={'act-toggle__show-subject ' + S.menu}>
				{/* <List 
					items={LayerList.map(item => ({
						key: item.name,
						props: {
							...item, 
							onChange: onChangeHandler
						},
					}))} 
					component={(props) => <li><Switcher {...props}/></li>} 
				/> */}
			</ul>
		</div>
		<div className={S.body}>
			<div className={S.map} id={MAP_NODE}></div>
			{/* <img src="/assets/images/legend.jpg" className={S.legend} alt=""/> */}
		</div>
	</div>
}
