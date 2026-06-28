"use client";

import { useRef } from "react";
import { REVIEWS } from "@/lib/data";

const YANDEX_REVIEW_WIDGETS = [
  {
    orgId: "1855601489",
    mapUrl: "https://yandex.ru/maps/org/sharoduvy/1855601489/",
    label: "ул. Чкалова",
  },
  {
    orgId: "1796536309",
    mapUrl: "https://yandex.ru/maps/org/sharoduvy/1796536309/",
    label: "ТЦ «Фермер»",
  },
] as const;

function YandexReviewsWidget({
  orgId,
  mapUrl,
  label,
}: {
  orgId: string;
  mapUrl: string;
  label: string;
}) {
  return (
    <div className="yr-widget-wrap">
      <p className="yr-widget-label">{label}</p>
      <div className="yr-widget">
        <iframe
          src={`https://yandex.ru/maps-reviews-widget/${orgId}?comments`}
          title={`Отзывы на Яндекс.Картах — ${label}`}
          loading="lazy"
        />
        <a
          href={mapUrl}
          className="yr-widget-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Шародувы на карте Жуковского — Яндекс&nbsp;Карты
        </a>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const step = () => {
    const track = trackRef.current;
    if (!track) return 370;
    const c = track.querySelector(".review") as HTMLElement | null;
    return c ? c.offsetWidth + 20 : 370;
  };

  return (
    <section className="sec" id="reviews">
      <div className="wrap">
        <div className="sec-head reveal">
          <div className="sec-tag">
            <span className="dot" /> Отзывы
          </div>
          <h2>Что пишут наши клиенты</h2>
        </div>
        <div className="reviews-wrap">
          <button
            className="rv-nav prev"
            id="rvPrev"
            aria-label="Предыдущий отзыв"
            type="button"
            onClick={() => trackRef.current?.scrollBy({ left: -step(), behavior: "smooth" })}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="rv-nav next"
            id="rvNext"
            aria-label="Следующий отзыв"
            type="button"
            onClick={() => trackRef.current?.scrollBy({ left: step(), behavior: "smooth" })}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="reviews" id="reviewsTrack" ref={trackRef}>
            {REVIEWS.map((r) => (
              <div className="review" key={r.name}>
                <div className="rv-photo">
                  <span className="rv-ph">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <circle cx="12" cy="12.5" r="3.5" />
                    </svg>
                    Фото клиента
                  </span>
                </div>
                <div className="stars">★★★★★</div>
                <p>{r.text}</p>
                <div className="who">
                  <div className="ava" style={{ background: r.color }}>
                    {r.initial}
                  </div>
                  <div>
                    <b>{r.name}</b>
                    <span>{r.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="yandex-reviews reveal">
          <p className="yr-lead">Реальные отзывы покупателей — на Яндекс.Картах по обоим магазинам:</p>
          <div className="yr-widgets">
            {YANDEX_REVIEW_WIDGETS.map((widget) => (
              <YandexReviewsWidget key={widget.orgId} {...widget} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
