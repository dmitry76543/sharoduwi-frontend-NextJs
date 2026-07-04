import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/CategoryPage";
import { JsonLd } from "@/components/JsonLd";
import { COLLECTIONS, getCollectionBySlug } from "@/lib/data";
import { getCollectionImageSrc } from "@/lib/collection-images";
import { isValidCollectionSlug, type CollectionSlug } from "@/lib/products";
import { buildRootRegionalDuplicateMetadata } from "@/lib/cities";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildCollectionItemListSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = isValidCollectionSlug(slug) ? getCollectionBySlug(slug) : undefined;

  if (!collection) {
    return buildPageMetadata({
      title: "Коллекция не найдена",
      path: `/categories/${slug}`,
    });
  }

  return buildRootRegionalDuplicateMetadata({
    title: `${collection.name} в Жуковском`,
    description: `${collection.name}: ${collection.sub}. Гелиевые и воздушные шары с доставкой по Жуковскому и Раменскому району.`,
    restPath: `/categories/${collection.slug}`,
    image: getCollectionImageSrc(collection.slug),
  });
}

export default async function CollectionRoutePage({ params }: PageProps) {
  const { slug } = await params;

  if (!isValidCollectionSlug(slug)) {
    notFound();
  }

  const collectionSlug = slug as CollectionSlug;
  const collection = getCollectionBySlug(collectionSlug)!;
  const initialProducts = await getCatalogProducts({
    collection: collectionSlug,
  }).catch(() => []);

  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Коллекции", path: "/#collections" },
      { name: collection.name, path: `/categories/${collection.slug}` },
    ]),
    buildCollectionItemListSchema(collection.name, collectionSlug, initialProducts)
  );

  return (
    <>
      <JsonLd data={schema} />
      <CategoryPage
        slug={collectionSlug}
        initialProducts={initialProducts}
        initialSource={getCatalogSource()}
      />
    </>
  );
}
