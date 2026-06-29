"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
  scheduleQualifiedVisitCheck,
  trackAlmostOrder,
  trackSessionPage,
} from "@/lib/metrika/session";
import { trackCatalogSection, trackOutboundLink, trackPagePath } from "@/lib/metrika/track";

export function MetrikaTracker() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    scheduleQualifiedVisitCheck();
  }, []);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    trackAlmostOrder(prevPath, pathname);
    trackSessionPage(pathname);
    trackPagePath(pathname);
    prevPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.pathname === "/" && window.location.hash === "#shop") {
        trackCatalogSection();
      }
    };

    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      trackOutboundLink(href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
