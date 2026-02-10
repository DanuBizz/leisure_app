import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache";
import { fetchActivitiesFromOverpass } from "@/lib/osm/overpass";
import { activitiesQuerySchema, parseCategories } from "@/lib/validation";
import type { Activity } from "@/lib/types";

const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = activitiesQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
    radius: searchParams.get("radius") ?? "5",
    categories: searchParams.get("categories") ?? "all",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Anfrage", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const categories = parseCategories(parsed.data.categories);
  const sortedCategories = [...categories].sort();

  const cacheKey = [
    parsed.data.lat.toFixed(5),
    parsed.data.lon.toFixed(5),
    parsed.data.radius,
    sortedCategories.join("|"),
  ].join(":");

  const cached = getCached<Activity[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached, cached: true });
  }

  try {
    const results = await fetchActivitiesFromOverpass(
      parsed.data.lat,
      parsed.data.lon,
      parsed.data.radius,
      categories,
    );

    setCached(cacheKey, results, CACHE_TTL_MS);

    return NextResponse.json({ results, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Aktivitäten konnten nicht geladen werden";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
