# VibeRadar (v1)

Eine einfache Next.js-Web-App, die **coole Freizeitaktivitäten in deiner Nähe** findet.

> Dieses Projekt wurde mit **Cline** und einem **OpenAI-Modell (Codex)** erstellt.

Du kannst entweder:
- deinen aktuellen Standort verwenden (Browser-Geolocation), oder
- eine Adresse/Stadt eingeben.

Danach lädt die App passende Orte aus OpenStreetMap/Overpass, gruppiert sie in Kategorien und zeigt sie als saubere, einklappbare Liste an.

## Features

- Standort per Geolocation oder Adresssuche
- Radius-Filter: 1 km, 3 km, 5 km, 10 km
- Multi-Select für Kategorien
- Ergebnisse gruppiert nach Kategorie mit einklappbaren Bereichen
- Ergebnis-Karten mit Name, Kategorie, Distanz, Adresse, Öffnungszeiten und Kartenlinks
- Loading-, Empty- und Error-States
- Zod-Validierung der API-Requests
- In-Memory-Cache für Aktivitäten (5 Minuten)

## Kategorien (v1, deutsch in der UI)

- 🥾 Wandern & Natur
- 🎬 Kino & Filme
- 💪 Sport & Fitness
- 🏛️ Kultur & Museen
- 🍽️ Essen & Trinken
- 🧸 Familie & Kinder
- 📍 Sonstiges

Hinweis: Bei **Sport** wird in v1 stärker auf Sport-/Fitnessmöglichkeiten (z. B. Gym, Fitness, Yoga) gefiltert; klassische Vereins-/Club-Einträge werden weniger priorisiert.

## Projekt starten

```bash
npm install
npm run dev
```

App öffnen unter: [http://localhost:3000](http://localhost:3000)

## Tests

```bash
npm test
```

## Datenquellen

### 1) Nominatim (Geocoding)
- Für die Umwandlung von Adresse/Stadt in Koordinaten.
- Wird **serverseitig** über `/api/geocode` aufgerufen.
- Mit `User-Agent` Header und clientseitigem Debounce (rate-limit-freundlich).

### 2) Overpass API (POI-Suche)
- Für Freizeit-Orte in einem Radius um lat/lon.
- Wird über `/api/activities` aufgerufen.

### 3) Kartenlinks
- OpenStreetMap-Link und Google-Maps-Link pro Ergebnis.

## Sample-URLs (erweiterbar)

Zusätzlich gibt es zentrale Beispiele in:

`lib/osm/source-examples.ts`

Dort kannst du jederzeit weitere URL-/Query-Templates ergänzen.

### Interne API
- `/api/geocode?q=Berlin`
- `/api/geocode?q=M%C3%BCnchen%20Hauptbahnhof`
- `/api/activities?lat=52.52&lon=13.405&radius=5&categories=all`
- `/api/activities?lat=48.1372&lon=11.5756&radius=10&categories=Culture%2FMuseums,Food%2FDrink`

### Nominatim direkt (nur Referenz)
- `https://nominatim.openstreetmap.org/search?q=Berlin&format=json&limit=5`
- `https://nominatim.openstreetmap.org/search?q=Hamburg+Altona&format=json&addressdetails=1&limit=5`

### Overpass direkt (nur Referenz)
- `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node(around:5000,52.52,13.405)[amenity=cinema];way(around:5000,52.52,13.405)[tourism=museum];node(around:5000,52.52,13.405)[leisure=park];);out%20center%20tags;`
- `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node(around:3000,48.1372,11.5756)[leisure=sports_centre];node(around:3000,48.1372,11.5756)[tourism=zoo];relation(around:3000,48.1372,11.5756)[route=hiking];);out%20center%20tags;`

### Kartenlinks
- `https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=16/{lat}/{lon}`
- `https://www.google.com/maps/search/?api=1&query={lat},{lon}`

## Struktur (wichtigste Ordner)

- `app/` – UI + Route Handler
- `app/api/geocode/route.ts` – Geocoding Endpoint
- `app/api/activities/route.ts` – Aktivitäten Endpoint
- `lib/osm/` – OSM-spezifische Clients/Mapping/Helper
- `lib/utils/` – Utilities (z. B. Distanz)
- `tests/` – Unit-Tests

## Limitierungen in v1

- Keine Nutzerkonten/Login
- Keine Personalisierung
- Keine Favoriten/Freundeslisten
- Qualität/Verfügbarkeit hängt von OSM-Daten in der Region ab
- Kein Karten-Frontend (nur Liste priorisiert)

## Nächste Schritte

- Personalisierung (Interessen, priorisierte Kategorien)
- Favoriten speichern
- Erweiterte Filter (z. B. nur „jetzt geöffnet“)
- optionale Kartenansicht (Leaflet)

## Lizenz

Dieses Projekt steht unter der **MIT-Lizenz**. Details siehe [LICENSE](./LICENSE).
