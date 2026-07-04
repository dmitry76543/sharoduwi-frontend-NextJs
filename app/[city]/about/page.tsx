import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutPageContent } from "@/components/AboutPageContent";
import { InfoPageShell } from "@/components/InfoPageShell";
import { JsonLd } from "@/components/JsonLd";
import { buildCityPageMetadata, getCityForParams } from "@/lib/cities";
import { buildBreadcrumbSchema, toJsonLdGraph } from "@/lib/seo/schema";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) return {};

  return buildCityPageMetadata({
    city,
    restPath: "/about",
    title: `О компании — шары в ${city.namePrepositional}`,
    description: `ШАРОДУВЫ — магазин гелиевых и воздушных шаров с доставкой в ${city.namePrepositional}. С 2005 года, ручная сборка композиций.`,
  });
}

export default async function CityAboutPage({ params }: PageProps) {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  const schema = toJsonLdGraph(
    buildBreadcrumbSchema(
      [
        { name: "Главная", path: "/" },
        { name: "О компании", path: "/about" },
      ],
      city
    )
  );

  return (
    <>
      <JsonLd data={schema} />
      <InfoPageShell>
        <AboutPageContent />
      </InfoPageShell>
    </>
  );
}
