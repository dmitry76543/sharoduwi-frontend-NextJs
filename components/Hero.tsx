"use client";

import { useEffect, useMemo, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useCity } from "@/context/CityContext";
import { HERO_MINI } from "@/lib/data";
import { COLORS } from "@/lib/data";
import { getCityHeroStats } from "@/lib/cities";
import { balloonSVG, fmt } from "@/lib/balloons";
import { findHeroFeaturedProduct, HERO_FEATURED_NAME } from "@/lib/hero-featured";

export function Hero() {
  const { addToCart, openContact, products } = useApp();
  const { city } = useCity();
  const miniRef = useRef<HTMLDivElement>(null);
  const featured = useMemo(() => findHeroFeaturedProduct(products), [products]);
  const title = featured?.name ?? HERO_FEATURED_NAME;
  const price = featured?.price;
  const oldPrice = featured?.old;
  const heroLead = city?.seo.heroLead ??
    "Гелиевые и воздушные шары: фольгированные цифры, эксклюзивные яркие композиции, любимые герои, необычные формы. Привозим точно ко времени. Фото или видео перед доставкой.";
  const heroStats = getCityHeroStats(city);

  useEffect(() => {
    const el = miniRef.current;
    if (!el) return;
    HERO_MINI.forEach((m) => {
      const d = document.createElement("div");
      d.className = "mb";
      d.style.left = m.x + "%";
      d.style.top = m.y + "%";
      d.style.setProperty("--w", m.w + "px");
      d.style.setProperty("--d", m.d + "s");
      d.style.setProperty("--dur", m.dur + "s");
      d.style.setProperty("--rot", m.rot + "deg");
      d.innerHTML = balloonSVG(COLORS[m.c], m.w);
      el.appendChild(d);
    });
  }, []);

  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="reveal" data-d="1">
              <span className="hero-float">
                Ваш праздник <span className="hl" id="rising-word">начинается</span> здесь
              </span>
            </h1>
            <p className="lead reveal" data-d="2">
              {heroLead}
            </p>
            <div className="hero-cta reveal" data-d="3">
              <button className="btn btn-primary" id="heroContact" type="button" onClick={openContact}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Связаться с нами
              </button>
              <a href="#shop" className="btn btn-ghost">
                Смотреть каталог
              </a>
            </div>
            <div className="hero-stats reveal" data-d="4">
              <div className="st">
                <b data-count="20" data-suffix="+">
                  0
                </b>
                <span>лет дарим праздник</span>
              </div>
              <div className="st">
                {heroStats.middle.type === "count" ? (
                  <b
                    data-count={heroStats.middle.value}
                    {...(heroStats.middle.suffix
                      ? { "data-suffix": heroStats.middle.suffix }
                      : {})}
                  >
                    0
                  </b>
                ) : (
                  <b>{heroStats.middle.value}</b>
                )}
                <span>{heroStats.middle.label}</span>
              </div>
              <div className="st">
                <b data-count="5000" data-suffix="+">
                  0
                </b>
                <span>счастливых семей</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-stage">
              <div className="mini-balloons" id="heroMini" ref={miniRef} />
              <div className={`hero-badge${featured?.img ? " hero-badge--photo" : ""}`}>
                <span className="ribbon-knot" />
                {featured?.img && (
                  <div className="hero-badge-photo">
                    <img
                      src={featured.img}
                      alt=""
                      aria-hidden="true"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="hero-badge-content">
                  <h3>{title}</h3>
                  <div className="hero-badge-foot">
                    <div className="price">
                      {price != null && price > 0 ? (
                        <>
                          {fmt(price)} ₽{" "}
                          {oldPrice != null && oldPrice > price && <s>{fmt(oldPrice)} ₽</s>}
                        </>
                      ) : !featured ? (
                        "Шары на подлёте!"
                      ) : (
                        "уточняйте цену"
                      )}
                    </div>
                    <button
                      className="add-btn hero-badge-cart"
                      type="button"
                      aria-label="В корзину"
                      disabled={!featured}
                      onClick={(e) => {
                        if (!featured) return;
                        addToCart(featured.id, e.clientX, e.clientY);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
