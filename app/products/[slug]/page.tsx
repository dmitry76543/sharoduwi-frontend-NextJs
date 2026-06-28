import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPageShell } from "@/components/ProductPageShell";
import {
  getCatalogProducts,
  getCatalogSource,
  getProductDetails,
  getRelatedProducts,
} from "@/lib/products-service";

export const revalidate = 300;

type ProductRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetails(slug);

  if (!product) {
    return {
      title: "Товар не найден — ШАРОДУВЫ",
    };
  }

  return {
    title: `${product.name} — ШАРОДУВЫ`,
    description:
      product.description ??
      `${product.name} из коллекции «${product.collection}». Гелиевые шары в Жуковском и Раменском районе.`,
    openGraph: product.img
      ? {
          images: [{ url: product.img }],
        }
      : undefined,
  };
}

export default async function ProductRoutePage({ params }: ProductRouteProps) {
  const { slug } = await params;
  const product = await getProductDetails(slug);

  if (!product) notFound();

  const [relatedProducts, catalogProducts] = await Promise.all([
    getRelatedProducts(product),
    getCatalogProducts(),
  ]);

  return (
    <ProductPageShell
      product={product}
      relatedProducts={relatedProducts}
      initialProducts={catalogProducts}
      initialSource={getCatalogSource()}
    />
  );
}
