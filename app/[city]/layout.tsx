import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CityProvider } from "@/context/CityContext";
import { CITY_SLUGS, getCityBySlug, type CityPublic } from "@/lib/cities";

type CityLayoutProps = {
  children: ReactNode;
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return CITY_SLUGS.map((city) => ({ city }));
}

export default async function CityLayout({ children, params }: CityLayoutProps) {
  const { city: cityParam } = await params;
  const city = getCityBySlug(cityParam);

  if (!city) notFound();

  return <CityLayoutInner city={city}>{children}</CityLayoutInner>;
}

function CityLayoutInner({ city, children }: { city: CityPublic; children: ReactNode }) {
  return <CityProvider city={city}>{children}</CityProvider>;
}
