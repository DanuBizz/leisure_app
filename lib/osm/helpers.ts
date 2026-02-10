import type { OSMElement } from "@/lib/types";

export function getElementCoordinates(element: OSMElement): { lat: number; lon: number } | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lon: element.lon };
  }

  if (typeof element.center?.lat === "number" && typeof element.center?.lon === "number") {
    return { lat: element.center.lat, lon: element.center.lon };
  }

  return null;
}

export function buildAddress(tags: Record<string, string> = {}): string | undefined {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const city = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");

  const full = [street, city].filter(Boolean).join(", ");
  if (full) {
    return full;
  }

  return tags.address || tags["addr:full"] || undefined;
}

export function buildDescription(tags: Record<string, string> = {}): string | undefined {
  return (
    tags.description ||
    tags["short_description"] ||
    tags["name:de"] ||
    tags.operator ||
    undefined
  );
}

export function buildOsmUrl(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}

export function buildGoogleMapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}
