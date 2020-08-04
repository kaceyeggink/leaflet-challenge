// Store our API endpoint inside queryUrl
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Get Request & Response for earthquake data
d3.json(earthquakeURL, function(data) {
  createFeatures(data.features);
});

// Create a function to bind the earthquake data
function createFeatures(earthquakeData) {

  // Use the onEachFeature function to show the magnitute, location and time of each earthquake
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    // Create the layer to hold the earthquake data 
    pointToLayer: function (feature, latlng) {

      // Assign varried circle size based on earthquake magnitude
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .6,
        color: "#000",
        stroke: true,
        weight: .8
    })
  }
  });

  // Add earthquake layer to the createMap
  createMap(earthquakes);
}

// Establish the createMap function
function createMap(earthquakes) {

    // Define map styles
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2FjZXllZ2dpbmsiLCJhIjoiY2tjZmdrbHN1MGh2ODJxa2t4eDg5MHIzaSJ9.2kovYu4cG7H9l5YiTxs5cg." +
      "T6YbdDixkOBWH_k9GbS8JQ");

    var streets = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoia2FjZXllZ2dpbmsiLCJhIjoiY2tjZmdrbHN1MGh2ODJxa2t4eDg5MHIzaSJ9.2kovYu4cG7H9l5YiTxs5cg." +
      "T6YbdDixkOBWH_k9GbS8JQ");
  
    // Define a baseMaps object to hold map styles
    var baseMaps = {
      "Satellite": satellite,
      "Streets": streets
    };

    // Define the tectonic plate data as a layer
    var tectonicPlates = new L.LayerGroup();

    // Define both layer in map with Map Overlay
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Define the Map and set the size/ zoom
    var myMap = L.map("map", {
      center: [
        36.73, -119.79],
      zoom: 2.00,
      layers: [satellite, earthquakes, tectonicPlates]
    }); 

    // Get Request & Response for tectonic plate data
    d3.json(tectonicPlatesURL, function(plateData) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(plateData, {
        color: "purple",
        weight: 1
      })
      .addTo(tectonicPlates);
  });

    // Join the sytles and the layers to the control menu
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  //Add a legend to myMap
  var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}

  // Set the color range tied to each magnitude circle
  function getColor(d){
    return d > 5 ? "#a50f15":
    d  > 4 ? "#de2d26":
    d > 3 ? "#fb6a4a":
    d > 2 ? "#fc9272":
    d > 1 ? "#fcbba1":
             "#fee5d9";
  }

  // Set the radius ties to each magnitude 
  function getRadius(value){
    return value*50000
  }