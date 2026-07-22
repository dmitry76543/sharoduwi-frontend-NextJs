"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import {
  queueScrollAfterMobMenu,
  scrollToSiteSection,
} from "@/lib/mob-menu-scroll";
import { useCity } from "@/context/CityContext";

export const HOW_SECTION_ID = "how";
export const HOW_SECTION_HREF = "/#how";

export function scrollToHowSection(behavior: ScrollBehavior = "smooth") {
  scrollToSiteSection(HOW_SECTION_ID, behavior);
}

interface HowToOrderLinkProps {
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}

export function HowToOrderLink({ children, className, onNavigate }: HowToOrderLinkProps) {
  const pathname = usePathname();
  const { href: cityHref, isHome } = useCity();
  const homeHref = cityHref("/");

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isHome || pathname === "/" || pathname === homeHref) {
      e.preventDefault();
      queueScrollAfterMobMenu(HOW_SECTION_ID);
      const menuWasOpen = document.body.classList.contains("mob-menu-open");
      onNavigate?.();
      if (!menuWasOpen) {
        scrollToSiteSection(HOW_SECTION_ID);
      }
      return;
    }

    onNavigate?.();
  };

  return (
    <Link href={HOW_SECTION_HREF} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
