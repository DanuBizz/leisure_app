import test from "node:test";
import assert from "node:assert/strict";
import { mapOsmTagsToCategory, mapOsmTagsToSubcategory } from "../lib/osm/category-mapper";

test("ordnet Natur korrekt zu", () => {
  assert.equal(mapOsmTagsToCategory({ leisure: "park" }), "Hiking/Nature");
});

test("ordnet Kino korrekt zu", () => {
  assert.equal(mapOsmTagsToCategory({ amenity: "cinema" }), "Cinema/Movies");
});

test("ordnet Kultur korrekt zu", () => {
  assert.equal(mapOsmTagsToCategory({ tourism: "museum" }), "Culture/Museums");
});

test("ordnet Sport korrekt zu", () => {
  assert.equal(mapOsmTagsToCategory({ leisure: "sports_centre" }), "Sports");
});

test("ordnet Yoga/Fitness korrekt zu", () => {
  assert.equal(mapOsmTagsToCategory({ sport: "yoga" }), "Sports");
});

test("Sportvereine werden nicht als Sport/Fitness priorisiert", () => {
  assert.equal(mapOsmTagsToCategory({ leisure: "sports_centre", name: "FC Beispielstadt e.V." }), "Other");
});

test("nutzt Fallback Other", () => {
  assert.equal(mapOsmTagsToCategory({ random: "value" }), "Other");
});

test("ordnet Unterkategorie Restaurant korrekt zu", () => {
  assert.equal(mapOsmTagsToSubcategory({ amenity: "restaurant" }), "Restaurant");
});

test("ordnet Unterkategorie Wanderroute korrekt zu", () => {
  assert.equal(mapOsmTagsToSubcategory({ route: "hiking" }), "Wanderroute");
});
