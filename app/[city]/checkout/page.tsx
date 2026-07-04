import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutPage } from "@/components/CheckoutPage";
import { buildCityPageMetadata, getCityForParams } from "@/lib/cities";
import { getCatalogProducts, getCatalogSource } from "@/lib/products-service";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) return {};

  return {
    ...buildCityPageMetadata({
      city,
      restPath: "/checkout",
      title: "Оформить заказ",
      description: `Оформление заказа на гелиевые и воздушные шары с доставкой в ${city.namePrepositional}.`,
    }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function CityCheckoutPage({ params }: PageProps) {
  const { city: cityParam } = await params;
  const city = getCityForParams(cityParam);
  if (!city) notFound();

  const initialProducts = await getCatalogProducts().catch(() => []);

  return (
    <CheckoutPage
      initialProducts={initialProducts}
      initialSource={getCatalogSource()}
    />
  );
}
