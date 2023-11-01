// USGS - All month, all earthquakes
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Define map parameters
let australia_coords = [];
let map_zoom = 8;

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
        center: australia_coords,
        zoom: map_zoom,
        labels: [map_background, layer]
    });

    // Create layer control and add to the map
    L.control.layers(base_maps, overlay_maps).addTo(my_map);
};


function create_markers(response) {

    // Pull the "features" property from the response
    let feature = response.features;

    for (let i=0; i<feature.length; i++) {
        console.log(feature[i]);

        // Parse the "coordinates" property
        let lat = feature[i].geometry.coordinates[1];
        let lon = feature[i].geometry.coodrinates[0];
        let depth = feature[i].geometry.coordinates[2];

        // Get the "magnitude"
        let mag = feature[i].property.mag;

        
    };
};



// Get the data from the url
d3.json(url).then(function(response) {
    create_markers(response);
});