"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider } from "@/context/CityContext";
import { CityLink } from "@/components/CityLink";
import {
  useEscapeKey,
  useHeaderScroll,
  useCatalogHashScroll,
  useScrollProgressFallback,
  useScrollReveal,
} from "@/hooks/useSiteEffects";
import {
  useConfettiCursor,
} from "@/hooks/useConfettiCursor";
import type { Product } from "@/lib/data";
import type { CatalogSource } from "@/lib/client-catalog-cache";
import { Background } from "@/components/Background";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Shop } from "@/components/Shop";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { MobMenu } from "@/components/MobMenu";
import { Toast } from "@/components/Toast";
import { FabContacts } from "@/components/FabContacts";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ConfettiCursor } from "@/components/ConfettiCursor";

function SiteEffects() {
  const { closeAll, closeMob } = useApp();
  const onEscape = useCallback(() => {
    closeAll();
    closeMob();
  }, [closeAll, closeMob]);

  useScrollReveal();
  useCatalogHashScroll();
  useHeaderScroll();
  useScrollProgressFallback();
  useConfettiCursor();
  useEscapeKey(onEscape);

  return null;
}

function CatalogContent() {
  return (
    <>
      <SiteEffects />
      <ScrollProgress />
      <Background />
      <ConfettiCursor />
      <TopBar />
      <Header />
      <a id="top" />
      <section className="sec category-page">
        <div className="wrap">
          <nav className="category-breadcrumb reveal" aria-label="Навигация">
            <CityLink href="/">Главная</CityLink>
            <span aria-hidden="true">/</span>
            <span>Каталог</span>
          </nav>
        </div>
      </section>
      <Shop
        heading="Гелиевые и воздушные шары"
        description="Полный каталог гелиевых и воздушных шаров, композиций и наборов — с фильтрами по типу и поиском."
      />
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
    </>
  );
}

export function CatalogPage({
  initialProducts = [],
  initialSource = "static",
}: {
  initialProducts?: Product[];
  initialSource?: CatalogSource;
}) {
  const initialCatalog =
    initialProducts.length > 0
      ? { products: initialProducts, source: initialSource }
      : undefined;

  return (
    <MaybeCityProvider>
      <AppProvider initialCatalog={initialCatalog}>
        <CatalogContent />
      </AppProvider>
    </MaybeCityProvider>
  );
}
