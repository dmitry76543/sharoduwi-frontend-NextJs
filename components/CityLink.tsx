"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { useCityOptional } from "@/context/CityContext";
import { parseCityFromPathname } from "@/lib/cities";

type CityLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Link с автоматическим префиксом города */
export function CityLink({ href, ...props }: CityLinkProps) {
  const city = useCityOptional();
  const normalized = href.startsWith("/") ? href : `/${href}`;
  const { citySlug: embeddedCity } = parseCityFromPathname(normalized);
  const resolved = embeddedCity ? normalized : city ? city.href(normalized) : normalized;
  return <Link href={resolved} {...props} />;
}
