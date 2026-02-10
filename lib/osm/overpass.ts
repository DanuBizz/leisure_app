import { mapOsmTagsToCategory } from "@/lib/osm/category-mapper";
import {
  buildAddress,
  buildDescription,
  buildGoogleMapsUrl,
  buildOsmUrl,
  getElementCoordinates,
} from "@/lib/osm/helpers";
import { haversineDistanceKm } from "@/lib/utils/distance";
import type { Activity, AppCategory, OSMElement } from "@/lib/types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

type OverpassResponse = {
  elements?: OSMElement[];
};

function buildOverpassQuery(lat: number, lon: number, radiusMeters: number): string {
  return `
[out:json][timeout:25];
(
  node(around:${radiusMeters},${lat},${lon})[amenity=cinema];
  node(around:${radiusMeters},${lat},${lon})[amenity=theatre];
  node(around:${radiusMeters},${lat},${lon})[tourism=museum];
  node(around:${radiusMeters},${lat},${lon})[tourism=gallery];
  node(around:${radiusMeters},${lat},${lon})[leisure=park];
  node(around:${radiusMeters},${lat},${lon})[tourism=viewpoint];
  node(around:${radiusMeters},${lat},${lon})[tourism=attraction];
  node(around:${radiusMeters},${lat},${lon})[tourism=zoo];
  node(around:${radiusMeters},${lat},${lon})[leisure=swimming_pool];
  node(around:${radiusMeters},${lat},${lon})[leisure=sports_centre];
  node(around:${radiusMeters},${lat},${lon})[sport=climbing];
  node(around:${radiusMeters},${lat},${lon})[leisure=bowling_alley];
  node(around:${radiusMeters},${lat},${lon})[leisure=skate_park];
  node(around:${radiusMeters},${lat},${lon})[route=hiking];
  way(around:${radiusMeters},${lat},${lon})[route=hiking];
  relation(around:${radiusMeters},${lat},${lon})[route=hiking];
  node(around:${radiusMeters},${lat},${lon})[amenity=restaurant];
  node(around:${radiusMeters},${lat},${lon})[amenity=cafe];
  node(around:${radiusMeters},${lat},${lon})[amenity=bar];
  node(around:${radiusMeters},${lat},${lon})[leisure=playground];
  way(around:${radiusMeters},${lat},${lon})[tourism=museum];
  way(around:${radiusMeters},${lat},${lon})[leisure=park];
  way(around:${radiusMeters},${lat},${lon})[tourism=attraction];
);
out center tags;
`;
}

export async function fetchActivitiesFromOverpass(
  lat: number,
  lon: number,
  radiusKm: number,
  selectedCategories: AppCategory[],
): Promise<Activity[]> {
  const query = buildOverpassQuery(lat, lon, radiusKm * 1000);

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Overpass Fehler: ${response.status}`);
  }

  const data = (await response.json()) as OverpassResponse;
  const elements = data.elements ?? [];

  const activities: Activity[] = [];

  for (const element of elements) {
    const coordinates = getElementCoordinates(element);
    if (!coordinates) {
      continue;
    }

    const tags = element.tags ?? {};
    const category = mapOsmTagsToCategory(tags);
    if (!selectedCategories.includes(category)) {
      continue;
    }

    const name = tags.name || tags["name:de"] || `Ort #${element.id}`;
    const distanceKm = haversineDistanceKm(lat, lon, coordinates.lat, coordinates.lon);

    activities.push({
      id: `${element.type}-${element.id}`,
      name,
      category,
      description: buildDescription(tags),
      address: buildAddress(tags),
      distanceKm,
      openingHours: tags.opening_hours,
      lat: coordinates.lat,
      lon: coordinates.lon,
      osmUrl: buildOsmUrl(coordinates.lat, coordinates.lon),
      googleMapsUrl: buildGoogleMapsUrl(coordinates.lat, coordinates.lon),
    });
  }

  return activities.sort((a, b) => a.distanceKm - b.distanceKm);
}
