import type { AppCategory } from "@/lib/types";

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

  if (
    leisure === "sports_centre" ||
    leisure === "swimming_pool" ||
    leisure === "pitch" ||
    leisure === "fitness_centre" ||
    leisure === "bowling_alley" ||
    leisure === "skate_park" ||
    sport === "climbing"
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
