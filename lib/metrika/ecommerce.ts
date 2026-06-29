type EcommerceProduct = {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
};

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

export function trackEcommerceAdd(product: EcommerceProduct) {
  pushDataLayer({
    ecommerce: {
      currencyCode: "RUB",
      add: {
        products: [
          {
            id: String(product.id),
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            category: product.category,
          },
        ],
      },
    },
  });
}

export function trackEcommercePurchase(
  orderId: string,
  total: number,
  products: EcommerceProduct[]
) {
  pushDataLayer({
    ecommerce: {
      currencyCode: "RUB",
      purchase: {
        actionField: {
          id: orderId,
          revenue: total,
        },
        products: products.map((product) => ({
          id: String(product.id),
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          category: product.category,
        })),
      },
    },
  });
}
