"use client";

import { useApp } from "@/context/AppContext";

interface ProductActionsProps {
  productId: number;
}

export function ProductActions({ productId }: ProductActionsProps) {
  const {
    getCartQty,
    addToCart,
    incrementCart,
    decrementCart,
    isFav,
    toggleFav,
    openCart,
  } = useApp();
  const qty = getCartQty(productId);

  if (qty > 0) {
    return (
      <div className="product-actions">
        <div className="product-qty-stepper">
          <button
            className="qbtn"
            type="button"
            aria-label="Меньше"
            onClick={() => decrementCart(productId)}
          >
            −
          </button>
          <span className="qv">{qty}</span>
          <button
            className="qbtn"
            type="button"
            aria-label="Больше"
            onClick={() => incrementCart(productId)}
          >
            +
          </button>
        </div>
        <button className="btn btn-ghost product-open-cart" type="button" onClick={openCart}>
          Перейти в корзину
        </button>
        <button
          className={`product-fav-btn${isFav(productId) ? " active" : ""}`}
          type="button"
          aria-label="В избранное"
          onClick={() => toggleFav(productId)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.8 5.2a5.5 5.5 0 00-7.8 0L12 6.2l-1-1a5.5 5.5 0 00-7.8 7.8L12 22l8.8-9a5.5 5.5 0 000-7.8z" />
          </svg>
          {isFav(productId) ? "В избранном" : "В избранное"}
        </button>
      </div>
    );
  }

  return (
    <div className="product-actions">
      <button
        className="btn btn-primary product-add-btn"
        type="button"
        onClick={(e) => addToCart(productId, e.clientX, e.clientY)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="9" cy="20" r="1.6" />
          <circle cx="18" cy="20" r="1.6" />
          <path d="M1.5 2.5h3l2.3 12.1a1.7 1.7 0 001.7 1.4h8.4a1.7 1.7 0 001.7-1.3L22 7H6" />
        </svg>
        В корзину
      </button>
      <button
        className={`product-fav-btn${isFav(productId) ? " active" : ""}`}
        type="button"
        aria-label="В избранное"
        onClick={() => toggleFav(productId)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.8 5.2a5.5 5.5 0 00-7.8 0L12 6.2l-1-1a5.5 5.5 0 00-7.8 7.8L12 22l8.8-9a5.5 5.5 0 000-7.8z" />
        </svg>
        {isFav(productId) ? "В избранном" : "В избранное"}
      </button>
    </div>
  );
}
