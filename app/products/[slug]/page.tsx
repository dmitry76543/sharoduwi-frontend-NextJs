import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { ProductPageShell } from "@/components/ProductPageShell";
import { buildRootRegionalDuplicateMetadata } from "@/lib/cities";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getProductSlug } from "@/lib/product-slug";
import {
  buildBreadcrumbSchema,
  buildProductSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";
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
    return buildPageMetadata({
      title: "Товар не найден",
      path: `/products/${slug}`,
    });
  }

  const description =
    product.briefDescription?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    `${product.name} из коллекции «${product.collection}». Гелиевые и воздушные шары в Жуковском и Раменском районе.`;

  const image = product.images[0] ?? product.img;

  return buildRootRegionalDuplicateMetadata({
    title: product.name,
    description,
    restPath: `/products/${getProductSlug(product)}`,
    image,
  });
}

export default async function ProductRoutePage({ params }: ProductRouteProps) {
  const { slug } = await params;
  const product = await getProductDetails(slug);

  if (!product) notFound();

  const [relatedProducts, catalogProducts] = await Promise.all([
    getRelatedProducts(product),
    getCatalogProducts(),
  ]);

  const productSlug = getProductSlug(product);
  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" },
      { name: product.collection, path: `/categories/${product.collectionSlug}` },
      { name: product.name, path: `/products/${productSlug}` },
    ]),
    buildProductSchema(product)
  );

  return (
    <>
      <JsonLd data={schema} />
      <ProductPageShell
        product={product}
        relatedProducts={relatedProducts}
        initialProducts={catalogProducts}
        initialSource={getCatalogSource()}
      />
    </>
  );
}
