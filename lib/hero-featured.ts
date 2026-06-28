import type { Product } from "@/lib/data";

export const HERO_FEATURED_NAME = "Фонтан из 10 воздушных шаров №373а";
export const HERO_FEATURED_SUBTITLE = "фонтан для праздника";
export const HERO_FEATURED_ART_NO = "373а";

function normalize(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase().replace(/а/g, "a");
}

export function findHeroFeaturedProduct(products: Product[]): Product | undefined {
  if (!products.length) return undefined;

  const targetArt = normalize(HERO_FEATURED_ART_NO);

  const byArtNo = products.find(
    (product) => product.artNo && normalize(product.artNo).includes(targetArt)
  );
  if (byArtNo) return byArtNo;

  const nameNeedle = HERO_FEATURED_NAME.toLowerCase();
  const byName = products.find((product) => {
    const name = product.name.toLowerCase();
    return (
      name.includes(nameNeedle) ||
      (name.includes("фонтан из 10") && (name.includes("373а") || name.includes("373a")))
    );
  });
  return byName;
}
