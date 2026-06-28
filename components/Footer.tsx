import { HowToOrderLink } from "@/components/HowToOrderLink";

const LOGO = ["Ш", "А", "Р", "О", "Д", "У", "В", "Ы"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contacts">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <a href="/" className="logo">
              {LOGO.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </a>
            <p className="f-about">
              Гелиевые шары, фольгированные цифры и праздничные композиции в Жуковском и Раменском районе с 2005 года.
            </p>
          </div>
          <div>
            <h4>Информация</h4>
            <ul>
              <li>
                <a href="#collections">Коллекции</a>
              </li>
              <li>
                <a href="/catalog">Каталог</a>
              </li>
              <li>
                <HowToOrderLink>Как заказать</HowToOrderLink>
              </li>
              <li>
                <a href="#why">О нас</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Доставка</h4>
            <ul>
              <li>
                <a href="#">По Жуковскому</a>
              </li>
              <li>
                <a href="#">По Раменскому району</a>
              </li>
              <li>
                <a href="#">Самовывоз из магазина</a>
              </li>
              <li>
                <a href="#">Оформление и оплата</a>
              </li>
              <li>
                <a href="#guarantee">Гарантия на полёт</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Контакты</h4>
            <div className="f-contact">
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                г. Жуковский, ул. Чкалова, д. 6, цокольный этаж
              </div>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                г. Жуковский, ул. Мясищева, д. 28/1, ТЦ «Фермер»
              </div>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />
                </svg>
                <a href="tel:+79267086374">+7 926 708-63-74</a>
              </div>
            </div>
            <h4 style={{ marginTop: 8 }}>Мы в соцсетях</h4>
            <div className="f-social">
              <a href="#" aria-label="MAX" title="MAX">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 18V6l8 7 8-7v12" />
                </svg>
              </a>
              <a href="#" aria-label="Telegram" title="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.9 4.3l-3.2 15c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.5 13 1.7 11.5c-1-.3-1-1 .2-1.5L20.7 2.8c.9-.3 1.6.2 1.2 1.5z" />
                </svg>
              </a>
              <a href="#" aria-label="WhatsApp" title="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2zm0 2a8 8 0 016.8 12.2l-.3.4.8 2.9-3-.8-.4.2A8 8 0 1112 4zm-3.4 4c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.8.5-.1 1.6-.7 1.9-1.4.2-.6.2-1.2.1-1.3 0-.1-.2-.2-.5-.4l-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.5-.6-2.4-1.6-.7-.7-1.2-1.5-1.3-1.7-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.2-.5s0-.4-.1-.5l-.8-2c-.2-.5-.4-.4-.6-.5h-.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {year} ШАРОДУВЫ · Гелиевые шары в Жуковском
          </span>
          <span>Сделано с любовью 🎈</span>
        </div>
      </div>
    </footer>
  );
}
