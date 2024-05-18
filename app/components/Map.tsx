import maplibregl, { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import BusDetails from "./BusDetails";

export function Map({ data }: { data: any }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap>();
  const [mapReady, setMapReady] = useState(false);
  const [addedData, setAddedData] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isLeft, setIsLeft] = useState(false);

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

    fetch("../../bus-icon.png")
      .then((response) => response.blob())
      .then((blob) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = function () {
          map.addImage("bus-icon", img);

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
              "icon-size": 0.1,
            },
          });

          map.on("click", "bus", (e) => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ["bus"],
            });
            if (features.length > 0) {
              const feature = features[0];
              setSelectedBus(feature.properties);
              setCardPosition({ x: e.point.x, y: e.point.y });
              setIsLeft(e.point.x > window.innerWidth / 2);
            }
          });

          setAddedData(true);
        };
      })
      .catch((error) => console.error("Error loading image:", error));
  }, [mapReady, addedData, data]);

  return (
    <div className="top-0 left-0 -z-10 absolute w-dvw h-dvh">
      <div ref={mapContainer} className="absolute w-full h-full" />
      {selectedBus && (
        <BusDetails
          details={selectedBus}
          position={cardPosition}
          isLeft={isLeft}
          onClose={() => setSelectedBus(null)}
        />
      )}
    </div>
  );
}
