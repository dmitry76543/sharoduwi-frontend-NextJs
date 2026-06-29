import type { Metadata } from "next";

import { CheckoutPage } from "@/components/CheckoutPage";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Оформить заказ",
    description:
      "Оформление заказа на гелиевые и воздушные шары с доставкой по Жуковскому и Раменскому району.",
    path: "/checkout",
  }),
  robots: {
    index: false,
    follow: true,
  },
};

export default async function CheckoutRoutePage() {
  const initialProducts = await getCatalogProducts().catch(() => []);

  return (
    <CheckoutPage
      initialProducts={initialProducts}
      initialSource={getCatalogSource()}
    />
  );
}
