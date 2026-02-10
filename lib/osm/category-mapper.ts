import type { AppCategory } from "@/lib/types";

function pickSubcategory(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

function isLikelySportsClub(tags: Record<string, string>): boolean {
  const name = (tags.name || tags["name:de"] || "").toLowerCase();
  const operator = (tags.operator || "").toLowerCase();
  const club = (tags.club || "").toLowerCase();

  return (
    club === "sport" ||
    name.includes("verein") ||
    name.includes("sv ") ||
    name.includes("fc ") ||
    operator.includes("verein")
  );
}

export function mapOsmTagsToCategory(tags: Record<string, string> = {}): AppCategory {
  const tourism = tags.tourism;
  const leisure = tags.leisure;
  const amenity = tags.amenity;
  const sport = tags.sport;
  const route = tags.route;
  const highway = tags.highway;

  if (
    leisure === "park" ||
    leisure === "nature_reserve" ||
    tourism === "viewpoint" ||
    tourism === "attraction" ||
    route === "hiking" ||
    highway === "trailhead"
  ) {
    return "Hiking/Nature";
  }

  if (amenity === "cinema") {
    return "Cinema/Movies";
  }

  if (
    tourism === "museum" ||
    tourism === "gallery" ||
    amenity === "theatre" ||
    amenity === "arts_centre"
  ) {
    return "Culture/Museums";
  }

  if (isLikelySportsClub(tags)) {
    return "Other";
  }

  if (
    leisure === "sports_centre" ||
    leisure === "swimming_pool" ||
    leisure === "sports_hall" ||
    leisure === "fitness_centre" ||
    leisure === "bowling_alley" ||
    leisure === "skate_park" ||
    amenity === "gym" ||
    sport === "climbing" ||
    sport === "yoga" ||
    sport === "fitness" ||
    sport === "swimming"
  ) {
    return "Sports";
  }

  if (amenity === "restaurant" || amenity === "cafe" || amenity === "bar" || amenity === "pub") {
    return "Food/Drink";
  }

  if (tourism === "zoo" || leisure === "playground" || amenity === "community_centre") {
    return "Family/Kids";
  }

  return "Other";
}

export function mapOsmTagsToSubcategory(tags: Record<string, string> = {}): string | undefined {
  const amenity = tags.amenity;
  const leisure = tags.leisure;
  const tourism = tags.tourism;
  const sport = tags.sport;
  const route = tags.route;

  if (amenity === "cinema") {
    return "Kino";
  }

  if (tourism === "museum") {
    return "Museum";
  }

  if (tourism === "gallery") {
    return "Galerie";
  }

  if (amenity === "theatre") {
    return "Theater";
  }

  if (leisure === "park") {
    return "Park";
  }

  if (route === "hiking") {
    return "Wanderroute";
  }

  if (leisure === "sports_centre") {
    return "Sportzentrum";
  }

  if (leisure === "fitness_centre" || amenity === "gym") {
    return "Fitnessstudio";
  }

  if (sport === "climbing") {
    return "Klettern";
  }

  if (sport === "yoga") {
    return "Yoga";
  }

  if (sport === "swimming" || leisure === "swimming_pool") {
    return "Schwimmen";
  }

  if (amenity === "restaurant") {
    return "Restaurant";
  }

  if (amenity === "cafe") {
    return "Café";
  }

  if (amenity === "bar" || amenity === "pub") {
    return "Bar / Pub";
  }

  if (tourism === "zoo") {
    return "Zoo";
  }

  if (leisure === "playground") {
    return "Spielplatz";
  }

  return pickSubcategory(tags.shop, tags.office, tags["club"], tags.attraction);
}
