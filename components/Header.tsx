"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useCity } from "@/context/CityContext";
import { CitySwitcher } from "@/components/CitySwitcher";
import { CityLink } from "@/components/CityLink";
import { HowToOrderLink } from "@/components/HowToOrderLink";
import {
  consumeSearchFocusPending,
  markSearchFocusPending,
} from "@/lib/search-storage";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];
const SEARCH_NAVIGATE_DEBOUNCE_MS = 500;

function buildCatalogSearchUrl(catalogPath: string, query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return catalogPath;
  return `${catalogPath}?q=${encodeURIComponent(trimmed)}#shop`;
}

function focusHeaderSearchInput() {
  const input = document.getElementById("headSearchInput") as HTMLInputElement | null;
  if (!input) return;
  input.focus();
  const end = input.value.length;
  input.setSelectionRange(end, end);
}

export function Header() {
  const {
    cartCount,
    favCount,
    favOnly,
    searchQuery,
    setFavOnly,
    setSearchQuery,
    openCart,
    openMob,
    setActiveTag,
    setActiveCollection,
  } = useApp();
  const { href, isHome } = useCity();

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchStartedRef = useRef(false);
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const catalogPath = href("/catalog");
  const isCatalogPage = pathname === catalogPath;

  const clearNavigateTimer = useCallback(() => {
    if (!navigateTimerRef.current) return;
    clearTimeout(navigateTimerRef.current);
    navigateTimerRef.current = null;
  }, []);

  useEffect(() => {
    searchStartedRef.current = false;
    clearNavigateTimer();
  }, [pathname, clearNavigateTimer]);

  useEffect(() => {
    if (searchOpen) {
      focusHeaderSearchInput();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!isCatalogPage || !consumeSearchFocusPending()) return;

    setSearchOpen(true);
    const focus = () => focusHeaderSearchInput();
    focus();
    const timer = window.setTimeout(focus, 80);
    const retry = window.setTimeout(focus, 250);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(retry);
    };
  }, [isCatalogPage, pathname]);

  useEffect(() => clearNavigateTimer, [clearNavigateTimer]);

  const scrollToShop = useCallback(() => {
    document
      .getElementById("shop")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const navigateToCatalogSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      markSearchFocusPending();
      router.push(buildCatalogSearchUrl(catalogPath, trimmed));
    },
    [catalogPath, router]
  );

  const goToSearchResults = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      clearNavigateTimer();

      if (!trimmed) {
        if (isCatalogPage) {
          router.replace(catalogPath, { scroll: false });
        }
        return;
      }

      if (!isCatalogPage) {
        navigateToCatalogSearch(trimmed);
        return;
      }

      router.replace(buildCatalogSearchUrl(catalogPath, trimmed), {
        scroll: false,
      });
      scrollToShop();
    },
    [
      catalogPath,
      clearNavigateTimer,
      isCatalogPage,
      navigateToCatalogSearch,
      router,
      scrollToShop,
    ]
  );

  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchQuery(value);
      const trimmed = value.trim();

      clearNavigateTimer();

      if (!trimmed) {
        searchStartedRef.current = false;
        if (isCatalogPage) {
          router.replace(catalogPath, { scroll: false });
        }
        return;
      }

      if (isCatalogPage) {
        router.replace(buildCatalogSearchUrl(catalogPath, trimmed), {
          scroll: false,
        });
        if (!searchStartedRef.current) {
          searchStartedRef.current = true;
          scrollToShop();
        }
        return;
      }

      navigateTimerRef.current = setTimeout(() => {
        navigateTimerRef.current = null;
        navigateToCatalogSearch(trimmed);
      }, SEARCH_NAVIGATE_DEBOUNCE_MS);
    },
    [
      catalogPath,
      clearNavigateTimer,
      isCatalogPage,
      navigateToCatalogSearch,
      router,
      scrollToShop,
      setSearchQuery,
    ]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const box = searchRef.current;
      if (searchOpen && box && !box.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [searchOpen]);

  const onFavClick = () => {
    const next = !favOnly;
    if (next) {
      setActiveTag("Все");
      setActiveCollection(null);
      if (!isCatalogPage) {
        router.push(`${catalogPath}?fav=1#shop`);
        return;
      }
    } else if (isCatalogPage) {
      router.replace(catalogPath, { scroll: false });
    }
    setFavOnly(next);
    scrollToShop();
  };

  return (
    <header className="header" id="header">
      <div className="header-inner">
        <CityLink href="/" className="logo" aria-label="ШАРОДУВЫ">
          {LOGO.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </CityLink>
        <nav className="nav">
          <CityLink href="/catalog">Каталог</CityLink>
          <a href={isHome ? "#delivery" : `${href("/")}#delivery`}>Доставка</a>
          <HowToOrderLink>Как заказать</HowToOrderLink>
          <a href={isHome ? "#contacts" : `${href("/")}#contacts`}>Контакты</a>
        </nav>
        <div className="header-city">
          <CitySwitcher compact inHeader />
        </div>
        <div className="head-actions">
          <a className="head-phone" href="tel:+79267086374" aria-label="Позвонить">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />
            </svg>
            <span>+7 926 708-63-74</span>
          </a>
          <div
            className={`head-search${searchOpen ? " open" : ""}`}
            id="headSearch"
            ref={searchRef}
          >
            <button
              className="hs-btn"
              id="hsBtn"
              aria-label="Поиск по каталогу"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (searchOpen) {
                  if (searchQuery.trim()) {
                    goToSearchResults(searchQuery);
                  } else {
                    setSearchOpen(false);
                  }
                } else {
                  setSearchOpen(true);
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
            <input
              type="text"
              id="headSearchInput"
              placeholder="Название или артикул…"
              aria-label="Поиск по каталогу"
              autoComplete="off"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  goToSearchResults(searchQuery);
                }
                if (e.key === "Escape") {
                  clearNavigateTimer();
                  setSearchQuery("");
                  setSearchOpen(false);
                }
              }}
            />
          </div>
          <button
            className={`icon-btn fav-btn${favOnly ? " active" : ""}`}
            id="favBtn"
            aria-label="Избранное"
            type="button"
            onClick={onFavClick}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 5.2a5.5 5.5 0 00-7.8 0L12 6.2l-1-1a5.5 5.5 0 00-7.8 7.8L12 22l8.8-9a5.5 5.5 0 000-7.8z" />
            </svg>
            <span className={`cart-count fav-count${favCount > 0 ? " show" : ""}`} id="favCount">
              {favCount}
            </span>
          </button>
          <button className="icon-btn hdr-burger" id="hdrBurger" aria-label="Меню" type="button" onClick={openMob}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button className="icon-btn" id="openCart" aria-label="Корзина" type="button" onClick={openCart}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.6" />
              <circle cx="18" cy="20" r="1.6" />
              <path d="M1.5 2.5h3l2.3 12.1a1.7 1.7 0 001.7 1.4h8.4a1.7 1.7 0 001.7-1.3L22 7H6" />
            </svg>
            <span className={`cart-count${cartCount > 0 ? " show" : ""}`} id="cartCount">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
