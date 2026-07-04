import { FAQ_ITEMS } from "@/lib/data";

export function FAQSection({ items = FAQ_ITEMS }: { items?: { q: string; a: string }[] }) {
  return (
    <section className="sec" id="faq">
      <div className="wrap">
        <div className="sec-head reveal">
          <div className="sec-tag">
            <span className="dot" /> Вопросы
          </div>
          <h2>Частые вопросы</h2>
        </div>
        <div className="faq reveal">
          {items.map((item) => (
            <details key={item.q}>
              <summary>
                <span className="q-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                {item.q}
              </summary>
              <div className="ans">
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
