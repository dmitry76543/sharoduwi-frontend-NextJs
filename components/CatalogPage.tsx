"use client";

import { useCallback } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider } from "@/context/CityContext";
import { CityLink } from "@/components/CityLink";
import {
  useEscapeKey,
  useHeaderScroll,
  useCatalogHashScroll,
} from "@/hooks/useSiteEffects";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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

function SiteEffects() {
  const { closeAll, closeMob } = useApp();
  const onEscape = useCallback(() => {
    closeAll();
    closeMob();
  }, [closeAll, closeMob]);

  useCatalogHashScroll();
  useHeaderScroll();
  useEscapeKey(onEscape);

  return null;
}

function CatalogContent() {
  const isMobile = useMediaQuery("(max-width: 860px)");

  return (
    <div className="catalog-page-shell">
      <SiteEffects />
      <Background lite={isMobile} />
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
        description="Полный каталог гелиевых и воздушных шаров, композиций и наборов — с фильтрами по типу. Поиск — в шапке."
      />
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
    </div>
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
