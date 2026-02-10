import type { GeocodeResult } from "@/lib/types";

type NominatimSearchItem = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_USER_AGENT =
  "Freizeitfinder/1.0 (Next.js Demo App; OSM Nominatim Usage Policy respektiert)";

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
    .map((item) => {
      const lat = Number(item.lat);
      const lon = Number(item.lon);
      if (!item.display_name || Number.isNaN(lat) || Number.isNaN(lon)) {
        return null;
      }

      return {
        displayName: item.display_name,
        lat,
        lon,
      } satisfies GeocodeResult;
    })
    .filter((item): item is GeocodeResult => Boolean(item));
}
