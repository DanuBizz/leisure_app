export const SOURCE_EXAMPLES = {
  internalApi: [
    "/api/geocode?q=Berlin",
    "/api/geocode?q=M%C3%BCnchen%20Hauptbahnhof",
    "/api/activities?lat=52.52&lon=13.405&radius=5&categories=all",
    "/api/activities?lat=48.1372&lon=11.5756&radius=10&categories=Culture%2FMuseums,Food%2FDrink",
  ],
  nominatimDirect: [
    "https://nominatim.openstreetmap.org/search?q=Berlin&format=json&limit=5",
    "https://nominatim.openstreetmap.org/search?q=Hamburg+Altona&format=json&addressdetails=1&limit=5",
  ],
  overpassDirect: [
    "https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node(around:5000,52.52,13.405)[amenity=cinema];way(around:5000,52.52,13.405)[tourism=museum];node(around:5000,52.52,13.405)[leisure=park];);out%20center%20tags;",
    "https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node(around:3000,48.1372,11.5756)[leisure=sports_centre];node(around:3000,48.1372,11.5756)[tourism=zoo];relation(around:3000,48.1372,11.5756)[route=hiking];);out%20center%20tags;",
  ],
  mapLinks: [
    "https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=16/{lat}/{lon}",
    "https://www.google.com/maps/search/?api=1&query={lat},{lon}",
  ],
} as const;
