import Link from "next/link";

import { ReviewCard } from "@/components/ReviewCard";
import { YandexReviewsWidgets } from "@/components/YandexReviewsWidgets";
import { REVIEWS } from "@/lib/data";

export function ReviewsPageContent() {
  const avgRating = (
    REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length
  ).toFixed(1);

  return (
    <>
      <section className="sec info-page">
        <div className="wrap">
          <nav className="category-breadcrumb reveal" aria-label="Навигация">
            <Link href="/">Главная</Link>
            <span aria-hidden="true">/</span>
            <span>Отзывы</span>
          </nav>

          <div className="info-hero reveal">
            <div className="sec-tag">
              <span className="dot" /> Отзывы
            </div>
            <h1>Отзывы о гелиевых и воздушных шарах — ШАРОДУВЫ</h1>
            <p className="info-lead">
              Реальные отзывы покупателей о гелиевых и воздушных шарах, доставке и обслуживании в наших магазинах на
              ул. Чкалова и в ТЦ «Фермер».
            </p>
            <div className="reviews-summary reveal">
              <span className="reviews-summary-score">{avgRating}</span>
              <div>
                <strong>{REVIEWS.length} отзывов на сайте</strong>
                <span>Средняя оценка по отзывам клиентов</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="reviews-grid reveal">
            {REVIEWS.map((review) => (
              <ReviewCard key={review.name} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap reveal">
          <YandexReviewsWidgets />
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="info-cta reveal">
            <h2>Хотите так же яркий праздник?</h2>
            <p>Выберите шары в каталоге или напишите нам — поможем с составом и доставкой по Жуковскому и району.</p>
            <div className="info-cta-actions">
              <Link href="/catalog" className="btn btn-primary">
                Смотреть каталог
              </Link>
              <a href="tel:+79267086374" className="btn btn-ghost">
                +7 926 708-63-74
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
