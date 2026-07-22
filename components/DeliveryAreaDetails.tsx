import Link from "next/link";

import {
  DELIVERY_MANAGER_MAX,
  DELIVERY_MANAGER_PHONE,
  DELIVERY_MANAGER_PHONE_HREF,
  DELIVERY_MANAGER_TELEGRAM,
  type DeliveryAreaDetails as DeliveryAreaDetailsData,
} from "@/lib/info-pages";

export function DeliveryAreaDetails({ details }: { details: DeliveryAreaDetailsData }) {
  return (
    <>
      <section className="sec info-page-section">
        <div className="wrap">
          <div className="delivery-highlights reveal">
            {details.highlights.map((item) => (
              <article key={item.title} className="delivery-highlight">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="delivery-pricing reveal">
            <div className="sec-head">
              <div className="sec-tag">
                <span className="dot" /> Тарифы
              </div>
              <h2>{details.pricingTitle}</h2>
              {details.pricingIntro ? (
                <p className="delivery-pricing-intro">{details.pricingIntro}</p>
              ) : null}
              <p>Условия доставки:</p>
            </div>

            <div className="delivery-table-wrap">
              <table className="delivery-table">
                <thead>
                  <tr>
                    <th scope="col">
                      Населённый
                      <br />
                      пункт
                    </th>
                    <th scope="col">
                      Условие
                      <br />
                      заказа
                    </th>
                    <th scope="col">Доставка</th>
                  </tr>
                </thead>
                <tbody>
                  {details.pricingRows.map((row, index) => (
                    <tr key={`${row.location}-${row.condition}-${index}`}>
                      <td>{row.location}</td>
                      <td>{row.condition}</td>
                      <td>
                        <strong>{row.price}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {details.pricingFooterNote ? (
              <p className="delivery-pricing-footer">{details.pricingFooterNote}</p>
            ) : null}

            <div className="delivery-note-block">
              <p className="delivery-note">{details.pricingOtherNote}</p>
              <p className="delivery-note">
                <a href={DELIVERY_MANAGER_PHONE_HREF} className="delivery-note-phone">
                  {DELIVERY_MANAGER_PHONE}
                </a>
              </p>
            </div>

            <div className="delivery-extras">
              <article className="info-card">
                <h3>{details.nightSurcharge.title}</h3>
                <p>{details.nightSurcharge.text}</p>
              </article>
              <article className="info-card">
                <h3>{details.greetingService.title}</h3>
                <p>{details.greetingService.text}</p>
              </article>
            </div>

            <p className="delivery-note delivery-note--center">{details.managersNote}</p>
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <div className="delivery-payment reveal">
            <div className="sec-head">
              <div className="sec-tag">
                <span className="dot" /> Оплата
              </div>
              <h2>{details.paymentTitle}</h2>
            </div>

            <div className="info-grid">
              <article className="info-card">
                <h3>Частным клиентам</h3>
                <ul className="info-list">
                  {details.paymentIndividuals.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className="info-card">
                <h3>{details.paymentOrganizationsTitle}</h3>
                <ol className="delivery-steps-list">
                  <li>
                    Заказ через менеджера по тел.{" "}
                    <a href={DELIVERY_MANAGER_PHONE_HREF}>{DELIVERY_MANAGER_PHONE}</a>,{" "}
                    <a href={DELIVERY_MANAGER_MAX} target="_blank" rel="noopener noreferrer">
                      MAX
                    </a>{" "}
                    или{" "}
                    <a href={DELIVERY_MANAGER_TELEGRAM} target="_blank" rel="noopener noreferrer">
                      Telegram
                    </a>
                  </li>
                  {details.paymentOrganizations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="sec info-page-section">
        <div className="wrap">
          <article className="delivery-pickup reveal" id="delivery-pickup">
            <div className="sec-tag">
              <span className="dot" /> Самовывоз
            </div>
            <h2>{details.pickupTitle}</h2>
            <p>{details.pickupText}</p>
            <Link href="/about#stores" className="info-link">
              Схема проезда и контакты магазинов →
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
