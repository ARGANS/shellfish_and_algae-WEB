import S from './Map.module.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useCallback, useRef, useState } from 'react';


const DEBUG = false;
const MAP_NODE = 'leaflet-map';
const LAYER_FLAG = '__name';

const files = [
	'Biomass_CO2.tif',
	'CO2_uptake_PUA.tif',
	'DW.tif',
	'DW_line.tif',
	'DW_PUA.tif',
	'FW.tif',
	'FW_line.tif',
	'FW_PUA.tif',
	'kcal_PUA.tif',
	'protein_PUA.tif',
];

export default function Map(props) {
	const mapRef = useRef();
	useEffect(() => {
		console.log('[MAP]');
		console.dir(props);
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
	const [selectedFile, setSelectedFile] = useState(null);
	const tileSelectHandler = useCallback(({target: $target}) => {
		const fileName = $target.getAttribute('name');
		setSelectedFile(fileName);
	});

	useEffect(async () => {
		if (!selectedFile) return;
		
		const {current: map} = mapRef;
		
		// TODO Does not work due to NGINX redirection issue:
		// const resource_link = '/assets/chlorophyll_a_20210228.tif';
			// curl -Sk https://localhost:4443/assets/chlorophyll_a_20210228.tif
			// curl -Sk https://localhost:4443/assets/index.css
		
		// const resource_link = '/api/v2/file?path=/media/share/chlorophyll_a_20210228.tif';
		const resource_link = '/api/v2/file?path=/media/share/ref/' + selectedFile;
		
		console.log('[selectedFile] %s %s', selectedFile, resource_link);
		
		let layerExist = false;
		map.eachLayer(layer => {
			if (!layer.hasOwnProperty(LAYER_FLAG)) return;

			if (layer[LAYER_FLAG] === selectedFile) {
				layer.setZIndex(1);
				layerExist = !layerExist;
			} else {
				layer.setZIndex(-100);
				map.removeLayer(layer);
			}
		});

		if (layerExist) return;

		let layerAdapter;

		layerAdapter = ({default: loadLayer}) => loadLayer(resource_link);
		// Monochromatic:
		// layerAdapter = ({loadDebugTiff}) => loadDebugTiff(resource_link);

		import('utils/loadLayer')
			.then(layerAdapter)
			.then(layer => {
				layer[LAYER_FLAG] = selectedFile;
				layer.addTo(map);
				// map.fitBounds(layer.getBounds());    
			})
			.catch(error => {
				console.log('ERROR');
				console.dir(error);
			});
	
	}, selectedFile)

	return <div className={S.root}>
		<div className={S.header}>
			<input type="checkbox" id="toggleLayerMenu" className="invisible act-toggle__target"/>
			<label htmlFor="toggleLayerMenu">Switch layers:</label>
			<ul className={'act-toggle__show-subject ' + S.menu}>
				{files.map(file => (
					<li 
						key={file} 
						name={file}
						className={selectedFile === file ? S.selected : ''} 
						onClick={tileSelectHandler}
					>{file}</li>
				))}
			</ul>
		</div>
		<div className={S.body}>
			<div className={S.map} id={MAP_NODE}></div>
			{/* <img src="/assets/images/legend.jpg" className={S.legend} alt=""/> */}
		</div>
	</div>
}
