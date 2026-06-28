"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import type { Product } from "@/lib/data";
import { COLORS } from "@/lib/data";
import { getProductSlug } from "@/lib/product-slug";
import { cluster, fmt, hexa } from "@/lib/balloons";

function CartControl({ id }: { id: number }) {
  const { getCartQty, addToCart, incrementCart, decrementCart } = useApp();
  const q = getCartQty(id);

  if (q > 0) {
    return (
      <div className="qty-stepper">
        <button
          className="qbtn"
          type="button"
          aria-label="Меньше"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            decrementCart(id);
          }}
        >
          −
        </button>
        <span className="qv">{q}</span>
        <button
          className="qbtn"
          type="button"
          aria-label="Больше"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            incrementCart(id);
          }}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      className="add-btn"
      type="button"
      aria-label="В корзину"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(id, e.clientX, e.clientY);
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isFav, toggleFav } = useApp();
  const href = `/products/${getProductSlug(product)}`;
  const tag =
    product.tag === "hit" ? (
      <span className="tag hit">Хит</span>
    ) : product.tag === "new" ? (
      <span className="tag new">Новинка</span>
    ) : null;
  const bgTint = product.img
    ? undefined
    : {
        background: `linear-gradient(160deg,${hexa(COLORS[product.colors[0]], 0.16)},${hexa(COLORS[product.colors[product.colors.length - 1]], 0.1)})`,
      };

  return (
    <article
      className="card"
      data-pid={product.id}
      style={{
        animation: "ciIn .5s var(--ease) both",
        animationDelay: index * 0.04 + "s",
      }}
    >
      <Link href={href} className="card-vis-link" aria-label={product.name}>
        <div className="card-vis" style={bgTint}>
          {tag}
          {product.img ? (
            <img
              className="vis-photo"
              src={product.img}
              alt={product.name}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className="vis-balloons"
              dangerouslySetInnerHTML={{
                __html: cluster(product.colors, 70, `p-${product.id}`),
              }}
            />
          )}
          <button
            className={`fav-heart${isFav(product.id) ? " on" : ""}`}
            type="button"
            aria-label="В избранное"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFav(product.id);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M20.8 5.2a5.5 5.5 0 00-7.8 0L12 6.2l-1-1a5.5 5.5 0 00-7.8 7.8L12 22l8.8-9a5.5 5.5 0 000-7.8z" />
            </svg>
          </button>
        </div>
      </Link>
      <div className="card-body">
        <Link href={href} className="card-text-link">
          <span className="card-cat">{product.collection}</span>
          <h3>{product.name}</h3>
        </Link>
        <div className="card-foot">
          <div className="card-price">
            {fmt(product.price)} ₽
            {product.old && (
              <>
                {" "}
                <small>
                  <s>{fmt(product.old)}</s>
                </small>
              </>
            )}
          </div>
          <div className="card-cart">
            <CartControl id={product.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
