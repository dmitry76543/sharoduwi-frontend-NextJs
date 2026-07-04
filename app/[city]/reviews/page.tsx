import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InfoPageShell } from "@/components/InfoPageShell";
import { JsonLd } from "@/components/JsonLd";
import { ReviewsPageContent } from "@/components/ReviewsPageContent";
import { REVIEWS } from "@/lib/data";
import { buildCityPageMetadata, cityPath, getCityForParams } from "@/lib/cities";
import {
  buildBreadcrumbSchema,
  buildReviewsPageSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) return {};

  return buildCityPageMetadata({
    city,
    restPath: "/reviews",
    title: `Отзывы о гелиевых и воздушных шарах${city ? ` в ${city.namePrepositional}` : ""}`,
    description: `Отзывы о магазине ШАРОДУВЫ: гелиевые и воздушные шары, доставка в ${city.namePrepositional}. Реальные отзывы с Яндекс.Карт.`,
  });
}

export default async function CityReviewsPage({ params }: PageProps) {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  const schema = toJsonLdGraph(
    buildBreadcrumbSchema(
      [
        { name: "Главная", path: "/" },
        { name: "Отзывы", path: "/reviews" },
      ],
      city
    ),
    buildReviewsPageSchema(REVIEWS, cityPath(city.slug, "/reviews"))
  );

  return (
    <>
      <JsonLd data={schema} />
      <InfoPageShell>
        <ReviewsPageContent />
      </InfoPageShell>
    </>
  );
}
