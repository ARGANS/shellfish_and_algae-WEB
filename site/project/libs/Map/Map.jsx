import S from './Map.module.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useCallback, useRef, useState } from 'react';
import Legend from './Legend/Legend';


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
	if (!layer.extent) {
		// layer.extent provides by georaster-layer-for-leaflet v3.8.0
		console.warn('Please use georaster-layer-for-leaflet v3.8.0');
		// layer.height - px
		// layer.extent.height - deg
	}
	const NWtoPoint_y = layer.ymax - leafletPoint.lat; 
	const NWtoPoint_x = leafletPoint.lng - layer.xmin; 
	const dy = NWtoPoint_y * ( layer.height / layer.extent.height)
	const dx = NWtoPoint_x * ( layer.width / layer.extent.width)
	const raster = layer.georasters.at(leafletPoint);
	// console.log('Point (%s %s) [%s %s] GeoCoordinates', NWtoPoint_x, NWtoPoint_y, layer.extent.width, layer.extent.height);
	// console.log('(%s, %s)', dx, dy)
	if (!raster) {
		return null;
	}
	const value = raster.values[0][~~dy][~~dx];

	if (value === raster.noDataValue) {
		return null;
	}
	return value;
}

const COLORS = ['86,1,253', '86,84,255', '87,169,253', '85,255,255', '0,255,127', '170,255,126', '170,255,3', '253,255,122', '255,255,1', '255,248,44', '255,229,93', '255,171,127', '255,170,1', '255,137,57', '255,85,0', '255,3,67'];


export default function Map(props) {
	const mapRef = useRef();
	const [legendSettings, setLegendSettings] = useState({});

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
					
					if (!value) return;
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
		let resource_link = props.dir + selectedFile;
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

		layerAdapter = ({default: loadLayer}) => loadLayer(resource_link, COLORS);
		// layerAdapter = ({loadMonochromeTiffLayer}) => loadMonochromeTiffLayer(resource_link);

		import('utils/loadLayer')
			.then(layerAdapter)
			.then(layer => {
				layer[LAYER_FLAG] = selectedFile;
				layer.addTo(map);
				// map.fitBounds(layer.getBounds());    
				const raster = layer.georasters[0];
				let title;
				if (raster.gdalmetadata) {
					title = raster.gdalmetadata.NETCDF_VARNAME + ', ' + raster.gdalmetadata.UNITTYPE;
				}

				setLegendSettings({
					min: raster.mins[0],
					max: raster.maxs[0],
					title
				});
			})
			.catch(error => {
				console.log('Load layer error');
				console.dir(error);
			});
	}, [selectedFile])

	return <div className={S.root}>
		<div className={S.header}>
			<h3>Layers:</h3>
			<ul className={S.menu}>
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
			{legendSettings?.max && <div className={S.legend}>
				<Legend colors={COLORS} {...legendSettings} />
			</div>}
		</div>
	</div>
}
