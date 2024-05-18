import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

export default function Index() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map>();

  useEffect(() => {
    if (map.current) return;
    invariant(mapContainer.current, "Map container not found");

    map.current = new maplibregl.Map({
      container: mapContainer.current,
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
    <>
      <h1 className="text-3xl font-bold underline">metrosux</h1>
      <div className="relative w-full h-[20rem]">
        <div ref={mapContainer} className="absolute w-full h-full" />
      </div>
    </>
  );
}
