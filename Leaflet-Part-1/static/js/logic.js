// USGS - All month, all earthquakes
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Define map parameters
let map_centre = [-25.274399, 133.775131]; // Australia
// let map_centre = [-33.137550, 81.826172]; // Indian Ocean
let map_zoom = 3.5;

function create_map(layer) {
    // Create the map background tile layer
    let map_background = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    // Create base_maps object
    let base_maps = {
        Background: map_background
    };

    // Create overlay_maps object
    let overlay_maps = {
        Earthquakes: layer
    };

    // Create the map
    let my_map = L.map("map", {
        center: map_centre,
        zoom: map_zoom,
        layers: [map_background, layer]
    });

    // Create layer control and add to the map
    L.control.layers(base_maps, overlay_maps).addTo(my_map);
};


function create_markers(response) {

    // Pull the "features" property from the response
    let feature = response.features;

    // Initialise the array to hold the markers
    let earthquake_markers = [];
    
    for (let i=0; i<feature.length; i++) {
        console.log(feature[0]);

        // Parse the "coordinates" property
        let lat = feature[i].geometry.coordinates[1];
        let lon = feature[i].geometry.coordinates[0];
        let depth = feature[i].geometry.coordinates[2];

        // Get the "magnitude"
        let mag = feature[i].properties.mag;

        // Create the marker
        let marker = L.circleMarker([lat, lon]);
        earthquake_markers.push(marker);
    };

    // Create a layer group made from the marker array
    let markers_layer = L.layerGroup(earthquake_markers);

    // Call the create_map() function
    create_map(markers_layer);
};



// Get the data from the url
d3.json(url).then(function(response) {
    create_markers(response);
});