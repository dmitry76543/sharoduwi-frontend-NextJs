"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { CitySwitcher } from "@/components/CitySwitcher";
import { CityLink } from "@/components/CityLink";
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
      <div className="mm-city">
        <CitySwitcher />
      </div>
      <nav>
        <SiteSectionLink sectionId="collections" onNavigate={closeMob}>
          Коллекции
        </SiteSectionLink>
        <CityLink href="/catalog" onClick={closeMob}>
          Каталог
        </CityLink>
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
        <Link href="/cities" onClick={closeMob}>
          Место доставки
        </Link>
      </nav>
    </div>
  );
}
