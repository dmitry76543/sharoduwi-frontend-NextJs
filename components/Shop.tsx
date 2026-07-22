"use client";

import { CityLink } from "@/components/CityLink";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { CatalogCollectionGrid } from "@/components/CatalogCollectionGrid";
import { TAGS, getCollectionBySlug } from "@/lib/data";
import { productMatchesTag, type CollectionSlug } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

interface ShopProps {
  /** Фиксированная коллекция (страница категории) */
  pageCollection?: CollectionSlug;
  heading?: string;
  description?: string;
  /** На главной — показать только N товаров и кнопку «Больше шаров» */
  previewLimit?: number;
}

export function Shop({ pageCollection, heading, description, previewLimit }: ShopProps) {
  const {
    activeTag,
    setActiveTag,
    activeCollection,
    setActiveCollection,
    favOnly,
    favCount,
    clearFavorites,
    isFav,
    products,
    catalogLoading,
  } = useApp();

  const collectionFilter = pageCollection ?? activeCollection;
  const activeCollectionName = collectionFilter
    ? getCollectionBySlug(collectionFilter)?.name
    : null;
  const isCategoryPage = Boolean(pageCollection);
  const isPreview = previewLimit != null && !isCategoryPage;
  const isFullCatalog = !isPreview && !favOnly && !isCategoryPage;

  const list = useMemo(() => {
    return products.filter((p) => {
      const okTag = isFullCatalog ? productMatchesTag(p, activeTag) : true;
      const okCollection =
        !collectionFilter || p.collectionSlug === collectionFilter;
      const okFav = !favOnly || isFav(p.id);
      return okTag && okCollection && okFav;
    });
  }, [activeTag, collectionFilter, favOnly, isFav, isFullCatalog, products]);

  const visibleList = isPreview && !favOnly ? list.slice(0, previewLimit) : list;
  const hasMore = isPreview && !favOnly && list.length > previewLimit;

  return (
    <section className="sec" id="shop">
      <div className="wrap">
        <div className="sec-head reveal">
          <div className="sec-tag">
            <span className="dot" />{" "}
            {favOnly ? "Избранное" : isCategoryPage ? "Коллекция" : "Каталог"}
          </div>
          <h2>
            {favOnly
              ? favCount > 0
                ? `Избранное · ${favCount}`
                : "Избранное"
              : (heading ?? "Гелиевые и воздушные шары")}
          </h2>
          {favOnly && favCount > 0 && (
            <div className="shop-fav-actions">
              <button
                type="button"
                className="chip shop-fav-clear"
                onClick={clearFavorites}
              >
                Очистить избранное
              </button>
            </div>
          )}
          {favOnly ? (
            favCount === 0 && (
              <p>Нажмите ♡ на товаре, чтобы добавить его сюда.</p>
            )
          ) : (
            description && <p>{description}</p>
          )}
        </div>
        {activeCollectionName && !isCategoryPage && !isPreview && (
          <div className="shop-collection-filter reveal">
            <span>Коллекция: {activeCollectionName}</span>
            <button
              type="button"
              className="chip active"
              onClick={() => setActiveCollection(null)}
            >
              Сбросить
            </button>
          </div>
        )}
        {isCategoryPage && (
          <div className="shop-collection-filter reveal">
            <CityLink href="/catalog" className="chip">
              ← Полный каталог
            </CityLink>
            <CityLink href="/#collections" className="chip">
              Все коллекции
            </CityLink>
          </div>
        )}
        {isFullCatalog && (
        <div className="shop-controls reveal">
          <div className="shop-filters-stack">
            <div className="filters" id="filters">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  className={`chip${activeTag === tag ? " active" : ""}`}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <CatalogCollectionGrid activeSlug={collectionFilter} />
          </div>
        </div>
        )}
        <div className="products" id="products">
          {catalogLoading && !visibleList.length ? (
            <div className="empty">Шары на подлёте...</div>
          ) : !visibleList.length ? (
            <div className="empty">
              🎈{" "}
              {favOnly
                ? "В избранном пока пусто. Нажмите ♡ на товаре."
                : isCategoryPage
                  ? "Этот товар не найден."
                  : "Ничего не нашли. Попробуйте другой запрос."}
            </div>
          ) : (
            visibleList.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))
          )}
        </div>
        {hasMore && (
          <div className="more-wrap reveal">
            <CityLink href="/catalog" className="more-btn shop-more-btn">
              <span>Больше шаров</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </CityLink>
          </div>
        )}
      </div>
    </section>
  );
}
