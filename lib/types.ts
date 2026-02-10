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

export const CATEGORY_META: Record<
  AppCategory,
  {
    label: string;
    icon: string;
    badgeClass: string;
  }
> = {
  "Hiking/Nature": {
    label: "Wandern & Natur",
    icon: "🥾",
    badgeClass: "bg-emerald-100 text-emerald-800",
  },
  "Cinema/Movies": {
    label: "Kino & Filme",
    icon: "🎬",
    badgeClass: "bg-violet-100 text-violet-800",
  },
  Sports: {
    label: "Sport & Fitness",
    icon: "💪",
    badgeClass: "bg-orange-100 text-orange-800",
  },
  "Culture/Museums": {
    label: "Kultur & Museen",
    icon: "🏛️",
    badgeClass: "bg-blue-100 text-blue-800",
  },
  "Food/Drink": {
    label: "Essen & Trinken",
    icon: "🍽️",
    badgeClass: "bg-rose-100 text-rose-800",
  },
  "Family/Kids": {
    label: "Familie & Kinder",
    icon: "🧸",
    badgeClass: "bg-pink-100 text-pink-800",
  },
  Other: {
    label: "Sonstiges",
    icon: "📍",
    badgeClass: "bg-slate-100 text-slate-700",
  },
};

export type Activity = {
  id: string;
  name: string;
  category: AppCategory;
  subcategory?: string;
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
  shortLabel?: string;
  lat: number;
  lon: number;
};

export type ReverseGeocodeResult = {
  displayName: string;
  shortLabel?: string;
  lat: number;
  lon: number;
};
