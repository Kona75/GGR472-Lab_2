mapboxgl.accessToken = 'pk.eyJ1Ijoia29uYS1qYXlhc2VrZXJhIiwiYSI6ImNtNXd2cnp0eDAyZ2wybG9veHBiNGQ2YjQifQ.moY95841bld_MDdID1PU7g'; // Add default public map token from your Mapbox account
const map = new mapboxgl.Map({
container: 'my-map', // map container ID
style: 'mapbox://styles/kona-jayasekera/cm727rtct006l01s39i61eyri', // style URL
center: [100.103714, 20.331049], // starting position [lng, lat]
zoom: 11.5// starting zoom level
})
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
// Add geolocate control to the map.
map.addControl(new mapboxgl.GeolocateControl({
positionOptions: {
enableHighAccuracy: true // uses the most accuarate location available form user's device
},
trackUserLocation: true //Shows users location on map (with permission from user)
}));
// Add fullscreen control to the map.
map.addControl(new mapboxgl.FullscreenControl());
// Add scale control to the map.
map.addControl(new mapboxgl.ScaleControl());


map.on('load', () =>{ // loading 
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/pattern-dot.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('pattern-dot', image);
        }
    );
    map.addSource('map', {
        'type': 'geojson', // data is in GeoJSON format
        'data': "Data/map.geojson" // location of the data file
        });

    map.addSource('LineString', {
        'type': 'geojson',
        lineMetrics: true, // include line metrics for line animation
        'data': "Data/LineString.geojson"
        });
    
    map.addSource('polygon', {
        'type': 'vector', // data is in vector format
        'url': "mapbox://kona-jayasekera.9k4ybs84" //Pulling the data from the tileset created in mapbox studio
        });
    
    map.addLayer({     // adding the layer to the map
        'id': 'polygon', // layer id
        'type': 'fill',    //type to represent layer
        'source': 'polygon', // source of the layer from added source
        'source-layer':'map_1-ac1asg', // source layer name from the tileset in Mapbox studio
        'paint': { // styling the layer
            'fill-color': '#FFD700', // fill color of the layer
            'fill-opacity': 0.2 // opacity of the layer
            }
        }
    );

  
    map.addLayer({
        type: 'line',
        source: 'LineString',
        id: 'line-background',
        paint: {
            'line-color': 'blue',
            'line-width': 6,  // control width of the line
            'line-opacity': 0.4
        }
    });

    // add a line layer with line-dasharray set to the first value in dashArraySequence
    map.addLayer({
        type: 'line',
        source: 'LineString',
        id: 'line-dashed',
        paint: {
            'line-color': 'blue',
            'line-width': 6,
            'line-dasharray': [0, 4, 3]
        }
    });

     // technique based on https://jsfiddle.net/2mws8y3q/
        // an array of valid line-dasharray values, specifying the lengths of the alternating dashes and gaps that form the dash pattern
        const dashArraySequence = [
            [0, 4, 3],
            [0.5, 4, 2.5],
            [1, 4, 2],
            [1.5, 4, 1.5],
            [2, 4, 1],
            [2.5, 4, 0.5],
            [3, 4, 0],
            [0, 0.5, 3, 3.5],
            [0, 1, 3, 3],
            [0, 1.5, 3, 2.5],
            [0, 2, 3, 2],
            [0, 2.5, 3, 1.5],
            [0, 3, 3, 1],
            [0, 3.5, 3, 0.5]
        ];

        let step = 0; // setting the staring step of the animation

        function animateDashArray(timestamp) {
            // Update line-dasharray using the next value in dashArraySequence. The
            // divisor in the expression `timestamp / 50` controls the animation speed.
            const newStep = parseInt(
                (timestamp / 80) % dashArraySequence.length
            );

            if (newStep !== step) { // only update the map if the step has changed
                map.setPaintProperty(
                    'line-dashed',
                    'line-dasharray',
                    dashArraySequence[step]
                );
                step = newStep;
            }

            // Request the next frame of the animation.
            requestAnimationFrame(animateDashArray);
        }

        // start of  the animation
        animateDashArray(0);
    
        map.addLayer({ //adding later ofpoints to the map
            'id': 'building',
            'type': 'circle', // choosing circle type to repsrest the layer
            'source': 'map',
            'paint': {
                'circle-radius': 8,
                'circle-color': '#B42222'
                }
        });
});




const popup = new mapboxgl.Popup({ // Create a popup for the map
    closeButton: false,
    closeOnClick: false
});

map.on('mouseenter', 'building', (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const Place = e.features[0].properties.Place;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(Place).addTo(map);
});

map.on('mouseleave', 'building', () => { // Removes the popup when the mouse leaves the building layer
    map.getCanvas().style.cursor = '';
    popup.remove();
});


