import Link from "next/link";

import { DeliveryAreaDetails } from "@/components/DeliveryAreaDetails";
import { COLLECTIONS } from "@/lib/data";
import {
  DELIVERY_DETAILS_BY_SLUG,
  DELIVERY_MANAGER_MAX,
  DELIVERY_MANAGER_PHONE,
  DELIVERY_MANAGER_PHONE_HREF,
  DELIVERY_MANAGER_TELEGRAM,
  FEATURED_COLLECTION_SLUGS,
  type DeliveryAreaConfig,
} from "@/lib/info-pages";

export function DeliveryPageContent({ config }: { config: DeliveryAreaConfig }) {
  const areaDetails = DELIVERY_DETAILS_BY_SLUG[config.slug];
  const hasDetailedTariffs = Boolean(areaDetails);
  const featuredCollections = FEATURED_COLLECTION_SLUGS.map((slug) =>
    COLLECTIONS.find((c) => c.slug === slug)
  ).filter(Boolean);

  return (
    <>
      <section className="sec info-page">
        <div className="wrap">
          <nav className="category-breadcrumb reveal" aria-label="Навигация">
            <Link href="/">Главная</Link>
            <span aria-hidden="true">/</span>
            <span>Доставка</span>
            <span aria-hidden="true">/</span>
            <span>{config.cityLabel}</span>
          </nav>

          <div className="info-hero reveal">
            <div className="sec-tag">
              <span className="dot" /> Доставка
            </div>
            <h1>{config.title}</h1>
            <p className="info-lead">{config.lead}</p>
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="info-split reveal">
            <div className="info-card info-card--wide">
              <h2>Куда привозим</h2>
              <ul className="info-list">
                {config.zones.map((zone) => (
                  <li key={zone}>{zone}</li>
                ))}
              </ul>
            </div>
            <div className="info-card info-card--wide">
              {hasDetailedTariffs ? (
                <>
                  <h2>Менеджеры на связи</h2>
                  <p>
                    Уточните стоимость доставки по вашему адресу, ночной тариф и состав заказа — ответим
                    быстро.
                  </p>
                  <p className="delivery-contact-links">
                    <a href={DELIVERY_MANAGER_PHONE_HREF}>{DELIVERY_MANAGER_PHONE}</a>
                    {" · "}
                    <a href={DELIVERY_MANAGER_MAX} target="_blank" rel="noopener noreferrer">
                      MAX
                    </a>
                    {" · "}
                    <a href={DELIVERY_MANAGER_TELEGRAM} target="_blank" rel="noopener noreferrer">
                      Telegram
                    </a>
                  </p>
                  <a href="#delivery-pickup" className="info-link">
                    Самовывоз из магазинов →
                  </a>
                </>
              ) : (
                <>
                  <h2>Самовывоз</h2>
                  <p>{config.pickupNote}</p>
                  <a
                    href={config.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-link"
                  >
                    {config.mapLabel} →
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {areaDetails ? (
        <DeliveryAreaDetails details={areaDetails} />
      ) : (
        <section className="sec info-page-section">
          <div className="wrap">
            <div className="info-placeholder reveal">
              <h2>Стоимость и условия доставки</h2>
              <p>
                Актуальные тарифы, минимальная сумма заказа и интервалы доставки мы обновим на этой странице
                в ближайшее время. Пока что уточняйте стоимость при оформлении заказа — менеджер сразу
                подскажет варианты.
              </p>
              <div className="info-placeholder-box" aria-hidden="true">
                <span>Тарифы и условия — скоро здесь</span>
              </div>
              <p className="info-note">
                Напишите в{" "}
                <a href={DELIVERY_MANAGER_MAX}>MAX</a>,{" "}
                <a href={DELIVERY_MANAGER_TELEGRAM}>Telegram</a> или позвоните{" "}
                <a href={DELIVERY_MANAGER_PHONE_HREF}>{DELIVERY_MANAGER_PHONE}</a> — ответим быстро.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="sec-tag">
              <span className="dot" /> Популярное
            </div>
            <h2>Что чаще заказывают с доставкой</h2>
            <p>Подборка коллекций — от облака под потолок до наборов на день рождения.</p>
          </div>
          <div className="info-chips reveal">
            {featuredCollections.map((collection) =>
              collection ? (
                <Link
                  key={collection.slug}
                  href={`/categories/${collection.slug}`}
                  className="chip"
                >
                  {collection.name}
                </Link>
              ) : null
            )}
            <Link href="/catalog" className="chip active">
              Весь каталог
            </Link>
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="info-steps reveal">
            <h2>Как заказать доставку</h2>
            <ol className="info-steps-list">
              <li>Выберите шары в каталоге или напишите нам — поможем с составом.</li>
              <li>Согласуем адрес, дату и время доставки в {config.deliveryInLabel}.</li>
              <li>Соберём композицию, надуем гелием и привезём точно ко времени торжества.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="info-cta reveal">
            <h2>Заказать доставку в {config.cityLabel}</h2>
            <p>
              Также возим по соседним направлениям —{" "}
              {config.slug === "zhukovsky" ? (
                <Link href="/delivery/ramenskoe">доставка в Раменское и по Раменскому району</Link>
              ) : (
                <Link href="/delivery/zhukovsky">доставка по Жуковскому</Link>
              )}
              .
            </p>
            <div className="info-cta-actions">
              <Link href="/catalog" className="btn btn-primary">
                Выбрать шары
              </Link>
              <a href="tel:+79267086374" className="btn btn-ghost">
                Позвонить
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
