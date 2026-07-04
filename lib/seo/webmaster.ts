import type { Metadata } from "next";

import { SITE_URL } from "@/lib/seo/site";

/** Домен для директивы Host в robots.txt (Яндекс) */
export function getSiteHost(): string {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

/** Meta-тег подтверждения сайта в Яндекс.Вебмастере */
export function buildYandexVerificationMetadata(): Metadata["verification"] | undefined {
  const code = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION?.trim();
  if (!code) return undefined;
  return { yandex: code };
}

/** Корневые URL, которые 301 → /[city]/… — не индексируем */
export const NON_INDEXABLE_ROOT_REGIONAL_PATHS = [
  "/catalog",
  "/about",
  "/reviews",
  "/delivery",
  "/checkout",
  "/products",
  "/categories",
] as const;
