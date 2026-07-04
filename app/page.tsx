import type { Metadata } from "next";
import Link from "next/link";

import SitePage from "@/components/SitePage";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/lib/data";
import { buildCityAlternates, getPrimaryCities } from "@/lib/cities";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema, toJsonLdGraph } from "@/lib/seo/schema";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Гелиевые и воздушные шары с доставкой в Жуковском",
    description:
      "ШАРОДУВЫ — гелиевые и воздушные шары, фольгированные цифры и праздничные композиции в Жуковском и Раменском районе. Доставка и самовывоз с 2005 года.",
    path: "/",
  }),
  alternates: buildCityAlternates("/"),
};

export default function Home() {
  const faqSchema = toJsonLdGraph(buildFaqSchema(FAQ_ITEMS));
  const primaryCities = getPrimaryCities();

  return (
    <>
      <JsonLd data={faqSchema} />
      <section className="city-hub-banner">
        <div className="wrap">
          <p>
            <strong>Куда доставить?</strong> Укажите пункт для локальных цен на доставку и актуального каталога:{" "}
            {primaryCities.map((city, index) => (
              <span key={city.slug}>
                {index > 0 ? " · " : ""}
                <Link href={`/${city.slug}/`}>{city.name}</Link>
              </span>
            ))}{" "}
            · <Link href="/cities">все пункты доставки</Link>
          </p>
        </div>
      </section>
      <SitePage />
    </>
  );
}
