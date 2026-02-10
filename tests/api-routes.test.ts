import test from "node:test";
import assert from "node:assert/strict";
import { GET as geocodeGet } from "../app/api/geocode/route";
import { GET as activitiesGet } from "../app/api/activities/route";
import { clearCache } from "../lib/cache";

const originalFetch = globalThis.fetch;

test("/api/geocode validiert q", async () => {
  const request = new Request("http://localhost:3000/api/geocode?q=a");
  const response = await geocodeGet(request);

  assert.equal(response.status, 400);
});

test("/api/geocode gibt Ergebnisse zurück (mock fetch)", async (t) => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify([{ display_name: "Berlin, Deutschland", lat: "52.52", lon: "13.405" }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const request = new Request("http://localhost:3000/api/geocode?q=Berlin");
  const response = await geocodeGet(request);
  const body = (await response.json()) as { results: Array<{ displayName: string }> };

  assert.equal(response.status, 200);
  assert.ok(body.results[0]?.displayName.includes("Berlin"));
});

test("/api/activities validiert radius", async () => {
  const request = new Request(
    "http://localhost:3000/api/activities?lat=52.52&lon=13.405&radius=2&categories=all",
  );
  const response = await activitiesGet(request);

  assert.equal(response.status, 400);
});

test("/api/activities ruft Overpass via fetch auf (mock fetch)", async (t) => {
  clearCache();

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        elements: [
          {
            id: 1,
            type: "node",
            lat: 52.521,
            lon: 13.406,
            tags: {
              name: "Beispielpark",
              leisure: "park",
            },
          },
        ],
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    )) as typeof fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
    clearCache();
  });

  const request = new Request(
    "http://localhost:3000/api/activities?lat=52.52&lon=13.405&radius=5&categories=Hiking%2FNature",
  );
  const response = await activitiesGet(request);
  const body = (await response.json()) as { results: Array<{ name: string }> };

  assert.equal(response.status, 200);
  assert.equal(body.results[0]?.name, "Beispielpark");
});
