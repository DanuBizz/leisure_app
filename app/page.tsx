"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APP_CATEGORIES,
  CATEGORY_META,
  type Activity,
  type AppCategory,
  type GeocodeResult,
} from "@/lib/types";

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
  const [loadingCurrentLocationLabel, setLoadingCurrentLocationLabel] = useState(false);
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
    setLoadingCurrentLocationLabel(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoords(nextCoords);

        setSelectedLocation({
          displayName: "Aktueller Standort wird ermittelt ...",
          shortLabel: "Suche Straße/Ort ...",
          lat: nextCoords.lat,
          lon: nextCoords.lon,
        });

        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${encodeURIComponent(String(nextCoords.lat))}&lon=${encodeURIComponent(String(nextCoords.lon))}`,
          );
          const data = (await response.json()) as {
            result?: GeocodeResult;
            error?: string;
          };

          if (!response.ok) {
            throw new Error(data.error || "Standortname konnte nicht ermittelt werden");
          }

          if (data.result) {
            setSelectedLocation(data.result);
            return;
          }

          setSelectedLocation({
            displayName: `Aktueller Standort (${nextCoords.lat.toFixed(5)}, ${nextCoords.lon.toFixed(5)})`,
            lat: nextCoords.lat,
            lon: nextCoords.lon,
          });
        } catch {
          setSelectedLocation({
            displayName: `Aktueller Standort (${nextCoords.lat.toFixed(5)}, ${nextCoords.lon.toFixed(5)})`,
            lat: nextCoords.lat,
            lon: nextCoords.lon,
          });
        } finally {
          setLoadingCurrentLocationLabel(false);
        }
      },
      () => {
        setErrorMessage("Standort konnte nicht ermittelt werden.");
        setLoadingCurrentLocationLabel(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-8 text-slate-100">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-16 right-6 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4">
        <header className="rounded-3xl border border-white/15 bg-slate-900/55 p-6 shadow-[0_20px_70px_rgba(8,47,73,0.45)] backdrop-blur-2xl md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl">🚀</span>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">VibeRadar</h1>
            <span className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
              Live • Freizeit in deiner Nähe
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200 md:text-base">
            Entdecke die besten Spots rund um dich – mit smarten Kategorien, modernem Look und schnellen Kartenlinks.
          </p>
        </header>

        <section className="rounded-3xl border border-white/15 bg-slate-900/55 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.5)] backdrop-blur-2xl md:p-8">
          <h2 className="mb-5 text-xl font-semibold text-white md:text-2xl">Suche</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={useBrowserLocation}
              className="group rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                📍 Meinen Standort verwenden
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </button>

            <div className="flex gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Adresse oder Stadt eingeben"
                className="w-full rounded-xl border border-white/20 bg-slate-950/70 px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/40"
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
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Suchen
              </button>
            </div>
          </div>

          {(loadingGeocode || geocodeResults.length > 0) && (
            <div className="mt-3 rounded-xl border border-white/15 bg-slate-950/70 p-3">
              {loadingGeocode ? (
                <p className="text-sm text-slate-300">Suche Orte ...</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {geocodeResults.slice(0, 5).map((result) => (
                    <li key={`${result.lat}-${result.lon}`}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
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
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
              Radius
              <select
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-slate-100"
              >
                {RADIUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value} km
                  </option>
                ))}
              </select>
            </label>

            <div className="text-sm font-medium text-slate-100">
              Kategorien
              <div className="mt-2 flex flex-wrap gap-2">
                {APP_CATEGORIES.map((category) => {
                  const selected = categories.includes(category);
                  const meta = CATEGORY_META[category];
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`rounded-full border px-3 py-1 text-xs transition duration-150 ${selected ? "border-indigo-300/80 bg-indigo-500/70 text-white shadow-lg shadow-indigo-500/30" : "border-white/20 bg-white/10 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/10"}`}
                    >
                      {meta.icon} {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">
                {selectedLocation
                  ? `Ausgewählter Ort: ${selectedLocation.shortLabel || selectedLocation.displayName}`
                  : "Noch kein Ort ausgewählt"}
              </p>
              {loadingCurrentLocationLabel && (
                <p className="mt-1 text-xs text-cyan-200">Genaue Straße/Ort wird ermittelt ...</p>
              )}
            </div>
            <button
              type="button"
              disabled={!coords || loadingActivities}
              onClick={() => coords && findActivities(coords)}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:from-slate-500 disabled:to-slate-500"
            >
              Aktivitäten suchen
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-white/15 bg-slate-900/55 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.5)] backdrop-blur-2xl md:p-8">
          <h2 className="mb-4 text-xl font-semibold text-white md:text-2xl">Ergebnisse</h2>

          {errorMessage && <p className="mb-3 rounded-lg border border-red-300/30 bg-red-500/20 p-3 text-red-100">{errorMessage}</p>}

          {loadingActivities ? (
            <p className="text-slate-300">Aktivitäten werden geladen ...</p>
          ) : activities.length === 0 ? (
            <p className="text-slate-300">Keine Ergebnisse. Bitte Ort und Filter prüfen.</p>
          ) : (
            <div className="space-y-3">
              {APP_CATEGORIES.map((category) => {
                const entries = grouped.get(category) ?? [];
                if (entries.length === 0) {
                  return null;
                }

                const meta = CATEGORY_META[category];

                return (
                  <details key={category} className="rounded-xl border border-white/15 bg-slate-900/65 p-3 transition hover:border-cyan-300/30">
                    <summary className="cursor-pointer list-none font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-slate-200">{entries.length}</span>
                      </span>
                    </summary>
                    <div className="mt-3 grid gap-3">
                      {entries.map((entry) => (
                        <article className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-800/60 to-slate-900/70 p-4 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:shadow-cyan-500/20" key={entry.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-lg font-semibold">{entry.name}</h3>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${CATEGORY_META[entry.category].badgeClass}`}
                            >
                              {CATEGORY_META[entry.category].icon} {CATEGORY_META[entry.category].label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-200">
                            Distanz: {entry.distanceKm.toFixed(2)} km
                            {entry.address ? ` · ${entry.address}` : " · Adresse nicht verfügbar"}
                          </p>
                          {entry.subcategory && (
                            <p className="mt-1 text-sm text-slate-300">Unterkategorie: {entry.subcategory}</p>
                          )}
                          {entry.description && <p className="mt-1 text-sm text-slate-300">{entry.description}</p>}
                          {entry.openingHours && (
                            <p className="mt-1 text-sm text-slate-300">Öffnungszeiten: {entry.openingHours}</p>
                          )}
                          <div className="mt-2 flex gap-3 text-sm">
                            <a
                              className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-cyan-200 no-underline transition hover:bg-cyan-300/20"
                              href={entry.osmUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              OpenStreetMap
                            </a>
                            <a
                              className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-cyan-200 no-underline transition hover:bg-cyan-300/20"
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
