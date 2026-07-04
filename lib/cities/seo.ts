import type { Metadata } from "next";

import {
  absoluteUrl,
  buildPageMetadata,
  type PageMetadataInput,
} from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site";
import { DEFAULT_CITY_SLUG, getCityBySlug } from "@/lib/cities/cities";
import { cityPath } from "@/lib/cities/paths";
import { isRegionalRootPath } from "@/lib/cities/routing";
import type { CityPublic, CitySlug } from "@/lib/cities/types";

/**
 * Canonical и x-default для региональных страниц.
 * Не выводим сотни hreflang — для одного языка (ru) достаточно canonical + x-default (Яндекс/Google).
 */
export function buildCityAlternates(
  restPath: string,
  currentCitySlug?: CitySlug | null
): Metadata["alternates"] {
  const normalizedRest = restPath.startsWith("/") ? restPath : `/${restPath}`;
  const isRegional = normalizedRest === "/" || isRegionalRootPath(normalizedRest);
  const defaultRegionalPath = cityPath(DEFAULT_CITY_SLUG, normalizedRest);
  const xDefaultPath = isRegional ? defaultRegionalPath : normalizedRest;

  const canonicalPath = currentCitySlug
    ? cityPath(currentCitySlug, normalizedRest)
    : isRegional
      ? defaultRegionalPath
      : normalizedRest;

  const canonical = absoluteUrl(canonicalPath);
  const xDefault = absoluteUrl(xDefaultPath === "/" ? defaultRegionalPath : xDefaultPath);

  return {
    canonical,
    languages: {
      "x-default": xDefault,
      ru: canonical,
    },
  };
}

export interface CityPageMetadataInput extends Omit<PageMetadataInput, "path"> {
  /** Путь без префикса города, напр. `/catalog` */
  restPath: string;
  city?: CityPublic | null;
}

export function buildCityPageMetadata({
  city,
  restPath,
  ...input
}: CityPageMetadataInput): Metadata {
  const path = city ? cityPath(city.slug, restPath) : restPath;
  const base = buildPageMetadata({ ...input, path });

  return {
    ...base,
    alternates: buildCityAlternates(restPath, city?.slug),
  };
}

export function buildCityRootMetadata(city: CityPublic): Metadata {
  return buildCityPageMetadata({
    city,
    restPath: "/",
    title: city.seo.homeTitle,
    description: city.seo.homeDescription,
  });
}

export function buildCatalogMetadata(city?: CityPublic | null): Metadata {
  const area = city?.namePrepositional ?? "Жуковском и Раменском районе";
  return buildCityPageMetadata({
    city,
    restPath: "/catalog",
    title: `Каталог гелиевых и воздушных шаров${city ? ` в ${city.namePrepositional}` : ""}`,
    description: `Полный каталог гелиевых и воздушных шаров, композиций и наборов в ${area}. Цены, фото и доставка к торжеству.`,
  });
}

export function buildProductMetadata(
  city: CityPublic | null | undefined,
  product: {
    name: string;
    collection: string;
    briefDescription?: string;
    description?: string;
    images?: string[];
    img?: string;
    slug: string;
  }
): Metadata {
  const description =
    product.briefDescription?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    `${product.name} из коллекции «${product.collection}». Гелиевые и воздушные шары${city ? ` в ${city.namePrepositional}` : " в Жуковском и Раменском районе"}.`;

  return buildCityPageMetadata({
    city,
    restPath: `/products/${product.slug}`,
    title: product.name,
    description,
    image: product.images?.[0] ?? product.img,
  });
}

export function buildCollectionMetadata(
  city: CityPublic | null | undefined,
  collection: { name: string; sub: string; slug: string },
  image?: string
): Metadata {
  const area = city?.namePrepositional ?? "Жуковском";
  return buildCityPageMetadata({
    city,
    restPath: `/categories/${collection.slug}`,
    title: `${collection.name}${city ? ` в ${city.namePrepositional}` : " в Жуковском"}`,
    description: `${collection.name}: ${collection.sub}. Гелиевые и воздушные шары с доставкой в ${area}.`,
    image,
  });
}

export function getCityForParams(cityParam: string): CityPublic | undefined {
  return getCityBySlug(cityParam);
}

/**
 * Metadata для корневых URL-дублей (/catalog, /products/…).
 * noindex + canonical на версию default-города (Жуковский).
 */
export function buildRootRegionalDuplicateMetadata(
  input: Omit<PageMetadataInput, "path"> & { restPath: string }
): Metadata {
  const restPath = input.restPath.startsWith("/") ? input.restPath : `/${input.restPath}`;
  const base = buildPageMetadata({ ...input, path: restPath });
  const canonical = absoluteUrl(cityPath(DEFAULT_CITY_SLUG, restPath));

  return {
    ...base,
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}
