import requests
import json
from geojson import Point, Feature, FeatureCollection

url = "https://www.mbusnews.info/api/requests/json/closest/?lat=47.57255&lon=-52.736"
response = requests.get(url)
print(response.text)

html = response.text

x = html.split("stop_lat")
print()


print(response.json()[0])


json_file = json.dumps(response.json(), indent=4)

with open("stops.json", "w") as file:
    file.write(json_file)


features = []

with open("stops.json", "r") as file:
    stops = json.loads(file.read())
    names = [stop['stop_name'] for stop in stops]
    #distances = [stop['distance'] for stop in stops]
    latitudes = [stop['stop_lat'] for stop in stops]
    lontitudes = [stop['stop_lon'] for stop in stops]
    IDs = [stop['stop_id'] for stop in stops]

for i in range(len(stops)):
    f = Feature(geometry=Point((lontitudes[i], latitudes[i])), properties={"stop_name": names[i], "stop_id": IDs[i]})
    features.append(f)


with open("stops_collection.json", "w") as file:
    file.write(json.dumps(features, indent=4))



#print("features", features)


