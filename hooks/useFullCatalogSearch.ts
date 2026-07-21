"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import { PRODUCTS } from "@/lib/data";
import {
  getClientCatalogCacheKey,
  readClientCatalogCache,
  writeClientCatalogCache,
  type CatalogSource,
} from "@/lib/client-catalog-cache";

/** Полный каталог для глобального поиска (не зависит от страницы коллекции). */
export function useFullCatalogSearch(enabled = true): {
  products: Product[];
  loading: boolean;
} {
  const cacheKey = getClientCatalogCacheKey();
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return PRODUCTS;
    return readClientCatalogCache(cacheKey)?.products ?? PRODUCTS;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !readClientCatalogCache(cacheKey)?.products.length;
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const cached = readClientCatalogCache(cacheKey);
    if (cached?.products.length) {
      setProducts(cached.products);
      setLoading(false);
    }

    fetch("/api/catalog")
      .then((response) => response.json())
      .then((data: { products?: Product[]; source?: CatalogSource }) => {
        if (cancelled || !Array.isArray(data.products)) return;
        const list = data.products.length ? data.products : PRODUCTS;
        const source: CatalogSource =
          data.source === "advantshop" ? "advantshop" : "static";
        setProducts(list);
        writeClientCatalogCache(cacheKey, list, source);
      })
      .catch(() => {
        if (!cancelled && !cached?.products.length) {
          setProducts(PRODUCTS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, enabled]);

  return { products, loading };
}
