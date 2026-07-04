import type { MetadataRoute } from "next";

import { BLOG_POSTS } from "@/lib/blog";
import { CITY_SLUGS, cityPath } from "@/lib/cities";
import { REGIONAL_SECTION_PATHS } from "@/lib/cities/routing";
import { COLLECTIONS } from "@/lib/data";
import { getProductSlug } from "@/lib/product-slug";
import { SITE_URL } from "@/lib/seo/site";
import { getCatalogProducts } from "@/lib/products-service";

/** Индексируемые страницы без префикса города */
export const GLOBAL_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/cities", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" as const },
];

export const REGIONAL_ROUTE_META: Record<
  string,
  { priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }
> = {
  "/": { priority: 1, changeFrequency: "daily" },
  "/catalog": { priority: 0.9, changeFrequency: "daily" },
  "/about": { priority: 0.7, changeFrequency: "monthly" },
  "/reviews": { priority: 0.7, changeFrequency: "weekly" },
  "/delivery": { priority: 0.8, changeFrequency: "monthly" },
};

/** Число product-sitemap файлов (города делятся на батчи) */
export const PRODUCT_SITEMAP_BATCHES = 4;

export const SITEMAP_IDS = [
  "global",
  "regions",
  ...Array.from({ length: PRODUCT_SITEMAP_BATCHES }, (_, i) => `products-${i}`),
] as const;

export type SitemapId = (typeof SITEMAP_IDS)[number];

export function sitemapEntry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  lastModified = new Date()
): MetadataRoute.Sitemap[number] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return {
    url: `${SITE_URL}${normalized === "/" ? "" : normalized}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

export function getCitySlugsForProductBatch(batchIndex: number): string[] {
  const batchSize = Math.ceil(CITY_SLUGS.length / PRODUCT_SITEMAP_BATCHES);
  const start = batchIndex * batchSize;
  return CITY_SLUGS.slice(start, start + batchSize);
}

export async function buildGlobalSitemapEntries(now = new Date()): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  for (const route of GLOBAL_ROUTES) {
    urls.push(sitemapEntry(route.path, route.priority, route.changeFrequency, now));
  }

  for (const post of BLOG_POSTS) {
    urls.push(sitemapEntry(`/blog/${post.slug}`, 0.6, "monthly", now));
  }

  return urls;
}

export function buildRegionalSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  for (const citySlug of CITY_SLUGS) {
    for (const sectionPath of REGIONAL_SECTION_PATHS) {
      const meta = REGIONAL_ROUTE_META[sectionPath];
      if (!meta) continue;
      urls.push(
        sitemapEntry(cityPath(citySlug, sectionPath), meta.priority, meta.changeFrequency, now)
      );
    }

    for (const collection of COLLECTIONS) {
      urls.push(
        sitemapEntry(
          cityPath(citySlug, `/categories/${collection.slug}`),
          0.75,
          "weekly",
          now
        )
      );
    }
  }

  return urls;
}

export async function buildProductSitemapEntries(
  batchIndex: number,
  now = new Date()
): Promise<MetadataRoute.Sitemap> {
  const citySlugs = getCitySlugsForProductBatch(batchIndex);
  const products = await getCatalogProducts().catch(() => []);
  const urls: MetadataRoute.Sitemap = [];

  for (const citySlug of citySlugs) {
    for (const product of products.slice(0, 200)) {
      urls.push(
        sitemapEntry(
          cityPath(citySlug, `/products/${getProductSlug(product)}`),
          0.7,
          "weekly",
          now
        )
      );
    }
  }

  return urls;
}
