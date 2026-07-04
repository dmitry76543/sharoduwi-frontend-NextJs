import Link from "next/link";

import { CitiesPageContent } from "@/components/CitiesPageContent";
import { JsonLd } from "@/components/JsonLd";
import { InfoPageShell } from "@/components/InfoPageShell";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, toJsonLdGraph } from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "Место доставки",
  description:
    "Выберите место доставки для заказа гелиевых и воздушных шаров по Жуковскому, Раменскому и всему Раменскому району.",
  path: "/cities",
});

export default function CitiesPage() {
  const schema = toJsonLdGraph(
    buildBreadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Место доставки", path: "/cities" },
    ])
  );

  return (
    <>
      <JsonLd data={schema} />
      <InfoPageShell>
        <section className="sec info-page">
          <div className="wrap">
            <nav className="category-breadcrumb reveal" aria-label="Навигация">
              <Link href="/">Главная</Link>
              <span aria-hidden="true">/</span>
              <span>Место доставки</span>
            </nav>

            <div className="info-hero reveal">
              <div className="sec-tag">
                <span className="dot" /> Регионы доставки
              </div>
              <h1>Выберите место доставки</h1>
              <p className="info-lead">
                У каждого пункта — своя страница с актуальными условиями доставки, контактами и каталогом шаров.
              </p>
            </div>
          </div>
        </section>

        <CitiesPageContent />
      </InfoPageShell>
    </>
  );
}
