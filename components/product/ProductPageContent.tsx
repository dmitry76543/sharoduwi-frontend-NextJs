"use client";

import Link from "next/link";
import { HowToOrderLink } from "@/components/HowToOrderLink";
import type { Product, ProductDetails } from "@/lib/data";
import { fmt } from "@/lib/balloons";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  prepareProductDescription,
  prepareProductLead,
} from "@/lib/product-description";

interface ProductPageContentProps {
  product: ProductDetails;
  relatedProducts: Product[];
}

export function ProductPageContent({
  product,
  relatedProducts,
}: ProductPageContentProps) {
  const tag =
    product.tag === "hit" ? (
      <span className="tag hit product-badge">Хит</span>
    ) : product.tag === "new" ? (
      <span className="tag new product-badge">Новинка</span>
    ) : null;
  const descriptionHtml = prepareProductDescription(
    product.description,
    product.artNo
  );
  const leadHtml = prepareProductLead(product.briefDescription);
  const leadFallback =
    "Гелиевые шары и композиции — надуваем при вас и привозим точно к торжеству.";

  return (
    <section className="sec product-page">
      <div className="wrap">
        <nav className="category-breadcrumb reveal" aria-label="Навигация">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <Link href="/catalog">Каталог</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/categories/${product.collectionSlug}`}>{product.collection}</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-layout reveal">
          <ProductGallery
            name={product.name}
            images={product.images}
            colors={product.colors}
          />

          <div className="product-info">
            <Link href={`/categories/${product.collectionSlug}`} className="card-cat">
              {product.collection}
            </Link>
            <h1>{product.name}</h1>
            {tag}
            <div className="product-price-row">
              {Number.isFinite(product.price) && product.price > 0 && (
                <div className="product-price">
                  {fmt(product.price)} ₽
                  {product.old && (
                    <small>
                      <s>{fmt(product.old)} ₽</s>
                    </small>
                  )}
                </div>
              )}
            </div>
            {leadHtml ? (
              <div
                className="product-lead product-rich-text"
                dangerouslySetInnerHTML={{ __html: leadHtml }}
              />
            ) : (
              <p className="product-lead">{leadFallback}</p>
            )}
            <ProductActions productId={product.id} />
          </div>
        </div>

        <div className="product-details-grid reveal">
          <div className="product-desc">
            <h2>Описание</h2>
            {descriptionHtml ? (
              <div
                className="product-desc-body product-rich-text"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <p className="product-desc-empty">
                Подробное описание скоро появится. Напишите нам — расскажем состав набора и
                поможем с заказом.
              </p>
            )}
            {product.artNo && (
              <p className="product-artno">
                Артикул: <span>{product.artNo}</span>
              </p>
            )}
          </div>

          <div className="product-specs-wrap">
            <h2>Характеристики</h2>
            <dl className="product-specs">
              <div className="product-spec">
                <dt>Коллекция</dt>
                <dd>{product.collection}</dd>
              </div>
              {product.tags.length > 0 && (
                <div className="product-spec">
                  <dt>Тип</dt>
                  <dd>{product.tags.join(", ")}</dd>
                </div>
              )}
              <div className="product-spec">
                <dt>Наполнение</dt>
                <dd>Гелий</dd>
              </div>
              <div className="product-spec">
                <dt>Доставка</dt>
                <dd>Жуковский и Раменский район</dd>
              </div>
            </dl>

            <div className="product-helpful">
              <h3>Полезно перед заказом</h3>
              <ul>
                <li>
                  <HowToOrderLink>Как оформить заказ</HowToOrderLink>
                </li>
                <li>
                  <Link href="/#guarantee">Гарантия на полёт шаров</Link>
                </li>
                <li>
                  <Link href="/#contacts">Контакты и шоурумы в Жуковском</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="product-related reveal">
            <div className="sec-head product-related-head">
              <div className="sec-tag">
                <span className="dot" /> Похожие
              </div>
              <h2>Вам также понравится</h2>
            </div>
            <div className="products">
              {relatedProducts.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
