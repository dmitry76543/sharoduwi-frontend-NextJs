import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SearchPage } from "@/components/SearchPage";
import {
  buildCityPageMetadata,
  getCityForParams,
} from "@/lib/cities";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) return {};
  return {
    ...buildCityPageMetadata({
      city,
      title: "Поиск по каталогу",
      description: `Поиск гелиевых и воздушных шаров по названию и артикулу — доставка в ${city.namePrepositional}.`,
      restPath: "/search",
    }),
    robots: { index: false, follow: true },
  };
}

export default async function CitySearchPage({ params }: PageProps) {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  const initialProducts = await getCatalogProducts().catch(() => []);

  return (
    <Suspense fallback={null}>
      <SearchPage
        initialProducts={initialProducts}
        initialSource={getCatalogSource()}
      />
    </Suspense>
  );
}
