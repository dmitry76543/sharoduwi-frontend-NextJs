"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import { useCity } from "@/context/CityContext";
import {
  queueScrollAfterMobMenu,
  scrollToSiteSection,
} from "@/lib/mob-menu-scroll";

export { scrollToSiteSection };

/** @deprecated Используйте queueScrollAfterMobMenu + closeMob; скролл делает MobMenu. */
export function scrollToSiteSectionAfterMenuClose(
  sectionId: string,
  onNavigate?: () => void
) {
  queueScrollAfterMobMenu(sectionId);
  onNavigate?.();
  if (!document.body.classList.contains("mob-menu-open")) {
    scrollToSiteSection(sectionId);
  }
}

interface SiteSectionLinkProps {
  sectionId: string;
  href?: string;
  /** Прокрутка к блоку на текущей странице (футер: доставка, контакты) */
  scrollOnAnyPage?: boolean;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}

function navigateToSection(
  sectionId: string,
  onNavigate?: () => void
) {
  queueScrollAfterMobMenu(sectionId);
  const menuWasOpen = document.body.classList.contains("mob-menu-open");
  onNavigate?.();
  if (!menuWasOpen) {
    scrollToSiteSection(sectionId);
  }
}

export function SiteSectionLink({
  sectionId,
  href,
  scrollOnAnyPage = false,
  children,
  className,
  onNavigate,
}: SiteSectionLinkProps) {
  const pathname = usePathname();
  const { href: cityHref, isHome } = useCity();
  const homeHref = cityHref("/");
  const target = href ?? (scrollOnAnyPage ? `#${sectionId}` : `${homeHref}#${sectionId}`);
  const onHome = isHome || pathname === "/" || pathname === homeHref;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (scrollOnAnyPage && document.getElementById(sectionId)) {
      e.preventDefault();
      navigateToSection(sectionId, onNavigate);
      return;
    }

    if (onHome) {
      e.preventDefault();
      navigateToSection(sectionId, onNavigate);
      return;
    }

    onNavigate?.();
  };

  return (
    <Link href={target} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
