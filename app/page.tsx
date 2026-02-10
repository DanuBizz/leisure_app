"use client";

import { useEffect, useMemo, useState } from "react";
import { APP_CATEGORIES, type Activity, type AppCategory, type GeocodeResult } from "@/lib/types";

const RADIUS_OPTIONS = [1, 3, 5, 10] as const;

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodeResult | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState<number>(5);
  const [categories, setCategories] = useState<AppCategory[]>([...APP_CATEGORIES]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 450);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function runGeocodeSearch() {
      if (debouncedQuery.length < 2) {
        setGeocodeResults([]);
        return;
      }

      setLoadingGeocode(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`);
        const data = (await response.json()) as { results?: GeocodeResult[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Geocoding fehlgeschlagen");
        }

        setGeocodeResults(data.results ?? []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Geocoding fehlgeschlagen";
        setErrorMessage(message);
      } finally {
        setLoadingGeocode(false);
      }
    }

    void runGeocodeSearch();
  }, [debouncedQuery]);

  async function findActivities(target: { lat: number; lon: number }) {
    setLoadingActivities(true);
    setErrorMessage(null);

    try {
      const categoryParam = categories.length === APP_CATEGORIES.length ? "all" : categories.join(",");
      const url = `/api/activities?lat=${target.lat}&lon=${target.lon}&radius=${radius}&categories=${encodeURIComponent(categoryParam)}`;
      const response = await fetch(url);
      const data = (await response.json()) as { results?: Activity[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Aktivitäten konnten nicht geladen werden");
      }

      setActivities(data.results ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Aktivitäten konnten nicht geladen werden";
      setErrorMessage(message);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }

  const grouped = useMemo(() => {
    const initial = new Map<AppCategory, Activity[]>();
    APP_CATEGORIES.forEach((category) => initial.set(category, []));

    for (const activity of activities) {
      initial.get(activity.category)?.push(activity);
    }

    return initial;
  }, [activities]);

  function toggleCategory(category: AppCategory) {
    setCategories((current) => {
      if (current.includes(category)) {
        const next = current.filter((item) => item !== category);
        return next.length > 0 ? next : [category];
      }
      return [...current, category];
    });
  }

  function useBrowserLocation() {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation wird in diesem Browser nicht unterstützt.");
      return;
    }

    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoords(nextCoords);
        setSelectedLocation({
          displayName: "Aktueller Standort",
          lat: nextCoords.lat,
          lon: nextCoords.lon,
        });
      },
      () => {
        setErrorMessage("Standort konnte nicht ermittelt werden.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
        <header className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">Freizeitfinder</h1>
          <p className="mt-2 text-slate-600">Finde coole Freizeitaktivitäten in deiner Nähe.</p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Suche</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={useBrowserLocation}
              className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
              type="button"
            >
              Meinen Standort verwenden
            </button>

            <div className="flex gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Adresse oder Stadt eingeben"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                type="button"
                onClick={() => {
                  const first = geocodeResults[0];
                  if (!first) {
                    return;
                  }
                  setSelectedLocation(first);
                  setCoords({ lat: first.lat, lon: first.lon });
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium"
              >
                Suchen
              </button>
            </div>
          </div>

          {(loadingGeocode || geocodeResults.length > 0) && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {loadingGeocode ? (
                <p className="text-sm text-slate-600">Suche Orte ...</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {geocodeResults.slice(0, 5).map((result) => (
                    <li key={`${result.lat}-${result.lon}`}>
                      <button
                        type="button"
                        className="w-full rounded-md bg-white px-3 py-2 text-left hover:bg-slate-100"
                        onClick={() => {
                          setSelectedLocation(result);
                          setCoords({ lat: result.lat, lon: result.lon });
                        }}
                      >
                        {result.displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Radius
              <select
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                {RADIUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value} km
                  </option>
                ))}
              </select>
            </label>

            <div className="text-sm font-medium">
              Kategorien
              <div className="mt-2 flex flex-wrap gap-2">
                {APP_CATEGORIES.map((category) => {
                  const selected = categories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`rounded-full border px-3 py-1 text-xs ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {selectedLocation
                ? `Ausgewählter Ort: ${selectedLocation.displayName}`
                : "Noch kein Ort ausgewählt"}
            </p>
            <button
              type="button"
              disabled={!coords || loadingActivities}
              onClick={() => coords && findActivities(coords)}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Aktivitäten suchen
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Ergebnisse</h2>

          {errorMessage && <p className="mb-3 rounded-lg bg-red-100 p-3 text-red-800">{errorMessage}</p>}

          {loadingActivities ? (
            <p className="text-slate-600">Aktivitäten werden geladen ...</p>
          ) : activities.length === 0 ? (
            <p className="text-slate-600">Keine Ergebnisse. Bitte Ort und Filter prüfen.</p>
          ) : (
            <div className="space-y-3">
              {APP_CATEGORIES.map((category) => {
                const entries = grouped.get(category) ?? [];
                if (entries.length === 0) {
                  return null;
                }

                return (
                  <details key={category} className="rounded-lg border border-slate-200 p-3" open>
                    <summary className="cursor-pointer font-semibold">
                      {category} ({entries.length})
                    </summary>
                    <div className="mt-3 grid gap-3">
                      {entries.map((entry) => (
                        <article key={entry.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-lg font-semibold">{entry.name}</h3>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">{entry.category}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700">
                            Distanz: {entry.distanceKm.toFixed(2)} km
                            {entry.address ? ` · ${entry.address}` : ""}
                          </p>
                          {entry.description && <p className="mt-1 text-sm text-slate-600">{entry.description}</p>}
                          {entry.openingHours && (
                            <p className="mt-1 text-sm text-slate-600">Öffnungszeiten: {entry.openingHours}</p>
                          )}
                          <div className="mt-2 flex gap-3 text-sm">
                            <a className="text-blue-700 underline" href={entry.osmUrl} target="_blank" rel="noreferrer">
                              OpenStreetMap
                            </a>
                            <a
                              className="text-blue-700 underline"
                              href={entry.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Google Maps
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
