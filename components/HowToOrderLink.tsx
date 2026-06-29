"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import { scrollToSiteSection } from "@/components/SiteSectionLink";

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

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (pathname === "/") {
      e.preventDefault();
      scrollToHowSection();
    }
  };

  return (
    <Link href={HOW_SECTION_HREF} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
