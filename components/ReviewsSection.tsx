"use client";

import Link from "next/link";
import { useRef } from "react";

import { ReviewCard } from "@/components/ReviewCard";
import { YandexReviewsWidgets } from "@/components/YandexReviewsWidgets";
import { REVIEWS } from "@/lib/data";

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
          <h2>Что пишут наши клиенты о нас</h2>
          <p>
            <Link href="/reviews" className="info-link">
              Все отзывы →
            </Link>
          </p>
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
              <ReviewCard key={r.name} review={r} />
            ))}
          </div>
        </div>
        <div className="reveal">
          <YandexReviewsWidgets />
        </div>
      </div>
    </section>
  );
}
