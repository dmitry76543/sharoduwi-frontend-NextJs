import type { Metadata } from "next";

import SitePage from "@/components/SitePage";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/lib/data";
import { buildCityAlternates } from "@/lib/cities";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema, toJsonLdGraph } from "@/lib/seo/schema";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Гелиевые и воздушные шары с доставкой в Жуковском",
    description:
      "ШАРОДУВЫ — гелиевые и воздушные шары и шарики, фольгированные цифры и праздничные композиции с доставкой в Жуковский, Раменское, Люберцы, Балашиху и районы, Котельники, Лыткарино, Москву. Самовывоз. Работаем с 2005 года.",
    path: "/",
  }),
  alternates: buildCityAlternates("/"),
};

export default function Home() {
  const faqSchema = toJsonLdGraph(buildFaqSchema(FAQ_ITEMS));

  return (
    <>
      <JsonLd data={faqSchema} />
      <SitePage />
    </>
  );
}
