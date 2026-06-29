/** Идентификаторы целей для настройки в интерфейсе Яндекс.Метрики (тип: JavaScript-событие) */
export const METRIKA_GOALS = {
  ORDER_SENT: "order_sent",
  CLICK_CALL: "click_call",
  CLICK_MESSENGER: "click_messenger",
  CLICK_MESSENGER_WHATSAPP: "click_messenger_whatsapp",
  CLICK_MESSENGER_TELEGRAM: "click_messenger_telegram",
  CLICK_MESSENGER_MAX: "click_messenger_max",
  FAB_OPEN: "fab_open",
  ADD_TO_CART: "add_to_cart",
  CLICK_CHECKOUT_BUTTON: "click_checkout_button",
  VISIT_CHECKOUT: "visit_checkout",
  VISIT_PRODUCT: "visit_product",
  VISIT_CATALOG: "visit_catalog",
  VISIT_DELIVERY: "visit_delivery",
  VISIT_REVIEWS: "visit_reviews",
  VISIT_ABOUT: "visit_about",
  VISIT_BLOG: "visit_blog",
  VISIT_COLLECTION: "visit_collection",
  QUALIFIED_VISIT: "qualified_visit",
  DEEP_INTEREST: "deep_interest",
  ALMOST_ORDER: "almost_order",
  LOCAL_CLIENT: "local_client",
} as const;

export type MetrikaGoal = (typeof METRIKA_GOALS)[keyof typeof METRIKA_GOALS];
