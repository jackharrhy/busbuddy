import { useRevalidator } from "@remix-run/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import BusDetails from "./BusDetails";
import StopDetails from "./StopDetails";
import { useInterval } from "usehooks-ts";

import stops from "./stops.json";
import route from "./route.json";

export function Map({ data }: { data: any }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map>();
  const [mapReady, setMapReady] = useState(false);
  const [addedData, setAddedData] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [selectedBusStop, setSelectedBusStop] = useState<any>(null);
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isLeft, setIsLeft] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [shownRoute, setShownRoute] = useState<number | null>(null);
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
      style:
        "https://api.maptiler.com/maps/06010d97-fcda-4e83-a576-71e1f3442a40/style.json?key=ujzdFuiMnJnX2oYBAMZp",
    });

    mapRef.current.on("load", () => {
      setMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    invariant(mapRef.current, "Map not found");

    const map = mapRef.current;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const userLocation: GeoJSON.Feature<GeoJSON.Point> = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            properties: {},
          };

          if (map) {
            map.addSource("user-location", {
              type: "geojson",
              data: userLocation,
            });

            map.addLayer({
              id: "user-location",
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

            map.setCenter([longitude, latitude]);
          }
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

    const loadImage = (url: string, id: string) =>
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const img = new Image();
          img.src = URL.createObjectURL(blob);

          img.onload = () => {
            if (map) {
              map.addImage(id, img);
            }
          };
        })
        .catch((error) => console.error(`Error loading ${id} icon:`, error));

    loadImage("../../busbuddy-icon-c.png", "bus-icon");
    loadImage("../../bus-stop.png", "stop-icon");

    const addRouteLayer = () => {
      if (map) {
        map.addSource("routes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: "routes",
          type: "line",
          source: "routes",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#00f",
            "line-width": 8,
            "line-opacity": 1,
          },
        });
      }
    };

    const addStopsLayer = () => {
      if (map) {
        map.addSource("stops", {
          type: "geojson",
          data: stops as GeoJSON.FeatureCollection<GeoJSON.Point>,
        });

        map.addLayer({
          id: "stops",
          type: "symbol",
          source: "stops",
          layout: {
            "icon-image": "stop-icon",
            "icon-size": 0.2,
          },
        });
      }
    };

    const addBusLayer = () => {
      if (map) {
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
            "icon-size": 0.2,
          },
        });

        map.on("mouseenter", "bus", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "bus", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", "bus", (e: maplibregl.MapMouseEvent) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["bus"],
          });

          if (features.length > 0) {
            const feature = features[0];
            setSelectedBus(feature.properties);
            setCardPosition({ x: e.point.x, y: e.point.y });
            setIsLeft(e.point.x > window.innerWidth / 2);
            setIsUp(e.point.y > window.innerHeight / 2);

            const routeParts = feature.properties.current_route.split("-");
            const routeNumber = routeParts.length > 1 ? routeParts[0] : null;
            const filteredRoute = parseInt(routeNumber);

            setShownRoute(filteredRoute);

            if (filteredRoute) {
              const filteredRouteFeature = route.features.find(
                (feature) => feature.properties.routeNumber === filteredRoute
              );

              if (filteredRouteFeature) {
                const routesSource = map.getSource(
                  "routes"
                ) as maplibregl.GeoJSONSource;

                const geojsonFeature: GeoJSON.Feature<GeoJSON.LineString> = {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: filteredRouteFeature.geometry.coordinates,
                  },
                  properties: filteredRouteFeature.properties,
                };

                routesSource.setData({
                  type: "FeatureCollection",
                  features: [geojsonFeature],
                });
              } else {
                console.error("Route not found for route number:", routeNumber);
              }
            } else {
              console.error("Invalid route number:", routeNumber);
            }
          }
        });

        map.on("mouseenter", "stops", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "stops", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", "stops", (e: maplibregl.MapMouseEvent) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["stops"],
          });

          if (features.length > 0) {
            const feature = features[0];
            setSelectedBusStop(feature.properties);
            setCardPosition({ x: e.point.x, y: e.point.y });
            setIsLeft(e.point.x > window.innerWidth / 2);
            setIsUp(e.point.y > window.innerHeight / 2);
          }
        });
      }
    };

    addRouteLayer();
    addStopsLayer();
    addBusLayer();

    setAddedData(true);
  }, [mapReady, addedData, data]);

  useEffect(() => {
    if (!mapReady || !addedData || data === undefined) return;
    invariant(mapRef.current, "Map not found");
    const map = mapRef.current;

    if (map) {
      const busSource = map.getSource("bus") as maplibregl.GeoJSONSource;
      invariant(busSource, "Bus source not found");
      busSource.setData(data);
    }
  }, [mapReady, addedData, data]);

  return (
    <div className="top-0 left-0 -z-10 absolute w-dvw h-dvh">
      <div ref={mapContainer} className="absolute w-full h-full" />
      {selectedBus && (
        <BusDetails
          details={selectedBus}
          position={cardPosition}
          isLeft={isLeft}
          isUp={isUp}
          onClose={() => setSelectedBus(null)}
        />
      )}
      {selectedBusStop && (
        <StopDetails
          details={selectedBusStop}
          position={cardPosition}
          isLeft={isLeft}
          isUp={isUp}
          onClose={() => setSelectedBusStop(null)}
        />
      )}
    </div>
  );
}
