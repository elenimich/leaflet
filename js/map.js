// Global variables
let map;
// path to csv data
let path = "data/dunitz.csv";
let markers = L.featureGroup();
//let meteo_path = ;

// initialize
$( document ).ready(function() {
    createMap(province);
	//readCSV();
	//mapProvince(province)
});


// create the map
function createMap(layer1){
	
	var lat = 43;
	var lng = 13;
	var zoom = 5.45;

	map = L.map('map',{zoomControl: false}).setView([lat,lng],zoom);

	var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    	maxZoom: 19,
    	attribution: '© OpenStreetMap'
	});

	var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    	maxZoom: 19,
    	attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
	});

	var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
	}).addTo(map);

	var baseMaps = {
		"OpenStreetMap": osm,
		"OpenStreetMap.HOT": osmHOT,
		"OpenTopoMap": openTopoMap
	};

	// Add layers
	//L.geoJSON(layer1).addTo(map);
	var myStyle = {
		"color": "black",
		"weight": 2,
		"opacity": 0.65
	};

	L.geoJSON(layer1, {
		style: myStyle,
		onEachFeature: onEachFeature
	}).addTo(map);

	//var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
	var layerControl = L.control.layers(baseMaps).addTo(map);
	

	// Add scale bar
	L.control.scale({
		metric: true,
		imperial: false,
		maxWidth:500,
		position: 'bottomleft'
	}).addTo(map);

	// Geocoder
	L.Control.geocoder().addTo(map);



	
	// custom zoom bar control that includes a Zoom Home function
	L.Control.zoomHome = L.Control.extend({
		options: {
			position: 'topright',
			zoomInText: '+',
			zoomInTitle: 'Zoom in',
			zoomOutText: '-',
			zoomOutTitle: 'Zoom out',
			zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
			zoomHomeTitle: 'Zoom home'
		},

		onAdd: function (map) {
			var controlName = 'gin-control-zoom',
				container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
				options = this.options;

			this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
			controlName + '-in', container, this._zoomIn);
			this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
			controlName + '-home', container, this._zoomHome);
			this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
			controlName + '-out', container, this._zoomOut);

			this._updateDisabled();
			map.on('zoomend zoomlevelschange', this._updateDisabled, this);

			return container;
		},

		onRemove: function (map) {
			map.off('zoomend zoomlevelschange', this._updateDisabled, this);
		},

		_zoomIn: function (e) {
			this._map.zoomIn(e.shiftKey ? 3 : 1);
		},

		_zoomOut: function (e) {
			this._map.zoomOut(e.shiftKey ? 3 : 1);
		},

		_zoomHome: function (e) {
			map.setView([lat, lng], zoom);
		},

		_createButton: function (html, title, className, container, fn) {
			var link = L.DomUtil.create('a', className, container);
			link.innerHTML = html;
			link.href = '#';
			link.title = title;

			L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
				.on(link, 'click', L.DomEvent.stop)
				.on(link, 'click', fn, this)
				.on(link, 'click', this._refocusOnMap, this);

			return link;
		},

		_updateDisabled: function () {
			var map = this._map,
				className = 'leaflet-disabled';

			L.DomUtil.removeClass(this._zoomInButton, className);
			L.DomUtil.removeClass(this._zoomOutButton, className);

			if (map._zoom === map.getMinZoom()) {
				L.DomUtil.addClass(this._zoomOutButton, className);
			}
			if (map._zoom === map.getMaxZoom()) {
				L.DomUtil.addClass(this._zoomInButton, className);
			}
		}
	});
	// add the new control to the map
	var zoomHome = new L.Control.zoomHome();
	zoomHome.addTo(map);

}

// function to read csv data
function readCSV(){
	Papa.parse(path, {
		header: true,
		download: true,
		complete: function(data) {
			console.log(data);
			
			// map the data
			mapCSV(data);

		}
	});
}

function mapCSV(data){

	// circle options
	let circleOptions = {
		radius: 5,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}

	// loop through each entry
	data.data.forEach(function(item,index){
		// create a marker
		let marker = L.circleMarker([item.latitude,item.longitude],circleOptions)
		.on('mouseover',function(){
			this.bindPopup(`${item.title}<br><img src="${item.thumbnail_url}">`).openPopup()
		})

		// add marker to featuregroup
		markers.addLayer(marker)
	})

	// add featuregroup to map
	markers.addTo(map)

	// fit map to markers
	map.fitBounds(markers.getBounds())
}


function onEachFeature(feature, layer) {
	
	layer.bindPopup(feature.properties.DEN_UTS);
	
	layer.on('mouseover', function (e) {
		this.openPopup();
	});
	layer.on('mouseout', function (e) {
		this.closePopup();
	});

	layer.on('mouseover', function(e) {
        e.target.setStyle({
            fillOpacity: 0.6
        });
    });
    
	layer.on('mouseout', function(e) {
        e.target.setStyle({
            fillOpacity: 0
        });
    });
}


// https://gis.stackexchange.com/questions/127286/home-button-leaflet-map


// province.features[0].properties.DEN_CM

//province.features.forEach(function(item){
//	console.log(item.properties.DEN_UTS)
//})





//function getData(meteo_path){
//
//}