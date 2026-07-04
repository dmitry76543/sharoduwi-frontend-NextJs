import type { CityPublic } from "@/lib/cities/types";

/** Нормализация для поиска (регистр, ё → е) */
export function normalizeCitySearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/ё/g, "е");
}

export function cityMatchesQuery(city: CityPublic, query: string): boolean {
  const normalized = normalizeCitySearchQuery(query);
  if (!normalized) return true;
  return normalizeCitySearchQuery(city.name).includes(normalized);
}

export function filterCitiesByQuery(cities: CityPublic[], query: string): CityPublic[] {
  const normalized = normalizeCitySearchQuery(query);
  if (!normalized) return cities;
  return cities.filter((city) => cityMatchesQuery(city, query));
}
