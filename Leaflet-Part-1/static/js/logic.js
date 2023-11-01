// USGS - All month, all earthquakes
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

function create_markers(response) {
    // console.log(response.features);

    let features = response.features;

    for (let i=0; i<features.length; i++) {
        console.log(features[i]);
    };
};



// Get the data from the url
d3.json(url).then(function(response) {
    create_markers(response);
});