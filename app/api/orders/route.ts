import { NextResponse } from "next/server";

import { submitAdvantShopOrder } from "@/lib/advantshop/orders";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import type { CartItem } from "@/lib/cart";
import {
  generateOrderId,
  getDeliveryFee,
  validateCheckoutForm,
  type CheckoutFormData,
} from "@/lib/checkout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CreateOrderRequest = {
  customer: CheckoutFormData;
  items: CartItem[];
  subtotal?: number;
  citySlug?: string;
};

export async function POST(request: Request) {
  let body: CreateOrderRequest;

  try {
    body = (await request.json()) as CreateOrderRequest;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!body.customer || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const customer: CheckoutFormData = {
    name: body.customer.name?.trim() ?? "",
    phone: body.customer.phone?.trim() ?? "",
    email: body.customer.email?.trim() ?? "",
    city: body.customer.city?.trim() ?? "",
    address: body.customer.address?.trim() ?? "",
    comment: body.customer.comment?.trim() ?? "",
  };

  const validationError = validateCheckoutForm(customer);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (!isAdvantShopConfigured()) {
    return NextResponse.json(
      { error: "Интеграция с AdvantShop не настроена" },
      { status: 503 }
    );
  }

  const subtotal =
    typeof body.subtotal === "number"
      ? body.subtotal
      : body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;
  const orderId = generateOrderId();

  try {
    const advantshop = await submitAdvantShopOrder({
      orderId,
      customer,
      items: body.items,
      deliveryFee,
      citySlug: body.citySlug?.trim() || undefined,
    });

    return NextResponse.json({
      id: orderId,
      advantshopOrderId: advantshop.advantshopOrderId,
      advantshopOrderNumber: advantshop.advantshopOrderNumber,
      deliveryFee,
      total,
    });
  } catch (error) {
    console.error("Order error:", error);
    const message =
      error instanceof Error ? error.message : "Не удалось оформить заказ";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
