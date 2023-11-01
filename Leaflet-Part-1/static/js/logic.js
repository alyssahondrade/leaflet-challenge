// USGS - Past 7 days, all earthquakes
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

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

    // Get the depths as an array
    let depth_array = feature.map((feat) => feat.geometry.coordinates[2]);
    let min_depth = Math.min(...depth_array);
    let max_depth = Math.max(...depth_array);

    let rounded_min = Math.floor(min_depth/10) * 10;
    let rounded_max = Math.floor(max_depth/10) * 10;
    console.log(rounded_min, rounded_max);

    // Define colour scale and limits
    let colour_scale = chroma.scale(chroma.brewer.YlOrRd).colors(10);
    console.log(colour_scale);
    let chroma_limits = chroma.limits(depth_array, 'e', 9);

    let scaled = []
    chroma_limits.forEach((step) => scaled.push(Math.floor(step/50) * 50));
    console.log(scaled);
    
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
        if (depth < chroma_limits[1]) {
            marker.options.fillColor = colour_scale[1];
        }
        else if (depth < chroma_limits[2]) {
            marker.options.fillColor = colour_scale[2];
        }
        else if (depth < chroma_limits[3]) {
            marker.options.fillColor = colour_scale[3];
        }
        else if (depth < chroma_limits[4]) {
            marker.options.fillColor = colour_scale[4];
        }
        else if (depth < chroma_limits[5]) {
            marker.options.fillColor = colour_scale[5];
        }
        else if (depth < chroma_limits[6]) {
            marker.options.fillColor = colour_scale[6];
        }
        else if (depth < chroma_limits[7]) {
            marker.options.fillColor = colour_scale[7];
        }
        else if (depth < chroma_limits[8]) {
            marker.options.fillColor = colour_scale[8];
        }
        else if (depth < chroma_limits[9]) {
            marker.options.fillColor = colour_scale[9];
        }
        
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