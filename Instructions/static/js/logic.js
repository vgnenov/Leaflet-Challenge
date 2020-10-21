function getColor(magnitude) {
    return magnitude > 5 ? '#ee6c6e' :
        magnitude > 4 ? '#eea770' :
            magnitude > 3 ? '#f2b957' :
                magnitude > 2 ? '#f2db5a' :
                    magnitude > 1 ? '#e2f15b' :
                        '#b8f15a';
}

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3>Magnitude: <strong>" + feature.properties.mag + "</strong><hr><p>"
            + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillColor: getColor(feature.properties.mag),
                fillOpacity: 1.0,
                weight: 1,
                color: "black"
            });
        },
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define lightmap layer
    const lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [37.09, -119.42],
        zoom: 5,
        layers: [lightmap, earthquakes]
    });

    // Add in our legend
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (myMap) {
        let div = L.DomUtil.create('div', 'info legend');
        labels = ['<strong>Magnitude</strong>'],
            mag_categories = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];
        mag_categories_color = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]

        for (let i = 0; i < mag_categories.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<i style="background:' + getColor(mag_categories_color[i]) + '"></i> ' +
                    (mag_categories[i] ? mag_categories[i] : '+'));
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);

}

(async function () {
    // const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php";
    const data = await d3.json(queryUrl);

    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
})()