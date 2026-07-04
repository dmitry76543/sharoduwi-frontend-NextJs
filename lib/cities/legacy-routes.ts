/** Постоянные редиректы legacy URL → канонический региональный path (301) */
export const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  "/delivery/zhukovsky": "/zhukovskiy/delivery",
  "/delivery/ramenskoe": "/ramenskoe/delivery",
};

/** Internal rewrites для next.config (до удаления дублей в app/) */
export const INTERNAL_PATH_REWRITES: { source: string; destination: string }[] = [
  { source: "/delivery/zhukovsky", destination: "/zhukovskiy/delivery" },
  { source: "/delivery/ramenskoe", destination: "/ramenskoe/delivery" },
];

/**
 * Статические 301 для корневых региональных URL → Жуковский.
 * Не подключаем в next.config: редиректы конфига выполняются ДО middleware
 * и игнорируют cookie/geo. Консолидация — только в middleware (301 + город).
 */
const REGIONAL_ROOT_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/catalog", destination: "/zhukovskiy/catalog" },
  { source: "/about", destination: "/zhukovskiy/about" },
  { source: "/reviews", destination: "/zhukovskiy/reviews" },
  { source: "/delivery", destination: "/zhukovskiy/delivery" },
  { source: "/checkout", destination: "/zhukovskiy/checkout" },
  { source: "/products/:slug", destination: "/zhukovskiy/products/:slug" },
  { source: "/categories/:slug", destination: "/zhukovskiy/categories/:slug" },
];

export function getLegacyNextRedirects() {
  return Object.entries(LEGACY_PATH_REDIRECTS).map(([source, destination]) => ({
    source,
    destination,
    permanent: true as const,
  }));
}

export function getRegionalConsolidationNextRedirects() {
  return REGIONAL_ROOT_REDIRECTS.map(({ source, destination }) => ({
    source,
    destination,
    permanent: true as const,
  }));
}

export function getAllPermanentNextRedirects() {
  return [...getLegacyNextRedirects(), ...getRegionalConsolidationNextRedirects()];
}

export function getLegacyNextRewrites() {
  return INTERNAL_PATH_REWRITES.map(({ source, destination }) => ({
    source,
    destination,
  }));
}
