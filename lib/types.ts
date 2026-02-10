export const APP_CATEGORIES = [
  "Hiking/Nature",
  "Cinema/Movies",
  "Sports",
  "Culture/Museums",
  "Food/Drink",
  "Family/Kids",
  "Other",
] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export type Activity = {
  id: string;
  name: string;
  category: AppCategory;
  description?: string;
  address?: string;
  distanceKm: number;
  openingHours?: string;
  lat: number;
  lon: number;
  osmUrl: string;
  googleMapsUrl: string;
};

export type OSMElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

export type GeocodeResult = {
  displayName: string;
  lat: number;
  lon: number;
};
