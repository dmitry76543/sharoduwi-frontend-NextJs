import type { Metadata } from "next";

import { DeliveryPageContent } from "@/components/DeliveryPageContent";
import { InfoPageShell } from "@/components/InfoPageShell";
import { JsonLd } from "@/components/JsonLd";
import { DELIVERY_ZHUKOVSKY } from "@/lib/info-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, toJsonLdGraph } from "@/lib/seo/schema";

const config = DELIVERY_ZHUKOVSKY;

export const metadata: Metadata = buildPageMetadata({
  title: config.title,
  description: config.metaDescription,
  path: config.path,
});

export default function DeliveryZhukovskyPage() {
  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Доставка по Жуковскому", path: config.path },
    ])
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
