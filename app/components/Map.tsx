import { useRevalidator } from "@remix-run/react";
import maplibregl, { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { useInterval } from "usehooks-ts";

export function Map({ data }: { data: any }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap>();
  const [mapReady, setMapReady] = useState(false);
  const [addedData, setAddedData] = useState(false);
  const revalidator = useRevalidator();

  useInterval(() => {
    console.log("revalidating");
    revalidator.revalidate();
  }, 5000);

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
    if (!mapReady || addedData || data === undefined) return;
    invariant(mapRef.current, "Map not found");
    const map = mapRef.current;

    console.log("time to add data baybeeee", { data });

    map.addSource("bus", {
      type: "geojson",
      data,
    });
    map.addLayer({
      id: "bus",
      type: "circle",
      source: "bus",
      layout: {},
      paint: {
        "circle-color": "#f00",
        "circle-radius": 12,
        "circle-stroke-width": 2,
        "circle-stroke-color": "black",
      },
    });

    console.log("added data", { data, featureLength: data.features.length });

    setAddedData(true);
  }, [mapReady, addedData, data]);

  useEffect(() => {
    if (!mapReady || !addedData || data === undefined) return;
    invariant(mapRef.current, "Map not found");
    const map = mapRef.current;

    const busSource = map.getSource("bus");
    invariant(busSource, "Bus source not found");
    busSource.setData(data);

    console.log("updating data", { data, featureLength: data.features.length });
  }, [mapReady, addedData, data]);

  return (
    <div className="top-0 left-0 -z-10 absolute w-dvw h-dvh">
      <div ref={mapContainer} className="absolute w-full h-full" />
    </div>
  );
}
