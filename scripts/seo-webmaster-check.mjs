#!/usr/bin/env node
/**
 * Проверка SEO перед/после отправки sitemap в Яндекс.Вебмастер.
 * Запуск: node scripts/seo-webmaster-check.mjs [baseUrl]
 * По умолчанию: http://localhost:3000 или SITE_URL из .env
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadSiteUrl() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    const match = raw.match(/^SITE_URL=(.+)$/m) || raw.match(/^NEXT_PUBLIC_SITE_URL=(.+)$/m);
    if (match) return match[1].trim().replace(/\/$/, "");
  } catch {
    /* ignore */
  }
  return "https://sharoduwi.ru";
}

const baseUrl = (process.argv[2] || process.env.SITE_URL || loadSiteUrl()).replace(/\/$/, "");

const checks = [
  {
    name: "robots.txt — sitemap",
    url: "/robots.txt",
    assert: (text, headers) => {
      if (!text.includes("Sitemap:")) throw new Error("нет директивы Sitemap");
      if (!text.includes("/sitemap.xml")) throw new Error("sitemap.xml не указан");
      const host = headers.get("content-type") ?? "";
      if (!host.includes("text/plain") && !host.includes("text/")) {
        throw new Error(`неожиданный content-type: ${host}`);
      }
    },
  },
  {
    name: "sitemap.xml — доступен",
    url: "/sitemap.xml",
    assert: (text, headers) => {
      const status = headers.get("x-check-status");
      if (status !== "200") throw new Error(`status ${status}`);
      const type = headers.get("content-type") ?? "";
      if (!type.includes("xml") && !text.includes("<urlset") && !text.includes("<sitemapindex")) {
        throw new Error("не XML sitemap");
      }
    },
  },
  {
    name: "главная /zhukovskiy/ — canonical",
    url: "/zhukovskiy",
    assert: (_text, _headers, html) => {
      const canonical = html.match(/rel="canonical"\s+href="([^"]+)"/i)?.[1];
      if (!canonical?.includes("/zhukovskiy")) {
        throw new Error(`canonical: ${canonical ?? "не найден"}`);
      }
    },
  },
  {
    name: "/ramenskoe/catalog — canonical на себя",
    url: "/ramenskoe/catalog",
    assert: (_text, _headers, html) => {
      const canonical = html.match(/rel="canonical"\s+href="([^"]+)"/i)?.[1];
      if (!canonical?.includes("/ramenskoe/catalog")) {
        throw new Error(`canonical: ${canonical ?? "не найден"}`);
      }
    },
  },
  {
    name: "/catalog — 301 на город",
    url: "/catalog",
    followRedirect: false,
    assert: (_text, headers) => {
      const status = headers.get("x-check-status");
      if (status !== "301" && status !== "308") {
        throw new Error(`ожидали 301/308, получили ${status}`);
      }
      const location = headers.get("location") ?? "";
      if (!location.includes("/zhukovskiy/catalog") && !location.includes("/ramenskoe/catalog")) {
        throw new Error(`Location: ${location}`);
      }
    },
  },
  {
    name: "/lyubertsy/delivery — indexable",
    url: "/lyubertsy/delivery",
    assert: (_text, headers, html) => {
      const status = headers.get("x-check-status");
      if (status !== "200") throw new Error(`status ${status}`);
      if (/noindex/i.test(html)) throw new Error("найден noindex");
    },
  },
];

async function fetchCheck({ url, followRedirect = true }) {
  const response = await fetch(`${baseUrl}${url}`, {
    redirect: followRedirect ? "follow" : "manual",
    headers: { Accept: "text/html,application/xhtml+xml" },
  });
  const text = await response.text();
  const headers = new Headers(response.headers);
  headers.set("x-check-status", String(response.status));
  if (!followRedirect) {
    headers.set("location", response.headers.get("location") ?? "");
  }
  return { text, headers };
}

console.log(`SEO check → ${baseUrl}\n`);

let failed = 0;

for (const check of checks) {
  try {
    const { text, headers } = await fetchCheck(check);
    await check.assert(text, headers, text);
    console.log(`✓ ${check.name}`);
  } catch (error) {
    failed += 1;
    console.log(`✗ ${check.name}: ${error.message}`);
  }
}

console.log(failed ? `\n${failed} проверок не пройдено` : "\nВсе проверки пройдены");
console.log("\nЯндекс.Вебмастер:");
console.log(`  1. Добавьте сайт ${getHost(baseUrl)}`);
console.log(`  2. Sitemap: ${baseUrl}/sitemap.xml`);
console.log("  3. Метрика → сегменты по параметрам city_slug, city_name, delivery_city");
console.log("  4. Через 1–2 недели: Индексирование → проверить /zhukovskiy/, /ramenskoe/catalog");

process.exit(failed ? 1 : 0);

function getHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
