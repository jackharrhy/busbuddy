import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Map } from "~/components/Map";

const METROBUS_API_URL = "https://www.metrobus.co.ca/api";
const METROBUS_TIMETRACK_JSON = `${METROBUS_API_URL}/timetrack/json/`;

const METROBUS_MOBILE_URL = "https://metrobusmobile.com";
const METROBUS_BUS_LOCATE_HTML = `${METROBUS_MOBILE_URL}/bus_locate.asp?route=01-1`;

/*
the response looks like this, an array of:
bulletin: "None"
bus_lat: "47.59205"
bus_lon: "-52.70968"
colour: "#99FFCC"
current_location: "Torbay Rd opp Torbay Rd Mall"
current_route: "02-1"
departure_time_at_closest_stop: "85800"
deviation: "ON TIME"
exception: "N"
geo_coded_location: "NOT QUERIED"
gtfs_service_id: "1"
gtfs_stop_last_known_status: "02-1 last status ON TIME @ 11:30 PM"
gtfs_stop_sequence_actual: 22
gtfs_stop_sequence_actual_history: 22
gtfs_stop_sequence_closest_stop: "Torbay Rd opp Torbay Rd Mall"
gtfs_stop_sequence_colour: "#99FFCC"
gtfs_stop_sequence_deviation: "ON TIME"
gtfs_stop_sequence_max_trip: 22
gtfs_stop_sequence_mins_from_stop: 0
gtfs_stop_sequence_sched_difference_mins: 0
gtfs_stop_sequence_status: "NO DATA"
gtfs_stop_sequence_trip_id: "226368"
gtfs_trip_headsign: "To Village"
gtfs_trip_id: "226368"
gtfs_trip_id_history: "226368"
heading: "S"
icon: "busiconS.png"
position_time: "12:05 AM"
position_time_seconds: 86749
requestip: "127.0.0.1      "
routenumber: 2
routerun: "Rt 2-1"
routerunshort: "2-1"
service: "1"
shortstatus: "OT"
speed: 0
time_stamp: "12:05 AM"
vehicle: "1523"
wifi: "Y"
*/

export const loader = async () => {
  const response = await fetch(METROBUS_TIMETRACK_JSON);

  let data = await response.json();

  if (!Array.isArray(data)) {
    data = [];
  }

  const featureCollection = {
    type: "FeatureCollection",
    features: data.map((bus: any) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(bus.bus_lon), parseFloat(bus.bus_lat)],
        },
        properties: bus,
      };
    }),
  };

  return json(featureCollection);
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-center items-center w-full h-40 bg-gray-700 bg-opacity-50 backdrop-blur">
        <div className="bg-white shadow-xl rounded-lg">
          <img className="h-32" src="/Bus_Buddy_Logo.webp"/>
        </div>
      </div>
      <Map data={data} />
    </>
  );
}
