"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";
import { CityLink } from "@/components/CityLink";
import { useFullCatalogSearch } from "@/hooks/useFullCatalogSearch";
import { fmt } from "@/lib/balloons";
import { productMatchesSearch } from "@/lib/products";
import { getProductSlug } from "@/lib/product-slug";
import type { Product } from "@/lib/data";

const PREVIEW_LIMIT = 8;

interface HeaderSearchModalProps {
  query: string;
  open: boolean;
  onClose: () => void;
  onGoToResults: (query: string) => void;
  onSelectProduct: () => void;
}

function ResultRow({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  const price =
    product.price != null && product.price > 0
      ? `${fmt(product.price)} ₽`
      : "уточняйте цену";

  return (
    <CityLink
      href={`/products/${getProductSlug(product)}`}
      className="head-search-result"
      onClick={onSelect}
    >
      <span className="head-search-result-thumb" aria-hidden="true">
        {product.img ? (
          <img src={product.img} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="head-search-result-thumb-fallback" />
        )}
      </span>
      <span className="head-search-result-body">
        <span className="head-search-result-name">{product.name}</span>
        <span className="head-search-result-meta">
          {product.artNo ? `арт. ${product.artNo}` : product.collection}
        </span>
      </span>
      <span className="head-search-result-price">{price}</span>
    </CityLink>
  );
}

export function HeaderSearchModal({
  query,
  open,
  onClose,
  onGoToResults,
  onSelectProduct,
}: HeaderSearchModalProps) {
  const trimmed = query.trim();
  const { products, loading } = useFullCatalogSearch(open && Boolean(trimmed));

  const matches = useMemo(() => {
    if (!trimmed) return [];
    return products.filter((product) => productMatchesSearch(product, trimmed));
  }, [products, trimmed]);

  const preview = matches.slice(0, PREVIEW_LIMIT);
  const hasMore = matches.length > PREVIEW_LIMIT;

  if (!open || !trimmed || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="head-search-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="head-search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Результаты поиска"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="head-search-modal-head">
          <h2>Результаты поиска</h2>
          <p>
            {loading && !matches.length
              ? "Шары на подлёте..."
              : matches.length
                ? `Найдено: ${matches.length}`
                : "Ничего не нашли"}
          </p>
          <button
            type="button"
            className="head-search-modal-close"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="head-search-modal-list">
          {loading && !preview.length ? (
            <div className="head-search-modal-empty">Шары на подлёте...</div>
          ) : !preview.length ? (
            <div className="head-search-modal-empty">
              Ничего не нашли по запросу «{trimmed}»
            </div>
          ) : (
            preview.map((product) => (
              <ResultRow
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))
          )}
        </div>

        <div className="head-search-modal-foot">
          <button
            type="button"
            className="btn btn-primary head-search-modal-go"
            onClick={() => onGoToResults(trimmed)}
          >
            Перейти
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          {hasMore && (
            <span className="head-search-modal-more">
              Ещё {matches.length - PREVIEW_LIMIT} на странице поиска
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
