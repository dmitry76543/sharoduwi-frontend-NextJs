import type { Product, ProductDetails } from "@/lib/data";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[«»"'`]/g, "")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeProductSlug(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

export function getProductSlug(
  product: Pick<Product, "id" | "name" | "urlPath">
): string {
  if (product.urlPath) {
    return normalizeProductSlug(product.urlPath);
  }

  const nameSlug = slugify(product.name);
  return nameSlug ? `${nameSlug}-${product.id}` : String(product.id);
}

export function findProductBySlug(
  products: Product[],
  slug: string
): Product | undefined {
  const normalized = normalizeProductSlug(slug);

  return products.find((product) => {
    const productSlug = getProductSlug(product);
    const urlPath = product.urlPath
      ? normalizeProductSlug(product.urlPath)
      : undefined;

    return (
      productSlug === normalized ||
      urlPath === normalized ||
      String(product.id) === normalized
    );
  });
}

export function buildStaticProductDetails(product: Product): ProductDetails {
  const images = product.img ? [product.img] : [];

  return {
    ...product,
    slug: getProductSlug(product),
    description: `${product.name} из коллекции «${product.collection}». Собираем вручную под ваш повод, надуваем гелием при вас. Доставка по Жуковскому и Раменскому району или самовывоз из двух магазинов в Жуковском.`,
    images,
  };
}
