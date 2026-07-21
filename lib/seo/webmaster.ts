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
  "/search",
  "/products",
  "/categories",
] as const;

/**
 * Незначащие GET-параметры для Clean-param (Яндекс).
 * etext / ybaip — служебные метки выдачи Яндекса, контент страницы не меняют.
 */
export const YANDEX_CLEAN_PARAMS = ["etext", "ybaip"] as const;

const ROBOTS_ALLOW = [
  "/",
  "/delivery/moscow",
  "/delivery/balashikha",
  "/delivery/kotelniki",
  "/delivery/lytkarino",
] as const;

const ROBOTS_DISALLOW_BASE = [
  "/checkout",
  "/*/checkout",
  "/staff-alert",
  "/api/",
] as const;

function formatRules(lines: readonly string[], prefix: "Allow" | "Disallow"): string {
  return lines.map((path) => `${prefix}: ${path}`).join("\n");
}

/** Полный robots.txt, включая Clean-param для Яндекса */
export function buildRobotsTxt(): string {
  const disallow = [...ROBOTS_DISALLOW_BASE, ...NON_INDEXABLE_ROOT_REGIONAL_PATHS];
  const cleanParam = `Clean-param: ${YANDEX_CLEAN_PARAMS.join("&")}`;

  return [
    "User-Agent: *",
    formatRules(ROBOTS_ALLOW, "Allow"),
    formatRules(disallow, "Disallow"),
    "",
    "User-Agent: Yandex",
    formatRules(ROBOTS_ALLOW, "Allow"),
    formatRules(disallow, "Disallow"),
    cleanParam,
    "",
    `Host: ${getSiteHost()}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}
