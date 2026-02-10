import { NextResponse } from "next/server";
import { geocodeWithNominatim } from "@/lib/osm/nominatim";
import { geocodeQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = geocodeQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Anfrage", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const results = await geocodeWithNominatim(parsed.data.q);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Geocoding fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
