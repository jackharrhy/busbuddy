import maplibregl, { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MaplibreMap>();

  useEffect(() => {
    if (map.current) return;
    invariant(mapContainer.current, "Map container not found");

    map.current = new maplibregl.Map({
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
  });

  return (
    <div className="top-0 left-0 -z-10 absolute w-dvw h-dvh">
      <div ref={mapContainer} className="absolute w-full h-full" />
    </div>
  );
}
