export type { CityConfig, CityPublic, CitySeo, CitySlug, CityDelivery } from "@/lib/cities/types";

export {
  CITIES,
  CITY_SLUGS,
  CITY_COOKIE,
  DEFAULT_CITY_SLUG,
  LEGACY_CITY_SLUGS,
  PRIMARY_CITY_SLUGS,
  getAllCities,
  getCityBySlug,
  getDefaultCity,
  getPrimaryCities,
  getSecondaryCities,
  getCityByName,
  SETTLEMENT_NAMES,
  isCitySlug,
  resolveCitySlug,
  toPublicCity,
} from "@/lib/cities/cities";

export {
  cityPath,
  cityPublicPath,
  parseCityFromPathname,
  isCityHomePath,
  isSiteHomePath,
  stripCityPrefix,
  getCityBasePath,
} from "@/lib/cities/paths";

export { getCityFaqItems, getCityHeroStats, getDeliveryConfigForCity } from "@/lib/cities/content";

export {
  buildCityAlternates,
  buildCityPageMetadata,
  buildCityRootMetadata,
  buildCatalogMetadata,
  buildProductMetadata,
  buildCollectionMetadata,
  buildRootRegionalDuplicateMetadata,
  getCityForParams,
} from "@/lib/cities/seo";

export {
  cityMatchesQuery,
  filterCitiesByQuery,
  normalizeCitySearchQuery,
} from "@/lib/cities/search";

export { readStoredCitySlug } from "@/lib/cities/storage";

export { detectGeoCitySlug, resolveCitySlugFromGeo, getGeoLocationFromRequest } from "@/lib/cities/geoip";
export type { GeoLocationHint } from "@/lib/cities/geoip";

export {
  CITY_COOKIE_MAX_AGE,
  LEGACY_PATH_REDIRECTS,
  getLegacyNextRedirects,
  getLegacyNextRewrites,
  getRegionalRootConsolidationRedirect,
  getRegionalCityRedirect,
  isRegionalRootPath,
  isCityRoutingExcluded,
  REGIONAL_SECTION_PATHS,
} from "@/lib/cities/routing";

export {
  getRegionalConsolidationNextRedirects,
  getAllPermanentNextRedirects,
} from "@/lib/cities/legacy-routes";
