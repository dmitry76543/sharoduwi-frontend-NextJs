import type { Metadata } from "next";

import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";
import { buildYandexVerificationMetadata } from "@/lib/seo/webmaster";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function resolveImageUrl(src?: string): string {
  if (!src) return absoluteUrl(DEFAULT_OG_IMAGE);
  return absoluteUrl(src);
}

function withBrand(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
}

export interface PageMetadataInput {
  title: string;
  description?: string;
  path: string;
  image?: string;
  ogType?: "website" | "article";
}

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image,
  ogType = "website",
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = withBrand(title);
  const ogImage = resolveImageUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: ogType,
      locale: "ru_RU",
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function buildRootMetadata(): Metadata {
  const canonical = absoluteUrl("/");
  const title = `${SITE_NAME} — гелиевые и воздушные шары в Жуковском`;
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s — ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    alternates: {
      canonical,
    },
    verification: buildYandexVerificationMetadata(),
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description: SITE_DESCRIPTION,
      images: [{ url: ogImage, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: SITE_DESCRIPTION,
      images: [ogImage],
    },
  };
}
