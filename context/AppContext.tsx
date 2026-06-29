"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product } from "@/lib/data";
import {
  getClientCatalogCacheKey,
  readClientCatalogCache,
  writeClientCatalogCache,
  type CatalogSource,
} from "@/lib/client-catalog-cache";
import type { CollectionSlug, TagFilter } from "@/lib/products";
import { persistCart, readStoredCart } from "@/lib/cart-storage";
import { persistFav, readStoredFav, type FavMap } from "@/lib/fav-storage";
import { trackAddToCart, trackFabOpen } from "@/lib/metrika/track";

type Cart = Record<number, number>;
type Fav = FavMap;

interface InitialCatalog {
  products: Product[];
  source: CatalogSource;
}

interface AppContextValue {
  cart: Cart;
  fav: Fav;
  favOnly: boolean;
  activeTag: TagFilter;
  activeCollection: CollectionSlug | null;
  searchQuery: string;
  cartOpen: boolean;
  mobOpen: boolean;
  fabOpen: boolean;
  toastName: string;
  toastVisible: boolean;
  cartCount: number;
  favCount: number;
  products: Product[];
  catalogSource: CatalogSource;
  catalogLoading: boolean;
  setSearchQuery: (q: string) => void;
  setActiveTag: (tag: TagFilter) => void;
  setActiveCollection: (slug: CollectionSlug | null) => void;
  setFavOnly: (v: boolean) => void;
  toggleFav: (id: number) => void;
  clearFavorites: () => void;
  addToCart: (id: number, x?: number, y?: number) => void;
  incrementCart: (id: number) => void;
  decrementCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openMob: () => void;
  closeMob: () => void;
  openContact: () => void;
  closeContact: () => void;
  setFabOpen: (open: boolean) => void;
  closeAll: () => void;
  getCartQty: (id: number) => number;
  isFav: (id: number) => boolean;
  getProduct: (id: number) => Product | undefined;
  burstRef: React.MutableRefObject<((x: number, y: number, count?: number) => void) | null>;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
  /** Загружать только товары выбранной коллекции (страница категории) */
  catalogCollection?: CollectionSlug;
  /** Данные каталога с сервера (SSR, кэш 5 мин) */
  initialCatalog?: InitialCatalog;
}

function getStaticFallback(collection?: CollectionSlug): Product[] {
  return collection
    ? PRODUCTS.filter((product) => product.collectionSlug === collection)
    : PRODUCTS;
}

function readInitialFavOnly(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("fav") === "1";
}

export function AppProvider({
  children,
  catalogCollection,
  initialCatalog,
}: AppProviderProps) {
  const cacheKey = getClientCatalogCacheKey(catalogCollection);
  const [cart, setCart] = useState<Cart>(() => readStoredCart());
  const [cartHydrated, setCartHydrated] = useState(false);
  const [fav, setFav] = useState<Fav>(() => readStoredFav());
  const [favHydrated, setFavHydrated] = useState(false);
  const [favOnly, setFavOnly] = useState(() => readInitialFavOnly());
  const [activeTag, setActiveTag] = useState<TagFilter>("Все");
  const [activeCollection, setActiveCollection] = useState<CollectionSlug | null>(
    catalogCollection ?? null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [fabOpen, setFabOpenState] = useState(false);
  const [toastName, setToastName] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialCatalog?.products.length) return initialCatalog.products;
    if (typeof window !== "undefined") {
      const cached = readClientCatalogCache(cacheKey);
      if (cached?.products.length) return cached.products;
    }
    return getStaticFallback(catalogCollection);
  });
  const [catalogSource, setCatalogSource] = useState<CatalogSource>(
    () =>
      initialCatalog?.source ??
      (typeof window !== "undefined"
        ? readClientCatalogCache(cacheKey)?.source
        : undefined) ??
      "static"
  );
  const [catalogLoading, setCatalogLoading] = useState(() => {
    if (initialCatalog?.products.length) return false;
    if (typeof window !== "undefined" && readClientCatalogCache(cacheKey)) {
      return false;
    }
    return true;
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstRef = useRef<((x: number, y: number, count?: number) => void) | null>(null);

  useEffect(() => {
    setCart(readStoredCart());
    setCartHydrated(true);
    setFav(readStoredFav());
    setFavHydrated(true);

    if (readInitialFavOnly()) {
      setFavOnly(true);
    }
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    persistCart(cart);
  }, [cart, cartHydrated]);

  useEffect(() => {
    if (!favHydrated) return;
    persistFav(fav);
  }, [fav, favHydrated]);

  useEffect(() => {
    let cancelled = false;
    const cached = readClientCatalogCache(cacheKey);
    const hasWarmData = Boolean(initialCatalog?.products.length || cached?.products.length);

    if (!hasWarmData) {
      setCatalogLoading(true);
    }

    const catalogUrl = catalogCollection
      ? `/api/catalog?collection=${encodeURIComponent(catalogCollection)}`
      : "/api/catalog";

    fetch(catalogUrl)
      .then((response) => response.json())
      .then((data: { products?: Product[]; source?: CatalogSource }) => {
        if (cancelled) return;
        if (Array.isArray(data.products)) {
          const list = data.products.length
            ? data.products
            : getStaticFallback(catalogCollection);
          const source: CatalogSource =
            data.source === "advantshop" ? "advantshop" : "static";
          setProducts(list);
          setCatalogSource(source);
          writeClientCatalogCache(cacheKey, list, source);
        }
      })
      .catch((error) => {
        console.error("Catalog fetch failed:", error);
        if (!cancelled && !hasWarmData) {
          setProducts(getStaticFallback(catalogCollection));
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [catalogCollection, cacheKey, initialCatalog?.products.length]);

  const getProduct = useCallback(
    (id: number) => products.find((product) => product.id === id),
    [products]
  );

  const cartCount = useMemo(
    () => Object.values(cart).reduce((s, q) => s + q, 0),
    [cart]
  );
  const favCount = useMemo(() => Object.keys(fav).length, [fav]);

  const showToast = useCallback(
    (id: number) => {
      const p = getProduct(id);
      if (!p) return;
      setToastName(`«${p.name}»`);
      setToastVisible(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2800);
    },
    [getProduct]
  );

  const addToCart = useCallback(
    (id: number, x?: number, y?: number) => {
      setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      showToast(id);
      const product = getProduct(id);
      if (product) {
        trackAddToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          collection: product.collection,
        });
      }
      if (x != null && y != null) burstRef.current?.(x, y, 40);
    },
    [showToast, getProduct]
  );

  const incrementCart = useCallback((id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const decrementCart = useCallback((id: number) => {
    setCart((prev) => {
      const next = { ...prev };
      next[id] = (next[id] || 0) - 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const toggleFav = useCallback((id: number) => {
    setFav((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFav({});
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openMob = useCallback(() => setMobOpen(true), []);
  const closeMob = useCallback(() => setMobOpen(false), []);
  const openContact = useCallback(() => {
    setFabOpenState((prev) => {
      if (!prev) trackFabOpen();
      return true;
    });
  }, []);
  const closeContact = useCallback(() => setFabOpenState(false), []);
  const setFabOpen = useCallback((open: boolean) => {
    setFabOpenState((prev) => {
      if (open && !prev) trackFabOpen();
      return open;
    });
  }, []);

  const closeAll = useCallback(() => {
    setCartOpen(false);
    setFabOpenState(false);
    setMobOpen(false);
  }, []);

  const getCartQty = useCallback((id: number) => cart[id] || 0, [cart]);
  const isFav = useCallback((id: number) => !!fav[id], [fav]);

  const handleSetActiveTag = useCallback((tag: TagFilter) => {
    setActiveTag(tag);
  }, []);

  const handleSetActiveCollection = useCallback((slug: CollectionSlug | null) => {
    setActiveCollection(slug);
    if (slug) setActiveTag("Все");
  }, []);

  const handleSetFavOnly = useCallback((v: boolean) => {
    setFavOnly(v);
    if (v) {
      setActiveTag("Все");
      setActiveCollection(null);
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      cart,
      fav,
      favOnly,
      activeTag,
      activeCollection,
      searchQuery,
      cartOpen,
      mobOpen,
      fabOpen,
      toastName,
      toastVisible,
      cartCount,
      favCount,
      products,
      catalogSource,
      catalogLoading,
      setSearchQuery,
      setActiveTag: handleSetActiveTag,
      setActiveCollection: handleSetActiveCollection,
      setFavOnly: handleSetFavOnly,
      toggleFav,
      clearFavorites,
      addToCart,
      incrementCart,
      decrementCart,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
      openMob,
      closeMob,
      openContact,
      closeContact,
      setFabOpen,
      closeAll,
      getCartQty,
      isFav,
      getProduct,
      burstRef,
    }),
    [
      cart,
      fav,
      favOnly,
      activeTag,
      activeCollection,
      searchQuery,
      cartOpen,
      mobOpen,
      fabOpen,
      toastName,
      toastVisible,
      cartCount,
      favCount,
      products,
      catalogSource,
      catalogLoading,
      handleSetActiveTag,
      handleSetActiveCollection,
      handleSetFavOnly,
      toggleFav,
      clearFavorites,
      addToCart,
      incrementCart,
      decrementCart,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
      openMob,
      closeMob,
      openContact,
      closeContact,
      setFabOpen,
      closeAll,
      getCartQty,
      isFav,
      getProduct,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
