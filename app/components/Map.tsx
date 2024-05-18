import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import route from "./route.json";

const { Map: MaplibreMap, Popup } = maplibregl;

export function Map({ data }: { data: any }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap>();
  const [mapReady, setMapReady] = useState(false);
  const [addedData, setAddedData] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;
    invariant(mapContainer.current, "Map container not found");

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      center: [-52.73555, 47.57331],
      zoom: 14,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19,
          },
        },
        layers: [{ id: "sat", type: "raster", source: "osm" }],
      },
    });

    mapRef.current.on("load", () => {
      setMapReady(true);
    });
  });

   useEffect(() => {
    if (!mapReady) return;
    invariant(mapRef.current, "Map not found");

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
        
          const map = mapRef.current;
          invariant(map, "Map is not defined");

           // Check accuracy and show a popup if below threshold
           const accuracyThreshold = 50; // Example threshold in meters
           if (accuracy > accuracyThreshold) {
             const popup = new Popup()
               .setLngLat(map.getCenter())
               .setHTML(`<h3>Low Accuracy</h3><p>Location accuracy is too low: ${accuracy} meters</p>`)
               .addTo(map);
             return;
           }

          // Add user location to map
          const userLocation = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            properties: {},
          };

          map.addSource("user-location", {
            type: "geojson",
            data: userLocation as any,
          });

          map.addLayer({
            id:  "user-location",
            type: "circle",
            source: "user-location",
            layout: {},
            paint: {
              "circle-color": "#00FF00",
              "circle-radius": 12,
              "circle-stroke-width": 2,
              "circle-stroke-color": "black",
            },
          });

          // Center the map to the user's location
          map.setCenter([longitude, latitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || addedData || data === undefined) return;
    invariant(mapRef.current, "Map not found");
    const map = mapRef.current;

    console.log("time to add data baybeeee", { data });

    fetch('../../bus-icon.png')
      .then(response => response.blob())
      .then(blob => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = function () {
          map.addImage('bus-icon', img);

          map.addSource("bus", {
            type: "geojson",
            data,
          });
          map.addLayer({
            id: "bus",
            type: "symbol",
            source: "bus",
            layout: {
              "icon-image": "bus-icon",
              "icon-size": 0.05, 
            },
          });

          console.log(route)
          map.addSource("routes", {
            type: "geojson",
            data: route["01-1"],
          });
          map.addLayer({
            id: "routes",
            type: "line",
            source: "routes",
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#f00',
              'line-width': 8
            }
          });
    // call to add source for the data
    // all to add layer for the visuals

    setAddedData(true);
  };
})
.catch(error => console.error('Error loading image:', error));
  }, [mapReady, addedData, data]);

  return (
    <div className="top-0 left-0 -z-10 absolute w-dvw h-dvh">
      <div ref={mapContainer} className="absolute w-full h-full" />
    </div>
  );
}
