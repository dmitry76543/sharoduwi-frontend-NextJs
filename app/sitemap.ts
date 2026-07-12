import type { MetadataRoute } from "next";

import {
  buildGlobalSitemapEntries,
  buildProductSitemapEntries,
  buildRegionalSitemapEntries,
  SITEMAP_IDS,
} from "@/lib/sitemap/entries";

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

function productBatchIndex(sitemapId: string): number | null {
  if (!sitemapId.startsWith("products-")) return null;
  const batchIndex = Number(sitemapId.slice("products-".length));
  return Number.isFinite(batchIndex) ? batchIndex : null;
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = await props.id;
  const now = new Date();

  switch (sitemapId) {
    case "global":
      return buildGlobalSitemapEntries(now);
    case "regions":
      return buildRegionalSitemapEntries(now);
    default: {
      const batchIndex = productBatchIndex(sitemapId);
      if (batchIndex !== null) {
        return buildProductSitemapEntries(batchIndex, now);
      }
      return [];
    }
  }
}
