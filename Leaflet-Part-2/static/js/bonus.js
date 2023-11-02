// USGS - Past 7 days, all earthquakes
let url_markers = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let url_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Define map parameters
let map_centre = [-25.274399, 133.775131]; // Australia
// let map_centre = [-33.137550, 81.826172]; // Indian Ocean
// let map_centre = [-0.789275, 113.921326]; // Indonesia
let map_zoom = 3.5;

function create_map(markers_layer, tectonic_layer, colour_scale, colour_limits) {
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
        Earthquakes: markers_layer,
        Plates: tectonic_layer
    };

    // Create the map
    let my_map = L.map("map", {
        center: map_centre,
        zoom: map_zoom,
        layers: [map_background, markers_layer, tectonic_layer]
    });

    // Create layer control and add to the map
    L.control.layers(base_maps, overlay_maps).addTo(my_map);

    // Setup the legend
    let legend = L.control({position: "bottomright"});

    // Create the labels to be used in the legend
    colour_labels = [];
    for (let i=0; i<colour_limits.length; i++) {
        if (i === colour_limits.length-1) {
            colour_labels.push(`${colour_limits[i]}+`);
        }
        else {
            colour_labels.push(`${colour_limits[i]}-${colour_limits[i+1]}`);
        }
    };

    // Build the legend
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let labels = [];

        // Create the `li` element for each legend colour
        colour_limits.forEach(function(option, index) {
            labels.push(
                `<li style="display: flex; align-items: center; padding: 0;">
                    <span style="width: 20px; height: 20px; background-color: ${colour_scale[index]}; margin-right: 5px;"></span>
                    <span">${colour_labels[index]}</span>
                </li>`
            );
        });

        // Append each label to an unordered list in the 'div'
        div.innerHTML += `<ul style="list-style: none; padding:0; margin: 0;">${labels.join("")}</ul>`;

        // Style the 'div'
        div.style['backgroundColor'] = "mintcream"; // change the background colour
        div.style['border-radius'] = "5px"; // round off the edges
        div.style['padding'] = "10px"; // pad the list 

        return div;
    };

    legend.addTo(my_map);
};


function create_markers(marker_response, plate_response) {
    // Pull the "features" property from the responses
    let feature = marker_response.features;
    let line_feature = plate_response.features;

    //--------- CREATE MARKERS ---------//
    // Get the depths as an array
    let depth_array = feature.map((feat) => feat.geometry.coordinates[2]);
    let min_depth = Math.min(...depth_array);
    let max_depth = Math.max(...depth_array);

    let rounded_min = Math.floor(min_depth/10) * 10;
    let rounded_max = Math.floor(max_depth/10) * 10;

    // Define colour scale and limits
    let num_colours = 6;
    let colour_scale = chroma.scale(["peachpuff", "palevioletred", "rebeccapurple"]).colors(num_colours);
    let chroma_limits = chroma.limits(depth_array, 'e', num_colours-1);

    // Round off the limits to more consistent numbering
    let colour_limits = []
    chroma_limits.forEach((step) => colour_limits.push(Math.floor(step/100) * 100));
    
    // Initialise the array to hold the markers
    let earthquake_markers = [];
    
    for (let i=0; i<feature.length; i++) {
        // Parse the "coordinates" property
        let lat = feature[i].geometry.coordinates[1];
        let lon = feature[i].geometry.coordinates[0];
        let depth = feature[i].geometry.coordinates[2];

        // Get the "magnitude"
        let mag = feature[i].properties.mag;

        // Get the "place", as additional info for the popup
        let location = feature[i].properties.place;
        
        // Create the marker
        let marker = L.circleMarker([lat, lon], {
            radius: mag*5,
            fillColor: colour_scale[0],
            fillOpacity: 1,
            color: "grey", // line colour
            weight: 1 // line weight
        }).bindPopup(location);

        // Adjust the colour
        for (let i=0; i<colour_limits.length; i++) {
            if (depth < colour_limits[i]) {
                marker.options.fillColor = colour_scale[i];
                break; // once executed, stop
            }
        };

        // Append the marker to the array
        earthquake_markers.push(marker);
    };

    //--------- CREATE LINES ---------//
    // Initialise the array to hold the lines
    let tectonic_lines = [];

    for (let i=0; i<line_feature.length; i++) {
        // console.log(line_feature[i].geometry.coordinates[0]);

        let line_array = line_feature[i].geometry.coordinates[0];
        for (let item of line_array) {
            item.reverse();
        };
        let lines = L.polyline(line_array, {color: "yellow"});
        tectonic_lines.push(lines);
    };

    // Create a layer group made from the lines array
    let tectonic_layer = L.layerGroup(tectonic_lines);

    // Create a layer group made from the marker array
    let markers_layer = L.layerGroup(earthquake_markers);

    // Call the create_map() function
    create_map(markers_layer, tectonic_layer, colour_scale, colour_limits);
};

// Get the data from the url
d3.json(url_markers).then(function(marker_response) {
    d3.json(url_plates).then(function(plate_response) {
        create_markers(marker_response, plate_response);
    });
});