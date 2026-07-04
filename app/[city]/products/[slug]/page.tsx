import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { ProductPageShell } from "@/components/ProductPageShell";
import { getProductSlug } from "@/lib/product-slug";
import {
  buildProductMetadata,
  getCityForParams,
} from "@/lib/cities";
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
  params: Promise<{ city: string; slug: string }>;
};

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { city: cityParam, slug } = await params;
  const city = getCityForParams(cityParam);
  const product = await getProductDetails(slug);

  if (!city || !product) return {};

  return buildProductMetadata(city, {
    ...product,
    slug: getProductSlug(product),
  });
}

export default async function CityProductPage({ params }: ProductRouteProps) {
  const { city: cityParam, slug } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  const product = await getProductDetails(slug);
  if (!product) notFound();

  const [relatedProducts, catalogProducts] = await Promise.all([
    getRelatedProducts(product),
    getCatalogProducts(),
  ]);

  const productSlug = getProductSlug(product);
  const schema = toJsonLdGraph(
    buildBreadcrumbSchema(
      [
        { name: "Главная", path: "/" },
        { name: "Каталог", path: "/catalog" },
        {
          name: product.collection,
          path: `/categories/${product.collectionSlug}`,
        },
        { name: product.name, path: `/products/${productSlug}` },
      ],
      city
    ),
    buildProductSchema(product, city)
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
