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

/** Модули каталога → категории AdvantShop */
export const TAG_COLLECTION_SLUGS: Partial<Record<ProductTag, CollectionSlug[]>> = {
  Цифры: ["set-s-tsifroi"],
  Выписка: ["dlya-novorozhdennykh"],
  Романтика: ["dlya-vliublennykh"],
  Детям: ["dlya-devochek-1", "dlya-malchikov-1"],
  Латексные: ["shary-pod-potolok-1"],
};

export function productMatchesTag(product: Product, tag: TagFilter): boolean {
  if (tag === "Все") return true;

  const collectionSlugs = TAG_COLLECTION_SLUGS[tag as ProductTag];
  if (collectionSlugs) {
    return collectionSlugs.includes(product.collectionSlug);
  }

  return product.tags.includes(tag as ProductTag);
}

export function inferTagsFromCollection(collectionSlug: CollectionSlug): ProductTag[] {
  const tags = new Set<ProductTag>();
  for (const [tag, slugs] of Object.entries(TAG_COLLECTION_SLUGS) as [
    ProductTag,
    CollectionSlug[],
  ][]) {
    if (slugs.includes(collectionSlug)) {
      tags.add(tag);
    }
  }
  return [...tags];
}

const TAG_KEYWORDS: Record<ProductTag, string[]> = {
  Цифры: ["цифр", "числ", "number"],
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
