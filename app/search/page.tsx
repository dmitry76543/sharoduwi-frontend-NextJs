import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchPage } from "@/components/SearchPage";
import { buildRootRegionalDuplicateMetadata } from "@/lib/cities";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

export const metadata: Metadata = {
  ...buildRootRegionalDuplicateMetadata({
    title: "Поиск по каталогу",
    description:
      "Поиск гелиевых и воздушных шаров по названию и артикулу в каталоге ШАРОДУВЫ.",
    restPath: "/search",
  }),
  robots: { index: false, follow: true },
};

export default async function SearchRoutePage() {
  const initialProducts = await getCatalogProducts().catch(() => []);

  return (
    <Suspense fallback={null}>
      <SearchPage
        initialProducts={initialProducts}
        initialSource={getCatalogSource()}
      />
    </Suspense>
  );
}
