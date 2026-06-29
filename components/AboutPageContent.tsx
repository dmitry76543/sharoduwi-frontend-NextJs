import Link from "next/link";

import {
  ABOUT_STATS,
  ABOUT_STORES,
  ABOUT_VALUES,
} from "@/lib/info-pages";

export function AboutPageContent() {
  return (
    <>
      <section className="sec info-page">
        <div className="wrap">
          <nav className="category-breadcrumb reveal" aria-label="Навигация">
            <Link href="/">Главная</Link>
            <span aria-hidden="true">/</span>
            <span>О компании</span>
          </nav>

          <div className="info-hero reveal">
            <div className="sec-tag">
              <span className="dot" /> О нас
            </div>
            <h1>ШАРОДУВЫ — гелиевые и воздушные шары в Жуковском с 2005 года</h1>
            <p className="info-lead">
              Мы — семейная команда, которая делает праздник ярче: гелиевые и воздушные шары, фольгированные цифры,
              композиции и наборы с доставкой по Жуковскому и Раменскому району.
            </p>
          </div>

          <div className="info-stats reveal">
            {ABOUT_STATS.map((item) => (
              <div key={item.label} className="info-stat">
                <b>{item.value}</b>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="info-grid reveal">
            {ABOUT_VALUES.map((item) => (
              <article key={item.title} className="info-card">
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec info-page-section" id="stores">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="sec-tag">
              <span className="dot" /> Шоурумы
            </div>
            <h2>Два магазина в Жуковском</h2>
            <p>Приходите выбрать шары вживую или заберите готовый заказ самовывозом.</p>
          </div>
          <div className="info-stores reveal">
            {ABOUT_STORES.map((store) => (
              <article key={store.name} className="info-store">
                <h3>{store.name}</h3>
                <p>{store.address}</p>
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Открыть на карте →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="info-cta reveal">
            <h2>Готовы к празднику?</h2>
            <p>
              Выберите шары в каталоге, посмотрите{" "}
              <Link href="/#guarantee">гарантию на полёт</Link> или напишите нам — поможем с составом и
              доставкой.
            </p>
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
