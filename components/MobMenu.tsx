"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { HowToOrderLink } from "@/components/HowToOrderLink";
import { SiteSectionLink } from "@/components/SiteSectionLink";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];

export function MobMenu() {
  const { mobOpen, closeMob } = useApp();

  return (
    <div
      className={`mob-menu${mobOpen ? " open" : ""}`}
      id="mobMenu"
      aria-hidden={!mobOpen}
      inert={mobOpen ? undefined : true}
    >
      <div className="mm-head">
        <a href="/" className="logo" onClick={closeMob}>
          {LOGO.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </a>
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
        <Link href="/catalog" onClick={closeMob}>
          Каталог
        </Link>
        <SiteSectionLink sectionId="delivery" scrollOnAnyPage onNavigate={closeMob}>
          Доставка
        </SiteSectionLink>
        <SiteSectionLink sectionId="reviews" onNavigate={closeMob}>
          Отзывы
        </SiteSectionLink>
        <HowToOrderLink onNavigate={closeMob}>Как заказать</HowToOrderLink>
        <SiteSectionLink sectionId="contacts" scrollOnAnyPage onNavigate={closeMob}>
          Контакты
        </SiteSectionLink>
      </nav>
    </div>
  );
}
