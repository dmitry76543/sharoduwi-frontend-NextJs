"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useCity } from "@/context/CityContext";
import { CitySwitcher } from "@/components/CitySwitcher";
import { CityLink } from "@/components/CityLink";
import { HowToOrderLink } from "@/components/HowToOrderLink";
import { HeaderSearchModal } from "@/components/HeaderSearchModal";
import {
  consumeSearchFocusPending,
  markSearchFocusPending,
} from "@/lib/search-storage";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];

function buildSearchPageUrl(searchPath: string, query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return searchPath;
  return `${searchPath}?q=${encodeURIComponent(trimmed)}`;
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  const catalogPath = href("/catalog");
  const searchPath = href("/search");
  const isCatalogPage = pathname === catalogPath;
  const isSearchPage =
    pathname === searchPath || pathname.endsWith("/search");

  const closeSearchUi = useCallback(() => {
    setSearchOpen(false);
    setResultsOpen(false);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      focusHeaderSearchInput();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!isSearchPage || !consumeSearchFocusPending()) return;

    setSearchOpen(true);
    const focus = () => focusHeaderSearchInput();
    focus();
    const timer = window.setTimeout(focus, 80);
    const retry = window.setTimeout(focus, 250);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(retry);
    };
  }, [isSearchPage, pathname]);

  const scrollToShop = useCallback(() => {
    document
      .getElementById("shop")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goToSearchResults = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        closeSearchUi();
        if (isSearchPage) {
          router.replace(searchPath, { scroll: false });
        }
        return;
      }

      setSearchQuery(trimmed);
      setResultsOpen(false);
      setSearchOpen(false);
      markSearchFocusPending();

      const nextUrl = buildSearchPageUrl(searchPath, trimmed);
      if (isSearchPage) {
        router.replace(nextUrl, { scroll: false });
      } else {
        router.push(nextUrl);
      }
    },
    [
      closeSearchUi,
      isSearchPage,
      router,
      searchPath,
      setSearchQuery,
    ]
  );

  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchQuery(value);
      const trimmed = value.trim();
      setResultsOpen(Boolean(trimmed));
      if (!searchOpen) setSearchOpen(true);
    },
    [searchOpen, setSearchQuery]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const box = searchRef.current;
      const modal = (e.target as Element | null)?.closest?.(
        ".head-search-modal, .head-search-modal-overlay"
      );
      const target = e.target as Node;
      if (!searchOpen && !resultsOpen) return;
      if (box?.contains(target) || modal) return;
      closeSearchUi();
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [closeSearchUi, resultsOpen, searchOpen]);

  useEffect(() => {
    if (!resultsOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [resultsOpen]);

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
          <CityLink href="/delivery">Доставка</CityLink>
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
              aria-label={searchQuery.trim() ? "Перейти к результатам поиска" : "Поиск по каталогу"}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (searchOpen) {
                  if (searchQuery.trim()) {
                    goToSearchResults(searchQuery);
                  } else {
                    closeSearchUi();
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
              onFocus={() => {
                setSearchOpen(true);
                if (searchQuery.trim()) setResultsOpen(true);
              }}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goToSearchResults(searchQuery);
                }
                if (e.key === "Escape") {
                  if (resultsOpen) {
                    setResultsOpen(false);
                    return;
                  }
                  setSearchQuery("");
                  closeSearchUi();
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
      <HeaderSearchModal
        query={searchQuery}
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        onGoToResults={goToSearchResults}
        onSelectProduct={closeSearchUi}
      />
    </header>
  );
}
