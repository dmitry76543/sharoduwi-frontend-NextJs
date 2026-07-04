import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/CategoryPage";
import { JsonLd } from "@/components/JsonLd";
import { COLLECTIONS, getCollectionBySlug } from "@/lib/data";
import { CITY_SLUGS } from "@/lib/cities";
import { getCollectionImageSrc } from "@/lib/collection-images";
import {
  buildCollectionMetadata,
  getCityForParams,
} from "@/lib/cities";
import { isValidCollectionSlug, type CollectionSlug } from "@/lib/products";
import {
  buildBreadcrumbSchema,
  buildCollectionItemListSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ city: string; slug: string }>;
};

export function generateStaticParams() {
  return COLLECTIONS.flatMap((collection) =>
    CITY_SLUGS.map((city) => ({
      city,
      slug: collection.slug,
    }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: cityParam, slug } = await params;
  const city = getCityForParams(cityParam);
  const collection = isValidCollectionSlug(slug) ? getCollectionBySlug(slug) : undefined;

  if (!city || !collection) return {};

  return buildCollectionMetadata(city, collection, getCollectionImageSrc(collection.slug));
}

export default async function CityCategoryPage({ params }: PageProps) {
  const { city: cityParam, slug } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  if (!isValidCollectionSlug(slug)) notFound();

  const collectionSlug = slug as CollectionSlug;
  const collection = getCollectionBySlug(collectionSlug)!;
  const initialProducts = await getCatalogProducts({
    collection: collectionSlug,
  }).catch(() => []);

  const schema = toJsonLdGraph(
    buildBreadcrumbSchema(
      [
        { name: "Главная", path: "/" },
        { name: "Коллекции", path: "/#collections" },
        {
          name: collection.name,
          path: `/categories/${collection.slug}`,
        },
      ],
      city
    ),
    buildCollectionItemListSchema(collection.name, collectionSlug, initialProducts, city)
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
