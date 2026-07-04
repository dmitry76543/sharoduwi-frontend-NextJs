import type { NextRequest } from "next/server";

import {
  DEFAULT_CITY_SLUG,
  getAllCities,
  getCityByName,
  getCityBySlug,
} from "@/lib/cities/cities";
import type { CitySlug } from "@/lib/cities/types";
import { normalizeCitySearchQuery } from "@/lib/cities/search";

export type GeoLocationHint = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
};

const MOSCOW_OBLAST_REGIONS = new Set(
  [
    "moscow oblast",
    "moscow region",
    "moscowskaya oblast",
    "moscowskaya",
    "московская область",
    "московская",
    "mo",
  ].map(normalizeCitySearchQuery)
);

/** Транслит и варианты из MaxMind / ip-api → название в справочнике */
const GEO_CITY_ALIASES: Record<string, string> = {
  zhukovsky: "Жуковский",
  zhukovskiy: "Жуковский",
  zhukovskii: "Жуковский",
  ramenskoye: "Раменское",
  ramenskoe: "Раменское",
  lyubertsy: "Люберцы",
  luberetsy: "Люберцы",
  liubertsy: "Люберцы",
  dzerzhinsky: "Дзержинский",
  dzerzhinskij: "Дзержинский",
  bronnitsy: "Бронницы",
  fryazino: "Фрязино",
  tomilino: "Томилино",
  malakhovka: "Малаховка",
  malahovka: "Малаховка",
  kraskovo: "Красково",
};

const citiesByNormalizedName = (() => {
  const map = new Map<string, CitySlug>();
  for (const city of getAllCities()) {
    map.set(normalizeCitySearchQuery(city.name), city.slug);
    map.set(normalizeCitySearchQuery(city.slug), city.slug);
  }
  return map;
})();

function normalizeGeoToken(value: string | null | undefined): string {
  if (!value) return "";
  return normalizeCitySearchQuery(
    value.replace(/[._-]/g, " ").replace(/\s+/g, " ").trim()
  );
}

function resolveSlugFromGeoName(raw: string | null | undefined): CitySlug | null {
  const normalized = normalizeGeoToken(raw);
  if (!normalized) return null;

  const fromList = citiesByNormalizedName.get(normalized);
  if (fromList) return fromList;

  const aliasName = GEO_CITY_ALIASES[normalized.replace(/\s+/g, "")];
  if (aliasName) {
    const city = getCityByName(aliasName);
    if (city) return city.slug;
  }

  for (const city of getAllCities()) {
    const cityNorm = normalizeCitySearchQuery(city.name);
    if (cityNorm.startsWith(normalized) || normalized.startsWith(cityNorm)) {
      return city.slug;
    }
  }

  return null;
}

function isMoscowOblastRegion(region: string | null | undefined): boolean {
  const normalized = normalizeGeoToken(region);
  if (!normalized) return false;
  if (MOSCOW_OBLAST_REGIONS.has(normalized)) return true;
  return normalized.includes("moskov") || normalized.includes("москов");
}

function isRussia(country: string | null | undefined): boolean {
  const normalized = normalizeGeoToken(country);
  return normalized === "ru" || normalized === "rus" || normalized === "russia" || normalized === "россия";
}

/** Определяет slug по подсказке GeoIP (город / регион / страна) */
export function resolveCitySlugFromGeo(hint: GeoLocationHint): CitySlug | null {
  if (hint.country && !isRussia(hint.country)) return null;

  const fromCity = resolveSlugFromGeoName(hint.city);
  if (fromCity) return fromCity;

  if (isMoscowOblastRegion(hint.region)) {
    return DEFAULT_CITY_SLUG;
  }

  return null;
}

/** Платформенные заголовки и request.geo (Vercel и др.) */
export function getGeoLocationFromRequest(request: NextRequest): GeoLocationHint | null {
  const geo = (
    request as NextRequest & {
      geo?: { city?: string; region?: string; country?: string };
    }
  ).geo;
  if (geo?.city || geo?.region || geo?.country) {
    return {
      city: geo.city,
      region: geo.region,
      country: geo.country,
    };
  }

  const headerCity =
    request.headers.get("x-vercel-ip-city") ??
    request.headers.get("cf-ipcity") ??
    request.headers.get("x-appengine-city") ??
    request.headers.get("x-geo-city");

  const headerRegion =
    request.headers.get("x-vercel-ip-country-region") ??
    request.headers.get("cf-region") ??
    request.headers.get("x-appengine-region") ??
    request.headers.get("x-geo-region");

  const headerCountry =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-appengine-country") ??
    request.headers.get("x-geo-country");

  if (headerCity || headerRegion || headerCountry) {
    return {
      city: headerCity,
      region: headerRegion,
      country: headerCountry,
    };
  }

  return null;
}

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
  if (!candidate) return null;
  if (
    candidate === "127.0.0.1" ||
    candidate === "::1" ||
    candidate.startsWith("192.168.") ||
    candidate.startsWith("10.") ||
    candidate.startsWith("172.16.") ||
    candidate.startsWith("172.17.") ||
    candidate.startsWith("172.18.") ||
    candidate.startsWith("172.19.") ||
    candidate.startsWith("172.2") ||
    candidate.startsWith("172.30.") ||
    candidate.startsWith("172.31.")
  ) {
    return null;
  }
  return candidate;
}

const GEOIP_FETCH_TIMEOUT_MS = 1500;

/** ip-api.com — fallback, если платформа не отдаёт geo-заголовки */
async function fetchGeoFromIpApi(ip: string): Promise<GeoLocationHint | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOIP_FETCH_TIMEOUT_MS);

  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,city,regionName&lang=ru`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      status?: string;
      countryCode?: string;
      city?: string;
      regionName?: string;
    };

    if (data.status !== "success") return null;

    return {
      city: data.city,
      region: data.regionName,
      country: data.countryCode,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Определяет slug для cookie при первом визите (нет URL-города и нет cookie).
 * URL → GeoIP → Default не применяется здесь — только GeoIP; default в resolveCitySlugFromGeo.
 */
export async function detectGeoCitySlug(request: NextRequest): Promise<CitySlug | null> {
  const fromHeaders = getGeoLocationFromRequest(request);
  if (fromHeaders) {
    const slug = resolveCitySlugFromGeo(fromHeaders);
    if (slug) return getCityBySlug(slug)!.slug;
  }

  if (process.env.GEOIP_IP_API === "false") return null;

  const ip = getClientIp(request);
  if (!ip) return null;

  const fromApi = await fetchGeoFromIpApi(ip);
  if (!fromApi) return null;

  const slug = resolveCitySlugFromGeo(fromApi);
  return slug ? getCityBySlug(slug)!.slug : null;
}
