"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider } from "@/context/CityContext";
import { CityLink } from "@/components/CityLink";
import {
  useEscapeKey,
  useHeaderScroll,
} from "@/hooks/useSiteEffects";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Product } from "@/lib/data";
import type { CatalogSource } from "@/lib/client-catalog-cache";
import { productMatchesSearch } from "@/lib/products";
import { Background } from "@/components/Background";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { MobMenu } from "@/components/MobMenu";
import { Toast } from "@/components/Toast";
import { FabContacts } from "@/components/FabContacts";
import { ProductCard } from "@/components/product/ProductCard";
import { formatVariantCount } from "@/lib/plural.ru";

function SiteEffects() {
  const { closeAll, closeMob } = useApp();
  const onEscape = useCallback(() => {
    closeAll();
    closeMob();
  }, [closeAll, closeMob]);

  useHeaderScroll();
  useEscapeKey(onEscape);

  return null;
}

function SearchContent() {
  const isMobile = useMediaQuery("(max-width: 860px)");
  const searchParams = useSearchParams();
  const urlQ = (searchParams.get("q") ?? "").trim();
  const { products, catalogLoading, searchQuery, setSearchQuery } = useApp();

  // useSearchParams иногда отстаёт от window.location при первом client-navigation
  const q = useMemo(() => {
    if (urlQ) return urlQ;
    if (typeof window !== "undefined") {
      const fromLocation = (
        new URLSearchParams(window.location.search).get("q") ?? ""
      ).trim();
      if (fromLocation) return fromLocation;
    }
    return searchQuery.trim();
  }, [urlQ, searchQuery]);

  useEffect(() => {
    if (urlQ) setSearchQuery(urlQ);
  }, [urlQ, setSearchQuery]);

  const list = useMemo(() => {
    if (!q) return [];
    return products.filter((product) => productMatchesSearch(product, q));
  }, [products, q]);

  return (
    <div className="search-page-shell catalog-page-shell">
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
            <CityLink href="/catalog">Каталог</CityLink>
            <span aria-hidden="true">/</span>
            <span>Поиск</span>
          </nav>
        </div>
      </section>
      <section className="sec" id="shop">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="sec-tag">
              <span className="dot" /> Поиск
            </div>
            <h2>
              {q ? (
                list.length ? (
                  <>
                    <span className="search-query-line">«{q}»</span>
                    <span className="search-count-line">
                      · {formatVariantCount(list.length)}
                    </span>
                  </>
                ) : (
                  `«${q}»`
                )
              ) : (
                "Поиск по каталогу"
              )}
            </h2>
            <p>
              {q
                ? "Результаты по названию и артикулу. Уточните запрос в шапке или откройте каталог."
                : "Введите название или артикул в поиске в шапке."}
            </p>
          </div>
          <div className="products" id="products">
            {catalogLoading && !list.length && q ? (
              <div className="empty">Шары на подлёте...</div>
            ) : !q ? (
              <div className="empty">Введите запрос в поиске в шапке.</div>
            ) : !list.length ? (
              <div className="empty">Этот товар не найден.</div>
            ) : (
              list.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
          <div className="shop-collection-filter reveal" style={{ marginTop: 24 }}>
            <CityLink href="/catalog" className="chip">
              ← Полный каталог
            </CityLink>
          </div>
        </div>
      </section>
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
    </div>
  );
}

export function SearchPage({
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
        <SearchContent />
      </AppProvider>
    </MaybeCityProvider>
  );
}
