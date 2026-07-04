import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogPage } from "@/components/CatalogPage";
import { JsonLd } from "@/components/JsonLd";
import {
  buildCatalogMetadata,
  getCityForParams,
} from "@/lib/cities";
import {
  buildBreadcrumbSchema,
  buildCatalogItemListSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) return {};
  return buildCatalogMetadata(city);
}

export default async function CityCatalogPage({ params }: PageProps) {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  const initialProducts = await getCatalogProducts().catch(() => []);

  const schema = toJsonLdGraph(
    buildBreadcrumbSchema(
      [
        { name: "Главная", path: "/" },
        { name: "Каталог", path: "/catalog" },
      ],
      city
    ),
    buildCatalogItemListSchema(initialProducts, city)
  );

  return (
    <>
      <JsonLd data={schema} />
      <CatalogPage
        initialProducts={initialProducts}
        initialSource={getCatalogSource()}
      />
    </>
  );
}
