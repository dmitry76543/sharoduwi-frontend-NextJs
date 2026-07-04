"use client";

import { useCallback } from "react";
import Link from "next/link";
import { CityLink } from "@/components/CityLink";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider } from "@/context/CityContext";
import {
  useEscapeKey,
  useHeaderScroll,
  useScrollProgressFallback,
  useScrollReveal,
} from "@/hooks/useSiteEffects";
import {
  useConfettiCursor,
} from "@/hooks/useConfettiCursor";
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
import { getCollectionBySlug } from "@/lib/data";
import type { CollectionSlug } from "@/lib/products";
import type { CatalogSource } from "@/lib/client-catalog-cache";
import type { Product } from "@/lib/data";

function SiteEffects() {
  const { closeAll, closeMob } = useApp();
  const onEscape = useCallback(() => {
    closeAll();
    closeMob();
  }, [closeAll, closeMob]);

  useScrollReveal();
  useHeaderScroll();
  useScrollProgressFallback();
  useConfettiCursor();
  useEscapeKey(onEscape);

  return null;
}

function CategoryContent({ slug }: { slug: CollectionSlug }) {
  const collection = getCollectionBySlug(slug)!;

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
            <CityLink href="/#collections">Коллекции</CityLink>
            <span aria-hidden="true">/</span>
            <span>{collection.name}</span>
          </nav>
        </div>
      </section>
      <Shop
        pageCollection={slug}
        heading={collection.name}
        description={collection.sub}
      />
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
    </>
  );
}

export function CategoryPage({
  slug,
  initialProducts = [],
  initialSource = "static",
}: {
  slug: CollectionSlug;
  initialProducts?: Product[];
  initialSource?: CatalogSource;
}) {
  const initialCatalog =
    initialProducts.length > 0
      ? { products: initialProducts, source: initialSource }
      : undefined;

  return (
    <MaybeCityProvider>
      <AppProvider catalogCollection={slug} initialCatalog={initialCatalog}>
        <CategoryContent slug={slug} />
      </AppProvider>
    </MaybeCityProvider>
  );
}
