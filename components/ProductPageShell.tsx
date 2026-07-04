"use client";

import { useCallback } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider } from "@/context/CityContext";
import {
  useEscapeKey,
  useHeaderScroll,
  useScrollProgressFallback,
  useScrollReveal,
} from "@/hooks/useSiteEffects";
import { useConfettiCursor } from "@/hooks/useConfettiCursor";
import type { Product, ProductDetails } from "@/lib/data";
import type { CatalogSource } from "@/lib/client-catalog-cache";
import { Background } from "@/components/Background";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { MobMenu } from "@/components/MobMenu";
import { Toast } from "@/components/Toast";
import { FabContacts } from "@/components/FabContacts";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ConfettiCursor } from "@/components/ConfettiCursor";
import { ProductPageContent } from "@/components/product/ProductPageContent";

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

function ProductPageView({
  product,
  relatedProducts,
}: {
  product: ProductDetails;
  relatedProducts: Product[];
}) {
  return (
    <>
      <SiteEffects />
      <ScrollProgress />
      <Background />
      <ConfettiCursor />
      <TopBar />
      <Header />
      <a id="top" />
      <ProductPageContent product={product} relatedProducts={relatedProducts} />
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
    </>
  );
}

export function ProductPageShell({
  product,
  relatedProducts,
  initialProducts = [],
  initialSource = "static",
}: {
  product: ProductDetails;
  relatedProducts: Product[];
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
        <ProductPageView product={product} relatedProducts={relatedProducts} />
      </AppProvider>
    </MaybeCityProvider>
  );
}
