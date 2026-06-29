import type { Metadata } from "next";

import { AboutPageContent } from "@/components/AboutPageContent";
import { InfoPageShell } from "@/components/InfoPageShell";
import { JsonLd } from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, toJsonLdGraph } from "@/lib/seo/schema";

export const metadata: Metadata = buildPageMetadata({
  title: "О компании",
  description:
    "ШАРОДУВЫ — магазин гелиевых и воздушных шаров в Жуковском с 2005 года. Два шоурума, ручная сборка композиций и доставка по Раменскому району.",
  path: "/about",
});

export default function AboutPage() {
  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "О компании", path: "/about" },
    ])
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
