import type { Product, ProductDetails, ProductTag } from "@/lib/data";
import { getCollectionName } from "@/lib/data";
import type { CollectionSlug } from "@/lib/products";
import { getProductSlug } from "@/lib/product-slug";
import { inferProductTags, parseTagsFromPropertyValue } from "@/lib/products";
import { resolveProductImageUrl, resolveProductImages } from "./images";
import type {
  AdvantShopCatalogProduct,
  AdvantShopPhoto,
  AdvantShopProductDetails,
  AdvantShopProperty,
} from "./types";

function pickImage(
  product: Pick<AdvantShopCatalogProduct, "photoMiddle" | "photoSmall" | "photos">
): string | undefined {
  if (product.photoMiddle) return product.photoMiddle;
  if (product.photoSmall) return product.photoSmall;

  const photos = product.photos ?? [];
  const main = photos.find((photo) => photo.main) ?? photos[0];

  return (
    main?.middleSrc ??
    main?.bigSrc ??
    main?.smallSrc ??
    undefined
  );
}

function pickArtNo(
  item: Pick<AdvantShopCatalogProduct, "artNo" | "offers">
): string | undefined {
  return (
    item.artNo ??
    item.offers?.find((offer) => offer.isMain)?.artNo ??
    item.offers?.[0]?.artNo ??
    undefined
  );
}

function pickPrices(
  item: Pick<AdvantShopCatalogProduct, "price" | "priceWithDiscount" | "offers">
): { price: number; old?: number } {
  const mainOffer = item.offers?.find((offer) => offer.isMain) ?? item.offers?.[0];
  const basePrice = item.price ?? mainOffer?.price;
  const discountPrice =
    item.priceWithDiscount ??
    (mainOffer?.oldPrice != null &&
    mainOffer.oldPrice > (mainOffer.price ?? 0)
      ? mainOffer.price
      : undefined);

  if (basePrice == null || !Number.isFinite(basePrice)) {
    const offerPrice = mainOffer?.price;
    if (offerPrice != null && Number.isFinite(offerPrice)) {
      return { price: Math.round(offerPrice) };
    }
    return { price: 0 };
  }

  const price = Math.round(discountPrice ?? basePrice);
  const hasDiscount =
    discountPrice != null && Number.isFinite(basePrice) && basePrice > discountPrice;

  return {
    price,
    old: hasDiscount ? Math.round(basePrice) : undefined,
  };
}

function mapBadge(
  product: Pick<AdvantShopCatalogProduct, "newProduct" | "bestseller" | "sales">
): Product["tag"] {
  if (product.newProduct) return "new";
  if (product.bestseller || product.sales) return "hit";
  return undefined;
}

function resolveProductTags(
  item: AdvantShopCatalogProduct,
  properties: AdvantShopProperty[] = []
): ProductTag[] {
  const fromProperties = new Set<ProductTag>();

  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").toLowerCase();
    const value = property.propertyValue ?? property.value ?? "";

    if (name.includes("тег") || name.includes("метк")) {
      for (const tag of parseTagsFromPropertyValue(value)) {
        fromProperties.add(tag);
      }
    }
  }

  if (fromProperties.size) {
    return [...fromProperties];
  }

  return inferProductTags(item.name, item.briefDescription);
}

export function mapCatalogProduct(
  item: AdvantShopCatalogProduct,
  collectionSlug: CollectionSlug,
  properties: AdvantShopProperty[] = []
): Product {
  const { price, old } = pickPrices(item);
  const rawImage = pickImage(item);

  return {
    id: item.productId,
    name: item.name,
    collectionSlug,
    collection: getCollectionName(collectionSlug),
    tags: resolveProductTags(item, properties),
    price,
    old,
    colors: ["pink"],
    tag: mapBadge(item),
    img: rawImage ? resolveProductImageUrl(rawImage) : undefined,
    artNo: pickArtNo(item),
    urlPath: item.urlPath,
  };
}

export function collectImages(photos?: AdvantShopPhoto[] | null): string[] {
  if (!photos?.length) return [];

  return photos
    .map((photo) => photo.bigSrc ?? photo.middleSrc ?? photo.smallSrc)
    .filter((src): src is string => Boolean(src));
}

export function mapProductDetails(
  item: AdvantShopProductDetails,
  collectionSlug: CollectionSlug,
  properties: AdvantShopProperty[] = []
): ProductDetails {
  const base = mapCatalogProduct(item, collectionSlug, properties);
  const images = resolveProductImages(collectImages(item.photos));
  const primaryImage = images[0] ?? base.img;

  return {
    ...base,
    img: primaryImage,
    slug: getProductSlug({ ...base, urlPath: item.urlPath }),
    description: item.description?.trim() || item.briefDescription?.trim(),
    briefDescription: item.briefDescription?.trim(),
    images: images.length ? images : primaryImage ? [primaryImage] : [],
  };
}
