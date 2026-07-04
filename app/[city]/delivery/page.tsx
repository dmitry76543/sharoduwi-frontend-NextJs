import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeliveryPageContent } from "@/components/DeliveryPageContent";
import { InfoPageShell } from "@/components/InfoPageShell";
import { JsonLd } from "@/components/JsonLd";
import {
  buildCityPageMetadata,
  getCityForParams,
  getDeliveryConfigForCity,
} from "@/lib/cities";
import { buildBreadcrumbSchema, toJsonLdGraph } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) return {};

  const config = getDeliveryConfigForCity(city);
  return buildCityPageMetadata({
    city,
    restPath: "/delivery",
    title: config.title,
    description: config.metaDescription,
  });
}

export default async function CityDeliveryPage({ params }: PageProps) {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  const config = getDeliveryConfigForCity(city);

  const schema = toJsonLdGraph(
    buildBreadcrumbSchema(
      [
        { name: "Главная", path: "/" },
        { name: "Доставка", path: "/delivery" },
      ],
      city
    )
  );

  return (
    <>
      <JsonLd data={schema} />
      <InfoPageShell>
        <DeliveryPageContent config={config} />
      </InfoPageShell>
    </>
  );
}
