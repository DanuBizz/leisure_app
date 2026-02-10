import { NextResponse } from "next/server";
import { reverseGeocodeLocation } from "@/lib/osm/nominatim";
import { reverseGeocodeQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = reverseGeocodeQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Anfrage", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await reverseGeocodeLocation(parsed.data.lat, parsed.data.lon);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reverse-Geocoding fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
