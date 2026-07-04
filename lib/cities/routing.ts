import type { NextRequest } from "next/server";

import { CITY_COOKIE, DEFAULT_CITY_SLUG, getCityBySlug, isCitySlug } from "@/lib/cities/cities";
import {
  LEGACY_PATH_REDIRECTS,
  getLegacyNextRedirects,
  getLegacyNextRewrites,
} from "@/lib/cities/legacy-routes";
import type { CitySlug } from "@/lib/cities/types";
import { cityPath, parseCityFromPathname } from "@/lib/cities/paths";

/** Срок жизни cookie выбранного города — 30 дней */
export const CITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export {
  LEGACY_PATH_REDIRECTS,
  getLegacyNextRedirects,
  getLegacyNextRewrites,
} from "@/lib/cities/legacy-routes";

/** Корневые разделы, для которых есть версия /[city]/… */
const REGIONAL_EXACT_PATHS = new Set([
  "/catalog",
  "/about",
  "/reviews",
  "/delivery",
  "/checkout",
]);

const REGIONAL_PREFIXES = ["/products/", "/categories/"] as const;

/** Пути разделов с региональными версиями /[city]/… — для sitemap и SEO */
export const REGIONAL_SECTION_PATHS = [
  "/",
  ...REGIONAL_EXACT_PATHS,
] as const;

export { REGIONAL_EXACT_PATHS, REGIONAL_PREFIXES };

/** Страницы без привязки к городу — не редиректим и не rewrite */
const CITY_ROUTING_EXCLUDED = new Set(["/", "/cities", "/blog"]);

export function isCityRoutingExcluded(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (CITY_ROUTING_EXCLUDED.has(normalized)) return true;
  if (normalized.startsWith("/blog/")) return true;
  if (normalized.startsWith("/api/")) return true;
  return false;
}

export function isRegionalRootPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (REGIONAL_EXACT_PATHS.has(normalized)) return true;
  return REGIONAL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** Канонический URL с префиксом города для корневого регионального path */
export function buildRegionalUrl(citySlug: CitySlug, pathname: string): string {
  const normalized = normalizePathname(pathname);
  return cityPath(citySlug, normalized);
}

export function resolveKnownCitySlug(
  request: NextRequest,
  geoSlug: CitySlug | null
): CitySlug | null {
  const { citySlug: urlCitySlug } = parseCityFromPathname(request.nextUrl.pathname);
  if (urlCitySlug) return urlCitySlug;

  const cookieValue = request.cookies.get(CITY_COOKIE)?.value;
  if (cookieValue && isCitySlug(cookieValue)) {
    return getCityBySlug(cookieValue)!.slug;
  }

  return geoSlug;
}

/**
 * 301 с корневого регионального URL на /[city]/…
 * Без города — на default (Жуковский); с cookie/geo — на выбранный slug.
 */
export function getRegionalRootConsolidationRedirect(
  pathname: string,
  preferredCitySlug: CitySlug | null
): string | null {
  if (isCityRoutingExcluded(pathname)) return null;

  const { citySlug: urlCitySlug } = parseCityFromPathname(pathname);
  if (urlCitySlug) return null;

  if (!isRegionalRootPath(pathname)) return null;

  const slug = preferredCitySlug ?? DEFAULT_CITY_SLUG;
  return buildRegionalUrl(slug, pathname);
}

/** @deprecated Используйте getRegionalRootConsolidationRedirect */
export function getRegionalCityRedirect(
  pathname: string,
  citySlug: CitySlug | null
): string | null {
  return getRegionalRootConsolidationRedirect(pathname, citySlug);
}

export function getLegacyPathRedirect(pathname: string): string | null {
  return LEGACY_PATH_REDIRECTS[normalizePathname(pathname)] ?? null;
}
