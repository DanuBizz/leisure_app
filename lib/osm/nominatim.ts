import type { GeocodeResult, ReverseGeocodeResult } from "@/lib/types";

type NominatimSearchItem = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string | undefined>;
};

type NominatimReverseItem = {
  name?: string;
  display_name?: string;
  address?: Record<string, string | undefined>;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const DEFAULT_USER_AGENT =
  "VibeRadar/1.0 (Next.js Demo App; OSM Nominatim Usage Policy respektiert)";

function toShortLabel(address?: Record<string, string | undefined>): string | undefined {
  if (!address) {
    return undefined;
  }

  const street = [address.road, address.house_number].filter(Boolean).join(" ").trim();
  const locality =
    address.city || address.town || address.village || address.hamlet || address.municipality;

  if (street && locality) {
    return `${street}, ${locality}`;
  }

  return street || locality || undefined;
}

export async function geocodeWithNominatim(query: string): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      "Accept-Language": "de",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Nominatim Fehler: ${response.status}`);
  }

  const payload = (await response.json()) as NominatimSearchItem[];

  return payload
    .filter((item): item is NominatimSearchItem & { display_name: string; lat: string; lon: string } => {
      const lat = Number(item.lat);
      const lon = Number(item.lon);
      return !!(item.display_name && !Number.isNaN(lat) && !Number.isNaN(lon));
    })
    .map((item) => {
      const lat = Number(item.lat);
      const lon = Number(item.lon);

      return {
        displayName: item.display_name,
        shortLabel: toShortLabel(item.address),
        lat,
        lon,
      } satisfies GeocodeResult;
    });
}

export async function reverseGeocodeNearestPlace(
  lat: number,
  lon: number,
): Promise<string | undefined> {
  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "16");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      "Accept-Language": "de",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return undefined;
  }

  const payload = (await response.json()) as NominatimReverseItem;
  const address = payload.address ?? {};

  const bestMatch =
    payload.name ||
    address.attraction ||
    address.leisure ||
    address.road ||
    address.neighbourhood ||
    address.suburb ||
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.municipality ||
    payload.display_name?.split(",")[0];

  return bestMatch?.trim() || undefined;
}

export async function reverseGeocodeLocation(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult | undefined> {
  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      "Accept-Language": "de",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return undefined;
  }

  const payload = (await response.json()) as NominatimReverseItem & { lat?: string; lon?: string };

  const parsedLat = Number(payload.lat);
  const parsedLon = Number(payload.lon);
  const resolvedLat = Number.isFinite(parsedLat) ? parsedLat : lat;
  const resolvedLon = Number.isFinite(parsedLon) ? parsedLon : lon;

  const displayName = payload.display_name?.trim();
  if (!displayName) {
    return undefined;
  }

  return {
    displayName,
    shortLabel: toShortLabel(payload.address),
    lat: resolvedLat,
    lon: resolvedLon,
  };
}
