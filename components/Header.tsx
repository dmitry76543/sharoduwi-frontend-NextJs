"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { HowToOrderLink } from "@/components/HowToOrderLink";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];

export function Header() {
  const {
    cartCount,
    favCount,
    favOnly,
    setFavOnly,
    setSearchQuery,
    openCart,
    openMob,
    setActiveTag,
    setActiveCollection,
  } = useApp();

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrolledOnce = useRef(false);

  const gotoShop = useCallback(() => {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const box = searchRef.current;
    const input = inputRef.current;
    if (!box || !input) return;

    const openBox = () => {
      box.classList.add("open");
      input.focus();
    };
    const closeBox = () => box.classList.remove("open");

    const btn = box.querySelector(".hs-btn");
    if (!btn) return;

    const onBtnClick = (e: Event) => {
      e.stopPropagation();
      if (box.classList.contains("open")) {
        if (input.value.trim()) gotoShop();
        else closeBox();
      } else {
        openBox();
      }
    };

    const onInput = () => {
      setSearchQuery(input.value);
      if (input.value.trim() && !scrolledOnce.current) {
        scrolledOnce.current = true;
        gotoShop();
      }
      if (!input.value.trim()) scrolledOnce.current = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        gotoShop();
        input.blur();
      }
      if (e.key === "Escape") {
        input.value = "";
        setSearchQuery("");
        closeBox();
      }
    };

    const onDocClick = (e: MouseEvent) => {
      if (box.classList.contains("open") && !box.contains(e.target as Node)) closeBox();
    };

    btn.addEventListener("click", onBtnClick);
    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocClick);
    return () => {
      btn.removeEventListener("click", onBtnClick);
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocClick);
    };
  }, [gotoShop, setSearchQuery]);

  const onFavClick = () => {
    const next = !favOnly;
    if (next) {
      setActiveTag("Все");
      setActiveCollection(null);
      if (pathname !== "/catalog") {
        router.push("/catalog?fav=1#shop");
        return;
      }
    } else if (pathname === "/catalog") {
      router.replace("/catalog", { scroll: false });
    }
    setFavOnly(next);
    gotoShop();
  };

  return (
    <header className="header" id="header">
      <div className="header-inner">
        <a href="/" className="logo" aria-label="ШАРОДУВЫ">
          {LOGO.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </a>
        <nav className="nav">
          <a href="/catalog">Каталог</a>
          <a href="#delivery">Доставка</a>
          <a href="#reviews">Отзывы</a>
          <HowToOrderLink>Как заказать</HowToOrderLink>
          <a href="#contacts">Контакты</a>
        </nav>
        <div className="head-actions">
          <a className="head-phone" href="tel:+79267086374" aria-label="Позвонить">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />
            </svg>
            <span>+7 926 708-63-74</span>
          </a>
          <div className="head-search" id="headSearch" ref={searchRef}>
            <button className="hs-btn" id="hsBtn" aria-label="Поиск по каталогу" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              id="headSearchInput"
              placeholder="Найти шар по каталогу…"
              aria-label="Поиск по каталогу"
              autoComplete="off"
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
