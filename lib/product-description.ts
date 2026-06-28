const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "span",
  "div",
  "h3",
  "h4",
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Убирает опасные теги и атрибуты, оставляет базовую разметку из AdvantShop. */
export function sanitizeProductHtml(html: string): string {
  const withoutBlocks = html
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style)[^>]*\/\s*>/gi, "");

  return withoutBlocks.replace(
    /<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi,
    (_match, slash: string, rawTag: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";

      if (slash) return `</${tag}>`;
      if (tag === "br") return "<br>";
      return `<${tag}>`;
    }
  );
}

/** Убирает строку «Артикул: …» из HTML-описания — артикул показываем отдельно. */
export function stripArtNoFromDescription(html: string, artNo?: string): string {
  if (!artNo?.trim()) return html;

  const escaped = escapeRegExp(artNo.trim());
  return html
    .replace(
      new RegExp(`<p>\\s*Артикул:\\s*${escaped}\\s*<\\/p>`, "gi"),
      ""
    )
    .replace(new RegExp(`Артикул:\\s*${escaped}\\s*`, "gi"), "")
    .trim();
}

export function prepareProductDescription(
  description?: string,
  artNo?: string
): string | null {
  if (!description?.trim()) return null;

  const cleaned = stripArtNoFromDescription(description.trim(), artNo);
  if (!cleaned) return null;

  return sanitizeProductHtml(cleaned);
}

export function prepareProductLead(text?: string): string | null {
  if (!text?.trim()) return null;
  if (!/<[a-z][\s\S]*>/i.test(text)) return text.trim();
  return sanitizeProductHtml(text.trim());
}
