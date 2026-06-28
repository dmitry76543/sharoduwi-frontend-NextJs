"use client";

import { useApp } from "@/context/AppContext";
import { HowToOrderLink } from "@/components/HowToOrderLink";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];

export function MobMenu() {
  const { mobOpen, closeMob } = useApp();

  return (
    <div className={`mob-menu${mobOpen ? " open" : ""}`} id="mobMenu">
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
        <a href="#collections" onClick={closeMob}>
          Коллекции
        </a>
        <a href="/catalog" onClick={closeMob}>
          Каталог
        </a>
        <a href="#promo" onClick={closeMob}>
          Акции
        </a>
        <a href="#reviews" onClick={closeMob}>
          Отзывы
        </a>
        <HowToOrderLink onNavigate={closeMob}>Как заказать</HowToOrderLink>
        <a href="#contacts" onClick={closeMob}>
          Контакты
        </a>
      </nav>
    </div>
  );
}
