import { z } from "zod";
import { APP_CATEGORIES, type AppCategory } from "@/lib/types";

const radiusOptions = [1, 3, 5, 10] as const;

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
});

export const activitiesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().refine((value) => radiusOptions.includes(value as (typeof radiusOptions)[number]), {
    message: "Radius muss 1, 3, 5 oder 10 km sein",
  }),
  categories: z.string().optional(),
});

export function parseCategories(value?: string): AppCategory[] {
  if (!value || value === "all") {
    return [...APP_CATEGORIES];
  }

  const parsed = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry): entry is AppCategory => APP_CATEGORIES.includes(entry as AppCategory));

  return parsed.length > 0 ? parsed : [...APP_CATEGORIES];
}
