import type { MetadataRoute } from "next";

import { getSiteHost, NON_INDEXABLE_ROOT_REGIONAL_PATHS } from "@/lib/seo/webmaster";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/checkout",
          "/*/checkout",
          "/api/",
          ...NON_INDEXABLE_ROOT_REGIONAL_PATHS,
        ],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: [
          "/checkout",
          "/*/checkout",
          "/api/",
          ...NON_INDEXABLE_ROOT_REGIONAL_PATHS,
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: getSiteHost(),
  };
}
