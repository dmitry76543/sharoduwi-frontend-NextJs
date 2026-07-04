"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CitySearchField } from "@/components/CitySearchField";
import {
  filterCitiesByQuery,
  getPrimaryCities,
  getSecondaryCities,
  type CityPublic,
} from "@/lib/cities";

export function CitiesPageContent() {
  const [query, setQuery] = useState("");
  const primary = getPrimaryCities();
  const allSecondary = getSecondaryCities();

  const filteredPrimary = useMemo(
    () => filterCitiesByQuery(primary, query),
    [primary, query]
  );
  const filteredSecondary = useMemo(
    () => filterCitiesByQuery(allSecondary, query),
    [allSecondary, query]
  );

  const isSearching = query.trim().length > 0;
  const totalFound = filteredPrimary.length + filteredSecondary.length;

  return (
    <>
      <section className="sec info-page-section cities-search-section">
        <div className="wrap">
          <CitySearchField
            id="cities-page-search"
            value={query}
            onChange={setQuery}
            placeholder="Найти населённый пункт…"
          />
          {isSearching && (
            <p className="city-search-meta reveal in">
              {totalFound > 0
                ? `Найдено: ${totalFound}`
                : "Ничего не найдено — попробуйте другое название"}
            </p>
          )}
        </div>
      </section>

      {(!isSearching || filteredPrimary.length > 0) && (
        <section className="sec info-page-section">
          <div className="wrap">
            <div className="cities-grid reveal in">
              <h2>Города</h2>
              <div className="cities-cards">
                {filteredPrimary.map((city) => (
                  <CityCard key={city.slug} city={city} />
                ))}
              </div>
              {isSearching && filteredPrimary.length === 0 && (
                <p className="city-search-empty">В разделе «Города» совпадений нет</p>
              )}
            </div>
          </div>
        </section>
      )}

      {(!isSearching || filteredSecondary.length > 0) && (
        <section className="sec info-page-section">
          <div className="wrap">
            <div className="cities-grid reveal in">
              <h2>
                {isSearching
                  ? `Сёла, Посёлки и Деревни (${filteredSecondary.length})`
                  : "Сёла, Посёлки и Деревни"}
              </h2>
              <ul className="cities-list">
                {filteredSecondary.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/${city.slug}/`}>{city.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {isSearching && totalFound === 0 && (
        <section className="sec info-page-section">
          <div className="wrap">
            <p className="city-search-empty reveal in">
              Проверьте написание или{" "}
              <button type="button" className="city-search-reset" onClick={() => setQuery("")}>
                сбросьте поиск
              </button>
              , чтобы увидеть полный список.
            </p>
          </div>
        </section>
      )}

      <section className="sec info-page-section">
        <div className="wrap">
          <p className="reveal in">
            <Link href="/" className="info-link">
              ← На главную без выбора места доставки
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

function CityCard({ city }: { city: CityPublic }) {
  return (
    <Link href={`/${city.slug}/`} className="city-card city-card--primary">
      <h3>{city.name}</h3>
      <p>{city.seo.homeDescription.slice(0, 120)}…</p>
      {city.hasStores && <span className="city-card-tag">2 магазина</span>}
    </Link>
  );
}
