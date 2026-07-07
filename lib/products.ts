import {
  COLLECTIONS,
  TAGS,
  type CollectionSlug,
  type Product,
  type ProductTag,
  type TagFilter,
} from "@/lib/data";

function normalizeArtNo(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase().replace(/а/g, "a");
}

export function productMatchesSearch(product: Product, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  if (product.name.toLowerCase().includes(q)) return true;
  if (product.collection.toLowerCase().includes(q)) return true;
  if (product.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
  if (product.artNo) {
    const normQ = normalizeArtNo(q);
    if (normalizeArtNo(product.artNo).includes(normQ)) return true;
  }

  return false;
}

export const COLLECTION_SLUGS = COLLECTIONS.map((collection) => collection.slug);

export type { CollectionSlug, ProductTag, TagFilter };
export { TAGS };

export function isValidCollectionSlug(value: string): value is CollectionSlug {
  return (COLLECTION_SLUGS as readonly string[]).includes(value);
}

export function resolveCollectionSlug(
  input?: string | null
): CollectionSlug | undefined {
  if (!input || input === "all" || input === "Все") return undefined;
  if (isValidCollectionSlug(input)) return input;
  const byName = COLLECTIONS.find(
    (collection) => collection.name.toLowerCase() === input.toLowerCase()
  );
  return byName?.slug;
}

export function isValidTagFilter(value: string): value is TagFilter {
  return (TAGS as readonly string[]).includes(value);
}

const TAG_KEYWORDS: Record<ProductTag, string[]> = {
  Цифры: ["цифр", "числ", "number"],
  Композиции: ["композиц", "набор", "букет", "фонтан"],
  Латексные: ["латекс", "облако", "гелий", "шар"],
  Детям: ["дет", "мальчик", "девоч", "годик", "единорог", "космос"],
  Романтика: ["романт", "любл", "сердц"],
  Выписка: ["выписк", "новорож", "мальчик", "девочк"],
};

export function inferProductTags(...parts: (string | undefined)[]): ProductTag[] {
  const text = parts.filter(Boolean).join(" ").toLowerCase();
  const found = new Set<ProductTag>();

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS) as [
    ProductTag,
    string[],
  ][]) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      found.add(tag);
    }
  }

  return [...found];
}

export function parseTagsFromPropertyValue(value: string): ProductTag[] {
  const found = new Set<ProductTag>();
  const lower = value.toLowerCase();

  for (const tag of TAGS) {
    if (tag === "Все") continue;
    if (lower.includes(tag.toLowerCase())) {
      found.add(tag);
    }
  }

  return [...found];
}
