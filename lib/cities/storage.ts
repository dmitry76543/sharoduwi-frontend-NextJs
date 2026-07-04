import { CITY_COOKIE, getCityBySlug, isCitySlug } from "@/lib/cities/cities";
import type { CitySlug } from "@/lib/cities/types";

/** Slug города из localStorage или cookie (клиент) */
export function readStoredCitySlug(): CitySlug | null {
  if (typeof window === "undefined") return null;

  try {
    const fromStorage = localStorage.getItem(CITY_COOKIE);
    if (fromStorage && isCitySlug(fromStorage)) {
      return getCityBySlug(fromStorage)!.slug;
    }
  } catch {
    /* ignore */
  }

  try {
    for (const part of document.cookie.split(";")) {
      const trimmed = part.trim();
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = decodeURIComponent(trimmed.slice(eq + 1));
      if (key === CITY_COOKIE && value && isCitySlug(value)) {
        return getCityBySlug(value)!.slug;
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}
