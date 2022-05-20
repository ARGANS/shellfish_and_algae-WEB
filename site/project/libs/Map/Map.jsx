import S from './Map.module.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useCallback, useRef, useState } from 'react';


const OPEN_POPUP = true;
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

function getValueFromGeoRasterLayer(layer, leafletPoint) {
	const NWtoPoint_y = layer.ymax - leafletPoint.lat; 
	const NWtoPoint_x = leafletPoint.lng - layer.xmin; 
	const dy = NWtoPoint_y * ( layer.height / layer.extent.height)
	const dx = NWtoPoint_x * ( layer.width / layer.extent.width)
	const raster = layer.rasters.at(leafletPoint);


	console.log('Point (%s %s) [%s %s] GeoCoordinates', NWtoPoint_x, NWtoPoint_y, layer.extent.width, layer.extent.height);
	console.log('(%s, %s)', dx, dy)

	return Array.isArray(raster) ? raster[~~dy][~~dx] : null;
}

export default function Map(props) {
	const mapRef = useRef();
	useEffect(() => {
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

		if (OPEN_POPUP) {
			const _popup = L.popup()
			mapWidget.on('click', e => {
				const selectedGeoPoint = e.latlng;
				console.log('selectedGeoPoint %s %s', JSON.stringify(e.latlng), e.layerPoint);
				
				mapWidget.eachLayer(layer => {
					if (!layer.hasOwnProperty(LAYER_FLAG)) return;
					const layerBounds = layer.getBounds();
					if (!layerBounds.contains(selectedGeoPoint)) return;

				
					const value = getValueFromGeoRasterLayer(layer, selectedGeoPoint);
					_popup
						.setLatLng(selectedGeoPoint)
						.setContent('You clicked the map at ' + selectedGeoPoint.toString() + ' Value: ' + value)
						.openOn(mapWidget);
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
