import type { Metadata } from "next";

import SitePage from "@/components/SitePage";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema, toJsonLdGraph } from "@/lib/seo/schema";

export const metadata: Metadata = buildPageMetadata({
  title: "Гелиевые и воздушные шары с доставкой в Жуковском",
  description:
    "ШАРОДУВЫ — гелиевые и воздушные шары, фольгированные цифры и праздничные композиции в Жуковском и Раменском районе. Доставка и самовывоз с 2005 года.",
  path: "/",
});

export default function Home() {
  const faqSchema = toJsonLdGraph(buildFaqSchema(FAQ_ITEMS));

  return (
    <>
      <JsonLd data={faqSchema} />
      <SitePage />
    </>
  );
}
