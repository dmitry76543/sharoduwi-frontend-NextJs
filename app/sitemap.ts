import type { MetadataRoute } from "next";

import {
  buildGlobalSitemapEntries,
  buildProductSitemapEntries,
  buildRegionalSitemapEntries,
  PRODUCT_SITEMAP_BATCHES,
} from "@/lib/sitemap/entries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    ...(await buildGlobalSitemapEntries(now)),
    ...buildRegionalSitemapEntries(now),
  ];

  for (let batch = 0; batch < PRODUCT_SITEMAP_BATCHES; batch += 1) {
    urls.push(...(await buildProductSitemapEntries(batch, now)));
  }

  return urls;
}
