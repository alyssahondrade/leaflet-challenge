// USGS - Past 7 days, all earthquakes
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define map parameters
let map_centre = [-25.274399, 133.775131]; // Australia
// let map_centre = [-33.137550, 81.826172]; // Indian Ocean
// let map_centre = [-0.789275, 113.921326]; // Indonesia
let map_zoom = 3.5;

function create_map(layer, colour_scale, colour_limits) {
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

    // Setup the legend
    console.log(colour_scale);
    console.log(colour_limits);

    colour_labels = [];
    for (let i=0; i<colour_limits.length; i++) {
        if (i === colour_limits.length-1) {
            colour_labels.push(`${colour_limits[i]}+`);
        }
        else {
            colour_labels.push(`${colour_limits[i]}-${colour_limits[i+1]}`);
        }
    };
    console.log(colour_labels);
};


function create_markers(response) {

    // Pull the "features" property from the response
    let feature = response.features;

    // Get the depths as an array
    let depth_array = feature.map((feat) => feat.geometry.coordinates[2]);
    let min_depth = Math.min(...depth_array);
    let max_depth = Math.max(...depth_array);

    let rounded_min = Math.floor(min_depth/10) * 10;
    let rounded_max = Math.floor(max_depth/10) * 10;
    console.log(rounded_min, rounded_max);

    // Define colour scale and limits
    let colour_scale = chroma.scale(chroma.brewer.PuOr).colors(10);
    let chroma_limits = chroma.limits(depth_array, 'e', 9);

    let colour_limits = []
    chroma_limits.forEach((step) => colour_limits.push(Math.floor(step/50) * 50));
    
    // Initialise the array to hold the markers
    let earthquake_markers = [];
    
    for (let i=0; i<feature.length; i++) {
        // console.log(feature[0]);

        // Parse the "coordinates" property
        let lat = feature[i].geometry.coordinates[1];
        let lon = feature[i].geometry.coordinates[0];
        let depth = feature[i].geometry.coordinates[2];

        // Get the "magnitude"
        let mag = feature[i].properties.mag;       
        
        // Create the marker
        let marker = L.circleMarker([lat, lon], {
            radius: mag*5,
            fillColor: colour_scale[0],
            fillOpacity: 1,
            color: "grey",
            weight: 1
        });

        // Adjust the colour
        // console.log(depth, chroma_limits[1]);

        // AUTOMATE THIS!
        for (let i=0; i<colour_limits.length; i++) {
            if (depth < colour_limits[i]) {
                marker.options.fillColor = colour_scale[i];
                break; // once executed, stop
            }
        };
        
        earthquake_markers.push(marker);
    };

    // Create a layer group made from the marker array
    let markers_layer = L.layerGroup(earthquake_markers);

    // Call the create_map() function
    create_map(markers_layer, colour_scale, colour_limits);
};



// Get the data from the url
d3.json(url).then(function(response) {
    create_markers(response);
});