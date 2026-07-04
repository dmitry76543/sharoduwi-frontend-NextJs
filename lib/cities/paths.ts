import type { CityPublic, CitySlug } from "@/lib/cities/types";
import {
  DEFAULT_CITY_SLUG,
  getCityBySlug,
  isCitySlug,
  LEGACY_CITY_SLUGS,
} from "@/lib/cities/cities";

/**
 * Строит path с учётом города.
 * @param citySlug — slug города или null для общих URL (/)
 * @param path — путь без города, напр. `/catalog` или `/`
 */
export function cityPath(citySlug: CitySlug | string | null | undefined, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (!citySlug) return normalized;

  const resolved = getCityBySlug(citySlug)?.slug ?? citySlug;

  if (normalized === "/") return `/${resolved}`;

  const prefix = `/${resolved}`;
  if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
    return normalized;
  }

  return `${prefix}${normalized}`;
}

/** Абсолютный path для CityPublic */
export function cityPublicPath(city: CityPublic | null | undefined, path: string): string {
  if (!city) return path.startsWith("/") ? path : `/${path}`;
  return cityPath(city.slug, path);
}

/** Извлекает slug города из pathname, если первый сегмент — город */
export function parseCityFromPathname(pathname: string): {
  citySlug: CitySlug | null;
  restPath: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (!first) {
    return { citySlug: null, restPath: "/" };
  }

  const resolved = LEGACY_CITY_SLUGS[first] ?? first;

  if (isCitySlug(resolved)) {
    const rest = segments.slice(1);
    return {
      citySlug: getCityBySlug(resolved)!.slug,
      restPath: rest.length ? `/${rest.join("/")}` : "/",
    };
  }

  return { citySlug: null, restPath: pathname.startsWith("/") ? pathname : `/${pathname}` };
}

/** Проверяет, является ли pathname городской главной */
export function isCityHomePath(pathname: string, citySlug: CitySlug): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized === `/${citySlug}`;
}

/** Главная или городская главная — для якорных ссылок */
export function isSiteHomePath(pathname: string, citySlug?: CitySlug | null): boolean {
  if (pathname === "/") return true;
  if (citySlug && isCityHomePath(pathname, citySlug)) return true;
  const { citySlug: parsed, restPath } = parseCityFromPathname(pathname);
  return parsed !== null && restPath === "/";
}

export function stripCityPrefix(pathname: string): string {
  const { restPath } = parseCityFromPathname(pathname);
  return restPath;
}

export function getCityBasePath(citySlug: CitySlug): string {
  return `/${citySlug}`;
}

export { DEFAULT_CITY_SLUG };
