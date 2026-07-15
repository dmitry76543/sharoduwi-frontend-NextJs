"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { CityLink } from "@/components/CityLink";
import { HowToOrderLink } from "@/components/HowToOrderLink";
import { SiteSectionLink } from "@/components/SiteSectionLink";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];

export function MobMenu() {
  const { mobOpen, closeMob } = useApp();

  useEffect(() => {
    if (!mobOpen) return;
    const scrollY = window.scrollY;
    const { body } = document;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      touchAction: body.style.touchAction,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";
    body.classList.add("mob-menu-open");
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.touchAction = prev.touchAction;
      body.classList.remove("mob-menu-open");
      window.scrollTo(0, scrollY);
    };
  }, [mobOpen]);

  return (
    <div
      className={`mob-menu${mobOpen ? " open" : ""}`}
      id="mobMenu"
      aria-hidden={!mobOpen}
      inert={mobOpen ? undefined : true}
    >
      <div className="mm-head">
        <CityLink href="/" className="logo" onClick={closeMob}>
          {LOGO.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </CityLink>
        <button className="close-btn" id="closeMob" type="button" onClick={closeMob}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav>
        <SiteSectionLink sectionId="collections" onNavigate={closeMob}>
          Коллекции
        </SiteSectionLink>
        <CityLink href="/catalog" onClick={closeMob}>
          Каталог
        </CityLink>
        <CityLink href="/delivery" onClick={closeMob}>
          Доставка
        </CityLink>
        <SiteSectionLink sectionId="reviews" onNavigate={closeMob}>
          Отзывы
        </SiteSectionLink>
        <HowToOrderLink onNavigate={closeMob}>Как заказать</HowToOrderLink>
        <SiteSectionLink sectionId="contacts" scrollOnAnyPage onNavigate={closeMob}>
          Контакты
        </SiteSectionLink>
        <Link href="/cities" onClick={closeMob}>
          Место доставки
        </Link>
      </nav>
    </div>
  );
}
