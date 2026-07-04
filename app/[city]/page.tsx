import type { Metadata } from "next";

import SitePage from "@/components/SitePage";
import { JsonLd } from "@/components/JsonLd";
import {
  buildCityRootMetadata,
  getCityFaqItems,
  getCityForParams,
  cityPath,
} from "@/lib/cities";
import { buildFaqSchema, buildLocalBusinessSchema, toJsonLdGraph } from "@/lib/seo/schema";

type CityHomeProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: CityHomeProps): Promise<Metadata> {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) return {};
  return buildCityRootMetadata(city);
}

export default async function CityHomePage({ params }: CityHomeProps) {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam)!;
  const faqItems = getCityFaqItems(city);

  const schema = toJsonLdGraph(
    buildLocalBusinessSchema(city),
    buildFaqSchema(faqItems, cityPath(city.slug, "/"))
  );

  return (
    <>
      <JsonLd data={schema} />
      <SitePage faqItems={faqItems} />
    </>
  );
}
