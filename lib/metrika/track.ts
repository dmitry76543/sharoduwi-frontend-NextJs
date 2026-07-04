import { parseCityFromPathname } from "@/lib/cities/paths";

import { trackEcommerceAdd, trackEcommercePurchase } from "@/lib/metrika/ecommerce";
import { METRIKA_GOALS } from "@/lib/metrika/goals";
import { reachGoal } from "@/lib/metrika/reach-goal";
import {
  markAddToCartSession,
  markCheckoutVisited,
  markContactMade,
  markDeliveryVisited,
  markOrderSent,
  markProductViewed,
} from "@/lib/metrika/session";

type CartProduct = {
  id: number;
  name: string;
  price: number;
  collection: string;
  quantity?: number;
};

type OrderItem = CartProduct & { quantity: number };

export function trackFabOpen() {
  reachGoal(METRIKA_GOALS.FAB_OPEN);
}

export function trackAddToCart(product: CartProduct) {
  const quantity = product.quantity ?? 1;
  reachGoal(METRIKA_GOALS.ADD_TO_CART, {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    collection: product.collection,
    quantity,
  });
  trackEcommerceAdd({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
    category: product.collection,
  });
  markAddToCartSession();
}

export function trackCheckoutButtonClick(total: number, items: number) {
  reachGoal(METRIKA_GOALS.CLICK_CHECKOUT_BUTTON, { total, items });
}

export function trackOrderSent(
  orderId: string,
  total: number,
  items: OrderItem[],
  deliveryCity?: string
) {
  markOrderSent();
  reachGoal(METRIKA_GOALS.ORDER_SENT, {
    order_id: orderId,
    total,
    items: items.length,
    ...(deliveryCity ? { delivery_city: deliveryCity } : {}),
  });
  trackEcommercePurchase(
    orderId,
    total,
    items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.collection,
    }))
  );
}

export function trackClickCall(href: string) {
  markContactMade();
  reachGoal(METRIKA_GOALS.CLICK_CALL, { href });
  reachGoal(METRIKA_GOALS.CLICK_MESSENGER, { channel: "phone" });
}

export function trackClickWhatsApp(href: string) {
  markContactMade();
  reachGoal(METRIKA_GOALS.CLICK_MESSENGER_WHATSAPP, { href });
  reachGoal(METRIKA_GOALS.CLICK_MESSENGER, { channel: "whatsapp" });
}

export function trackClickTelegram(href: string) {
  markContactMade();
  reachGoal(METRIKA_GOALS.CLICK_MESSENGER_TELEGRAM, { href });
  reachGoal(METRIKA_GOALS.CLICK_MESSENGER, { channel: "telegram" });
}

export function trackClickMax(href: string) {
  markContactMade();
  reachGoal(METRIKA_GOALS.CLICK_MESSENGER_MAX, { href });
  reachGoal(METRIKA_GOALS.CLICK_MESSENGER, { channel: "max" });
}

export function trackPagePath(pathname: string) {
  const { restPath } = parseCityFromPathname(pathname);
  const pathParams = { path: pathname, page: restPath };

  if (restPath.startsWith("/checkout")) {
    markCheckoutVisited();
    reachGoal(METRIKA_GOALS.VISIT_CHECKOUT, pathParams);
    return;
  }

  if (restPath.startsWith("/products/")) {
    markProductViewed();
    reachGoal(METRIKA_GOALS.VISIT_PRODUCT, pathParams);
    return;
  }

  if (restPath === "/catalog") {
    reachGoal(METRIKA_GOALS.VISIT_CATALOG, pathParams);
    return;
  }

  if (restPath.startsWith("/delivery")) {
    markDeliveryVisited();
    reachGoal(METRIKA_GOALS.VISIT_DELIVERY, pathParams);
    return;
  }

  if (restPath === "/reviews") {
    reachGoal(METRIKA_GOALS.VISIT_REVIEWS, pathParams);
    return;
  }

  if (restPath === "/about") {
    reachGoal(METRIKA_GOALS.VISIT_ABOUT, pathParams);
    return;
  }

  if (restPath === "/blog" || restPath.startsWith("/blog/")) {
    reachGoal(METRIKA_GOALS.VISIT_BLOG, pathParams);
    return;
  }

  if (restPath.startsWith("/categories/")) {
    reachGoal(METRIKA_GOALS.VISIT_COLLECTION, pathParams);
  }
}

export function trackCatalogSection() {
  reachGoal(METRIKA_GOALS.VISIT_CATALOG, { source: "home_shop_section" });
}

export function trackOutboundLink(href: string) {
  const normalized = href.toLowerCase();

  if (normalized.startsWith("tel:")) {
    trackClickCall(href);
    return;
  }

  if (normalized.includes("wa.me") || normalized.includes("whatsapp.com")) {
    trackClickWhatsApp(href);
    return;
  }

  if (normalized.includes("t.me") || normalized.includes("telegram.me")) {
    trackClickTelegram(href);
    return;
  }

  if (normalized.includes("max.ru")) {
    trackClickMax(href);
  }
}
