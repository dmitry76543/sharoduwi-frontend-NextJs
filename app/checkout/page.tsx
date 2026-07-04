import type { Metadata } from "next";

import { CheckoutPage } from "@/components/CheckoutPage";
import { buildRootRegionalDuplicateMetadata } from "@/lib/cities";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

export const metadata: Metadata = buildRootRegionalDuplicateMetadata({
  title: "Оформить заказ",
  description:
    "Оформление заказа на гелиевые и воздушные шары с доставкой по Жуковскому и Раменскому району.",
  restPath: "/checkout",
});

export default async function CheckoutRoutePage() {
  const initialProducts = await getCatalogProducts().catch(() => []);

  return (
    <CheckoutPage
      initialProducts={initialProducts}
      initialSource={getCatalogSource()}
    />
  );
}
