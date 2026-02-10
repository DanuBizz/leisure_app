import test from "node:test";
import assert from "node:assert/strict";
import { haversineDistanceKm } from "../lib/utils/distance";

test("liefert 0 für identische Koordinaten", () => {
  const d = haversineDistanceKm(52.52, 13.405, 52.52, 13.405);
  assert.ok(Math.abs(d) < 0.000001);
});

test("berechnet die Distanz zwischen Berlin und München ungefähr korrekt", () => {
  const distance = haversineDistanceKm(52.52, 13.405, 48.1372, 11.5756);
  assert.ok(distance > 490);
  assert.ok(distance < 530);
});
