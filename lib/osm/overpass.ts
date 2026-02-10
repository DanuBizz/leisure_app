import { mapOsmTagsToCategory, mapOsmTagsToSubcategory } from "@/lib/osm/category-mapper";
import {
  buildAddress,
  buildDescription,
  buildGoogleMapsUrl,
  buildOsmUrl,
  getElementCoordinates,
} from "@/lib/osm/helpers";
import { reverseGeocodeNearestPlace } from "@/lib/osm/nominatim";
import { haversineDistanceKm } from "@/lib/utils/distance";
import type { Activity, AppCategory, OSMElement } from "@/lib/types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

type OverpassResponse = {
  elements?: OSMElement[];
};

function normalizeLabel(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 1 ? trimmed : undefined;
}

function deriveNameFromTags(tags: Record<string, string> = {}): string | undefined {
  return (
    normalizeLabel(tags.name) ||
    normalizeLabel(tags["name:de"]) ||
    normalizeLabel(tags.brand) ||
    normalizeLabel(tags.operator) ||
    normalizeLabel(tags.attraction) ||
    normalizeLabel(tags.leisure) ||
    normalizeLabel(tags.amenity) ||
    normalizeLabel(tags.tourism) ||
    normalizeLabel(tags.shop)
  );
}

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
  node(around:${radiusMeters},${lat},${lon})[leisure=fitness_centre];
  node(around:${radiusMeters},${lat},${lon})[amenity=gym];
  node(around:${radiusMeters},${lat},${lon})[sport=yoga];
  node(around:${radiusMeters},${lat},${lon})[sport=fitness];
  node(around:${radiusMeters},${lat},${lon})[sport=climbing];
  node(around:${radiusMeters},${lat},${lon})[leisure=bowling_alley];
  node(around:${radiusMeters},${lat},${lon})[leisure=skate_park];
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

  const reverseGeocodeCache = new Map<string, string | undefined>();

  async function resolveNearestPublicPlaceName(
    latitude: number,
    longitude: number,
  ): Promise<string | undefined> {
    const key = `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

    if (reverseGeocodeCache.has(key)) {
      return reverseGeocodeCache.get(key);
    }

    try {
      const nearest = await reverseGeocodeNearestPlace(latitude, longitude);
      reverseGeocodeCache.set(key, nearest);
      return nearest;
    } catch {
      reverseGeocodeCache.set(key, undefined);
      return undefined;
    }
  }

  const activitiesPromises = elements.map(async (element): Promise<Activity | null> => {
    const coordinates = getElementCoordinates(element);
    if (!coordinates) {
      return null;
    }

    const tags = element.tags ?? {};
    const category = mapOsmTagsToCategory(tags);
    if (!selectedCategories.includes(category)) {
      return null;
    }

    const nameFromTags = deriveNameFromTags(tags);
    const reverseName = nameFromTags
      ? undefined
      : await resolveNearestPublicPlaceName(coordinates.lat, coordinates.lon);
    const name = nameFromTags ?? reverseName;

    if (!name) {
      return null;
    }

    const distanceKm = haversineDistanceKm(lat, lon, coordinates.lat, coordinates.lon);

    return {
      id: `${element.type}-${element.id}`,
      name,
      category,
      subcategory: mapOsmTagsToSubcategory(tags),
      description: buildDescription(tags),
      address: buildAddress(tags),
      distanceKm,
      openingHours: tags.opening_hours,
      lat: coordinates.lat,
      lon: coordinates.lon,
      osmUrl: buildOsmUrl(coordinates.lat, coordinates.lon),
      googleMapsUrl: buildGoogleMapsUrl(coordinates.lat, coordinates.lon),
    } satisfies Activity;
  });
  const activities = (await Promise.all(activitiesPromises)).filter(
    (activity): activity is Activity => Boolean(activity),
  );

  return activities.sort((a, b) => a.distanceKm - b.distanceKm);
}
