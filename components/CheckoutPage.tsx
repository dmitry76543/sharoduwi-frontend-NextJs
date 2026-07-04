"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CityLink } from "@/components/CityLink";
import { AppProvider, useApp } from "@/context/AppContext";
import { MaybeCityProvider, useCity } from "@/context/CityContext";
import {
  useEscapeKey,
  useHeaderScroll,
  useScrollProgressFallback,
  useScrollReveal,
} from "@/hooks/useSiteEffects";
import { useConfettiCursor } from "@/hooks/useConfettiCursor";
import type { Product } from "@/lib/data";
import type { CatalogSource } from "@/lib/client-catalog-cache";
import type { CartItem } from "@/lib/cart";
import { COLORS } from "@/lib/data";
import { balloonSVG, fmt } from "@/lib/balloons";
import { normalizePhone, validateCheckoutForm } from "@/lib/checkout";
import { getDefaultCity, getCityBySlug, readStoredCitySlug, type CityPublic } from "@/lib/cities";
import { PhoneInput } from "@/components/PhoneInput";
import { trackOrderSent } from "@/lib/metrika/track";
import { getProductSlug } from "@/lib/product-slug";
import { Background } from "@/components/Background";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { MobMenu } from "@/components/MobMenu";
import { Toast } from "@/components/Toast";
import { FabContacts } from "@/components/FabContacts";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ConfettiCursor } from "@/components/ConfettiCursor";

function SiteEffects() {
  const { closeAll, closeMob } = useApp();
  const onEscape = useCallback(() => {
    closeAll();
    closeMob();
  }, [closeAll, closeMob]);

  useScrollReveal();
  useHeaderScroll();
  useScrollProgressFallback();
  useConfettiCursor();
  useEscapeKey(onEscape);

  return null;
}

function resolveCheckoutCityName(cityFromContext: CityPublic | null): string {
  if (cityFromContext?.name) return cityFromContext.name;
  const stored = readStoredCitySlug();
  if (stored) return getCityBySlug(stored)!.name;
  return getDefaultCity().name;
}

function CheckoutContent() {
  const {
    cart,
    clearCart,
    getProduct,
    incrementCart,
    decrementCart,
    removeFromCart,
  } = useApp();
  const { city: ctxCity, linkCitySlug } = useCity();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(() => resolveCheckoutCityName(ctxCity));
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setCity(resolveCheckoutCityName(ctxCity));
  }, [ctxCity?.slug, ctxCity?.name]);

  const { total, rows } = useMemo(() => {
    let total = 0;
    const rows = Object.keys(cart)
      .map((idStr) => {
        const id = parseInt(idStr, 10);
        const p = getProduct(id);
        if (!p) return null;
        const qty = cart[id];
        total += p.price * qty;
        return { p, qty, id };
      })
      .filter(Boolean) as { p: Product; qty: number; id: number }[];
    return { total, rows };
  }, [cart, getProduct]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rows.length || submitting) return;

    setError(null);

    const validationError = validateCheckoutForm({
      name,
      phone,
      email,
      city,
      address,
      comment,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const items: CartItem[] = rows.map(({ p, qty }) => ({
      id: p.id,
      name: p.name,
      image: p.img,
      price: p.price,
      quantity: qty,
      artNo: p.artNo,
      urlPath: p.urlPath,
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: name.trim(),
            phone: normalizePhone(phone),
            email: email.trim(),
            city: city.trim(),
            address: address.trim(),
            comment: comment.trim(),
          },
          citySlug: ctxCity?.slug ?? linkCitySlug ?? undefined,
          items,
          subtotal: total,
        }),
      });

      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Не удалось оформить заказ");
        return;
      }

      const id = data.id ?? "unknown";
      trackOrderSent(
        id,
        total,
        rows.map(({ p, qty }) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          collection: p.collection,
          quantity: qty,
        })),
        city.trim()
      );
      setOrderId(id);
      clearCart();
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз или напишите нам в мессенджер.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <>
        <SiteEffects />
        <ScrollProgress />
        <Background />
        <ConfettiCursor />
        <TopBar />
        <Header />
        <section className="sec category-page checkout-page">
          <div className="wrap">
            <div className="checkout-success reveal in">
              <div className="checkout-success-icon">🎈</div>
              <h1>Заказ принят!</h1>
              <p>
                Номер заказа: <strong>{orderId}</strong>. Мы свяжемся с вами в ближайшее время для
                подтверждения.
              </p>
              <div className="checkout-success-actions">
                <CityLink href="/catalog" className="btn btn-primary">
                  В каталог
                </CityLink>
                <CityLink href="/" className="btn btn-ghost">
                  На главную
                </CityLink>
              </div>
            </div>
          </div>
        </section>
        <Footer />
        <CartDrawer />
        <MobMenu />
        <Toast />
        <FabContacts />
      </>
    );
  }

  return (
    <>
      <SiteEffects />
      <ScrollProgress />
      <Background />
      <ConfettiCursor />
      <TopBar />
      <Header />
      <section className="sec category-page checkout-page">
        <div className="wrap">
          <nav className="category-breadcrumb reveal" aria-label="Навигация">
            <CityLink href="/">Главная</CityLink>
            <span aria-hidden="true">/</span>
            <span>Оформить заказ</span>
          </nav>

          {!rows.length ? (
            <div className="checkout-empty reveal">
              <div className="e-bln">🛒</div>
              <h1>Корзина пуста</h1>
              <p>Добавьте товары из каталога, чтобы оформить заказ.</p>
              <CityLink href="/catalog" className="btn btn-primary">
                Перейти в каталог
              </CityLink>
            </div>
          ) : (
            <div className="checkout-layout">
              <form className="checkout-form reveal" onSubmit={onSubmit}>
                <h1>Оформить заказ</h1>
                <p className="checkout-lead">
                  Заполните контакты и адрес доставки — мы перезвоним для подтверждения.
                </p>

                <label className="checkout-field">
                  <span>Имя *</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как к вам обращаться"
                  />
                </label>

                <label className="checkout-field">
                  <span>Телефон *</span>
                  <PhoneInput
                    name="phone"
                    required
                    value={phone}
                    onChange={setPhone}
                  />
                </label>

                <label className="checkout-field">
                  <span>E-mail — пришлём подтверждение</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.ru"
                  />
                </label>

                <label className="checkout-field">
                  <span>Город</span>
                  <input
                    type="text"
                    name="city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={getDefaultCity().name}
                  />
                </label>

                <label className="checkout-field">
                  <span>Адрес доставки</span>
                  <input
                    type="text"
                    name="address"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Улица, дом, подъезд"
                  />
                </label>

                <label className="checkout-field">
                  <span>Комментарий к заказу</span>
                  <textarea
                    name="comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Время доставки, повод, пожелания"
                  />
                </label>

                {error && (
                  <p className="checkout-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  className="btn btn-primary checkout-submit"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Отправляем…" : "Подтвердить заказ"}
                  {!submitting && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  )}
                </button>
              </form>

              <aside className="checkout-summary reveal" data-d="1">
                <h2>Ваш заказ</h2>
                <ul className="checkout-items">
                  {rows.map(({ p, qty, id }) => (
                    <li className="checkout-item" key={id}>
                      <CityLink href={`/products/${getProductSlug(p)}`} className="checkout-item-main">
                        <div className="checkout-item-vis">
                          {p.img ? (
                            <img src={p.img} alt={p.name} loading="lazy" decoding="async" />
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: balloonSVG(COLORS[p.colors[0]], 36, `co-${id}`),
                              }}
                            />
                          )}
                        </div>
                        <div className="checkout-item-info">
                          <span className="checkout-item-name">{p.name}</span>
                          <span className="checkout-item-price">
                            {fmt(p.price)} ₽ × {qty}
                          </span>
                        </div>
                      </CityLink>
                      <div className="checkout-item-actions">
                        <div className="ci-qty">
                          <button
                            className="qbtn"
                            type="button"
                            aria-label="Уменьшить"
                            onClick={() => decrementCart(id)}
                          >
                            −
                          </button>
                          <span>{qty}</span>
                          <button
                            className="qbtn"
                            type="button"
                            aria-label="Увеличить"
                            onClick={() => incrementCart(id)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="ci-del"
                          type="button"
                          aria-label="Удалить"
                          onClick={() => removeFromCart(id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="checkout-total">
                  <span>Итого:</span>
                  <b>{fmt(total)} ₽</b>
                </div>
                <p className="checkout-note">
                  Точную стоимость доставки уточним при звонке.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
      <Footer />
      <CartDrawer />
      <MobMenu />
      <Toast />
      <FabContacts />
    </>
  );
}

export function CheckoutPage({
  initialProducts = [],
  initialSource = "static",
}: {
  initialProducts?: Product[];
  initialSource?: CatalogSource;
}) {
  const initialCatalog =
    initialProducts.length > 0
      ? { products: initialProducts, source: initialSource }
      : undefined;

  return (
    <MaybeCityProvider>
      <AppProvider initialCatalog={initialCatalog}>
        <CheckoutContent />
      </AppProvider>
    </MaybeCityProvider>
  );
}
