"use client";

import { useEffect, useRef } from "react";
import { cluster } from "@/lib/balloons";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];

export function WhySection() {
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (artRef.current) {
      artRef.current.innerHTML = cluster(["sun", "mint", "sky", "lav"], 68);
    }
  }, []);

  return (
    <section className="sec" id="why">
      <div className="wrap">
        <div className="sec-head reveal">
          <div className="sec-tag">
            <span className="dot" /> Почему мы
          </div>
          <h2 className="why-heading">
            <span className="why-heading-line">Почему</span>{" "}
            <span className="brand-word">
              {LOGO.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </h2>
        </div>
        <div className="bento reveal">
          <article className="bento-tile bt-hero">
            <div className="bt-art" id="whyArt" ref={artRef} />
            <span className="bt-badge">с 2005 года</span>
            <h3>Более 20 лет дарим праздник</h3>
            <p>
              Тысячи букетов и композиций для семей Жуковского и Раменского. Мы выросли на ваших днях рождения, выписках и юбилеях.
            </p>
          </article>
          <article className="bento-tile bt-wide">
            <div className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3>Стойкий гелий + Hi-Float</h3>
            <p>Качественный гелий и обработка латекса — шары летают в разы дольше.</p>
          </article>
          <article className="bento-tile">
            <div className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3>Быстрая доставка</h3>
            <p>Точно ко времени по Жуковскому и Раменскому району.</p>
          </article>
          <article className="bento-tile">
            <div className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12l4-4 4 4 6-6 4 4" />
                <path d="M3 18h18" />
              </svg>
            </div>
            <h3>Ручная сборка</h3>
            <p>Каждую композицию собираем вручную под ваш повод.</p>
          </article>
          <article className="bento-tile bt-wide">
            <div className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3>Два магазина в Жуковском</h3>
            <p>Удобный самовывоз на ул. Чкалова и в ТЦ «Фермер».</p>
          </article>
          <article className="bento-tile bt-wide">
            <div className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20.8 5.2a5.5 5.5 0 00-7.8 0L12 6.2l-1-1a5.5 5.5 0 00-7.8 7.8L12 22l8.8-9a5.5 5.5 0 000-7.8z" />
              </svg>
            </div>
            <h3>Делаем с душой</h3>
            <p>Любим своё дело — и это видно в каждом шарике.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
