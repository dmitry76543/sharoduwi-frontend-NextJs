import type { Metadata } from "next";

import { CatalogPage } from "@/components/CatalogPage";
import { JsonLd } from "@/components/JsonLd";
import { buildRootRegionalDuplicateMetadata } from "@/lib/cities";
import {
  buildBreadcrumbSchema,
  buildCatalogItemListSchema,
  toJsonLdGraph,
} from "@/lib/seo/schema";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

export const metadata: Metadata = buildRootRegionalDuplicateMetadata({
  title: "Каталог гелиевых и воздушных шаров",
  description:
    "Полный каталог гелиевых и воздушных шаров, композиций и наборов в Жуковском и Раменском районе. Цены, фото и доставка к торжеству.",
  restPath: "/catalog",
});

export default async function CatalogRoutePage() {
  const initialProducts = await getCatalogProducts().catch(() => []);

  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" },
    ]),
    buildCatalogItemListSchema(initialProducts)
  );

  return (
    <>
      <JsonLd data={schema} />
      <CatalogPage
        initialProducts={initialProducts}
        initialSource={getCatalogSource()}
      />
    </>
  );
}
