"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  CITY_COOKIE,
  CITY_COOKIE_MAX_AGE,
  cityPath,
  getCityBySlug,
  parseCityFromPathname,
  readStoredCitySlug,
  resolveCitySlug,
  type CityPublic,
  type CitySlug,
} from "@/lib/cities";

interface CityContextValue {
  /** Текущий город из URL или null на общих страницах */
  city: CityPublic | null;
  /** Slug для ссылок: city из URL или cookie (на общих страницах) */
  linkCitySlug: CitySlug | null;
  /** Строит href с учётом города */
  href: (path: string) => string;
  /** На главной (общей или городской) */
  isHome: boolean;
  /** Сохранить выбор города в cookie + localStorage */
  persistCity: (slug: CitySlug) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

interface CityProviderProps {
  children: ReactNode;
  /** Город, переданный с сервера (из [city] layout) */
  city?: CityPublic | null;
}

export function CityProvider({ children, city: cityProp = null }: CityProviderProps) {
  const pathname = usePathname();
  const { citySlug: urlCitySlug } = parseCityFromPathname(pathname);
  const [storedSlug, setStoredSlug] = useState<CitySlug | null>(null);

  const city = useMemo(() => {
    if (cityProp) return cityProp;
    if (urlCitySlug) return getCityBySlug(urlCitySlug) ?? null;
    return null;
  }, [cityProp, urlCitySlug]);

  const linkCitySlug = city?.slug ?? urlCitySlug ?? storedSlug ?? null;

  const href = useCallback(
    (path: string) => {
      const slug = city?.slug ?? linkCitySlug;
      return cityPath(slug, path);
    },
    [city?.slug, linkCitySlug]
  );

  const isHome = pathname === "/" || (city !== null && pathname === city.basePath);

  const persistCity = useCallback((slug: CitySlug) => {
    const resolved = resolveCitySlug(slug);
    try {
      localStorage.setItem(CITY_COOKIE, resolved);
    } catch {
      /* ignore */
    }
    document.cookie = `${CITY_COOKIE}=${resolved};path=/;max-age=${CITY_COOKIE_MAX_AGE};SameSite=Lax`;
  }, []);

  useEffect(() => {
    if (city?.slug) persistCity(city.slug);
  }, [city?.slug, persistCity]);

  useEffect(() => {
    setStoredSlug(readStoredCitySlug());
  }, [pathname]);

  useEffect(() => {
    if (city) return;
    const stored = readStoredCitySlug();
    if (stored) {
      document.cookie = `${CITY_COOKIE}=${stored};path=/;max-age=${CITY_COOKIE_MAX_AGE};SameSite=Lax`;
    }
  }, [city, pathname]);

  const value = useMemo<CityContextValue>(
    () => ({
      city,
      linkCitySlug: city?.slug ?? linkCitySlug,
      href,
      isHome,
      persistCity,
    }),
    [city, linkCitySlug, href, isHome, persistCity]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}

export function useCityOptional() {
  return useContext(CityContext);
}

/** Оборачивает в CityProvider только если ещё не внутри (напр. [city]/layout) */
export function MaybeCityProvider({
  city = null,
  children,
}: {
  city?: CityPublic | null;
  children: ReactNode;
}) {
  const existing = useContext(CityContext);
  if (existing) return <>{children}</>;
  return <CityProvider city={city}>{children}</CityProvider>;
}

export function useCityPath() {
  const ctx = useCity();
  return ctx.href;
}
