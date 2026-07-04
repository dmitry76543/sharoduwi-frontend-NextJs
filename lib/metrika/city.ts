import { getCityBySlug } from "@/lib/cities/cities";
import type { CitySlug } from "@/lib/cities/types";
import { parseCityFromPathname } from "@/lib/cities/paths";
import { readStoredCitySlug } from "@/lib/cities/storage";

import { YANDEX_METRIKA_ID } from "@/lib/metrika/constants";

/**
 * Параметры визита/целей для сегментации в интерфейсе Метрики.
 * Настройка: Настройки → Цели → условие «JavaScript-событие» + параметры визита.
 */
export const METRIKA_CITY_PARAM_KEYS = {
  slug: "city_slug",
  name: "city_name",
  deliveryCity: "delivery_city",
} as const;

let activeCitySlug: CitySlug | null = null;
let activeCityName: string | null = null;

export function getMetrikaCityParams(): Record<string, string> {
  if (!activeCitySlug) return {};
  const deliveryLabel = activeCityName ?? activeCitySlug;
  return {
    [METRIKA_CITY_PARAM_KEYS.slug]: activeCitySlug,
    ...(activeCityName ? { [METRIKA_CITY_PARAM_KEYS.name]: activeCityName } : {}),
    [METRIKA_CITY_PARAM_KEYS.deliveryCity]: deliveryLabel,
  };
}

/** Обновляет параметры визита в Яндекс.Метрике */
export function setMetrikaCity(slug: CitySlug | null) {
  activeCitySlug = slug;
  activeCityName = slug ? (getCityBySlug(slug)?.name ?? null) : null;

  if (typeof window === "undefined" || typeof window.ym !== "function") return;

  const params = getMetrikaCityParams();
  window.ym(YANDEX_METRIKA_ID, "params", params);
}

/** Slug из URL или сохранённого выбора (cookie / localStorage) */
export function resolveCitySlugForTracking(pathname: string): CitySlug | null {
  const { citySlug } = parseCityFromPathname(pathname);
  if (citySlug) return citySlug;
  return readStoredCitySlug();
}

export function syncMetrikaCityFromPath(pathname: string) {
  setMetrikaCity(resolveCitySlugForTracking(pathname));
}
