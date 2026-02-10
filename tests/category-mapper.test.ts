import test from "node:test";
import assert from "node:assert/strict";
import { mapOsmTagsToCategory } from "../lib/osm/category-mapper";

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

test("nutzt Fallback Other", () => {
  assert.equal(mapOsmTagsToCategory({ random: "value" }), "Other");
});
