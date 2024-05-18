import fs from "fs/promises";

async function getRoute(num) {
  num = num.toString();
  if (num.length === 1) {
    num = "0" + num;
  }
  //console.log(num);
  let METROBUS_BUS_LOCATE_HTML =
    "https://metrobusmobile.com/bus_locate.asp?route=" + num + "-1";

  let muck = await fetch(METROBUS_BUS_LOCATE_HTML);
  muck = await muck.text();

  let what = muck.split("var latlngs = [");
  what = what[1];
  what = what.split("];");
  what = what[0].trim();

  let array = what.split(",\r\n");
  const realArray = array.map((item) => JSON.parse(item));

  for (let i = 0; i < realArray.length; i++) {
    let temp = realArray[i][0];
    realArray[i][0] = realArray[i][1];
    realArray[i][1] = temp;
  }

  return realArray;
}

const allRoutesAsFeatures = [];
const routeNumbers = [
  1, 2, 3, 6, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 26, 30,
];
for (let number of routeNumbers) {
  try {
    let route = await getRoute(number);
    let feature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: route,
      },
      properties: {
        name: "Route " + number,
        routeNumber: number,
      },
    };
    allRoutesAsFeatures.push(feature);
  } catch (err) {
    console.log(number, err);
  }
}

const geoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: allRoutesAsFeatures,
};

fs.writeFile("Jason/route.json", JSON.stringify(geoJsonFeatureCollection));
