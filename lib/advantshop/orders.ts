import type { CartItem } from "@/lib/cart";
import type { CheckoutFormData } from "@/lib/checkout";
import { formatAdvantShopPhone } from "@/lib/checkout";
import { findAdvantShopProductById } from "@/lib/advantshop/catalog";
import { advantshopFetch } from "./client";
import { isAdvantShopConfigured } from "./config";
import type { AdvantShopOrderAddResponse } from "./types";

type AdvantShopOrderItem = {
  ArtNo: string;
  Name: string;
  Price: number;
  Amount: number;
};

type AdvantShopOrderPayload = {
  OrderCustomer: {
    FirstName: string;
    LastName?: string;
    Phone: string;
    Email?: string;
    City?: string;
    Street?: string;
    Apartment?: string;
    Country?: string;
  };
  Number: string;
  OrderSource: string;
  Currency: string;
  CustomerComment?: string;
  ShippingName: string;
  ShippingCost: number;
  CheckOrderItemExist: boolean;
  CheckOrderItemAvailable: boolean;
  OrderItems: AdvantShopOrderItem[];
};

export type SubmitStorefrontOrderInput = {
  orderId: string;
  customer: CheckoutFormData;
  items: CartItem[];
  deliveryFee: number;
  /** Slug региона с сайта (zhukovskiy, ramenskoe, …) */
  citySlug?: string;
};

export type SubmitStorefrontOrderResult = {
  advantshopOrderId?: number;
  advantshopOrderNumber?: string;
};

function formatAdvantShopErrors(errors: string | string[] | undefined): string {
  if (Array.isArray(errors)) return errors.join(", ");
  return errors ?? "Не удалось создать заказ в AdvantShop";
}

function splitCustomerName(fullName: string): { firstName: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "Покупатель" };
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

async function resolveArtNo(item: CartItem): Promise<string> {
  if (item.artNo?.trim()) return item.artNo.trim();

  const product = await findAdvantShopProductById(item.id);
  if (product?.artNo?.trim()) return product.artNo.trim();

  throw new Error(`Не найден артикул AdvantShop для «${item.name}». Обновите корзину.`);
}

function buildCustomerComment(input: SubmitStorefrontOrderInput): string | undefined {
  const parts: string[] = [];
  if (input.customer.comment?.trim()) {
    parts.push(input.customer.comment.trim());
  }
  if (input.customer.city?.trim()) {
    parts.push(`Населённый пункт: ${input.customer.city.trim()}`);
  }
  if (input.citySlug?.trim()) {
    parts.push(`Регион сайта (slug): ${input.citySlug.trim()}`);
  }
  return parts.length > 0 ? parts.join("\n\n") : undefined;
}

function buildOrderPayload(
  input: SubmitStorefrontOrderInput,
  orderItems: AdvantShopOrderItem[]
): AdvantShopOrderPayload {
  const { firstName, lastName } = splitCustomerName(input.customer.name);
  const phone = formatAdvantShopPhone(input.customer.phone);
  const email = input.customer.email?.trim();
  const customerComment = buildCustomerComment(input);

  return {
    OrderCustomer: {
      FirstName: firstName,
      LastName: lastName,
      Phone: phone,
      ...(email ? { Email: email } : {}),
      Country: "Россия",
      City: input.customer.city?.trim() || "Жуковский",
      Street: input.customer.address?.trim() || "Самовывоз / уточнить при звонке",
    },
    Number: input.orderId.replace(/^SH-/, ""),
    OrderSource: input.citySlug
      ? `${process.env.ADVANTSHOP_ORDER_SOURCE?.trim() || "sharoduwi.ru"} · ${input.citySlug}`
      : process.env.ADVANTSHOP_ORDER_SOURCE?.trim() || "sharoduwi.ru",
    Currency: "RUB",
    CustomerComment: customerComment,
    ShippingName: "Доставка по согласованию",
    ShippingCost: input.deliveryFee,
    CheckOrderItemExist: true,
    CheckOrderItemAvailable: false,
    OrderItems: orderItems,
  };
}

export async function submitAdvantShopOrder(
  input: SubmitStorefrontOrderInput
): Promise<SubmitStorefrontOrderResult> {
  if (!isAdvantShopConfigured()) {
    throw new Error("AdvantShop не настроен на сервере");
  }

  const orderItems: AdvantShopOrderItem[] = [];

  for (const item of input.items) {
    const artNo = await resolveArtNo(item);
    orderItems.push({
      ArtNo: artNo,
      Name: item.name,
      Price: item.price,
      Amount: item.quantity,
    });
  }

  const payload = buildOrderPayload(input, orderItems);
  return postAdvantShopOrder(payload);
}

async function postAdvantShopOrder(
  payload: AdvantShopOrderPayload,
  baseUrl?: string
): Promise<SubmitStorefrontOrderResult> {
  const response = await advantshopFetch<AdvantShopOrderAddResponse>(
    "/api/order/add",
    {
      method: "POST",
      body: payload,
      revalidate: false,
    },
    baseUrl
  );

  if (response.result === false) {
    throw new Error(formatAdvantShopErrors(response.errors));
  }

  return {
    advantshopOrderId: response.obj?.Id,
    advantshopOrderNumber: response.obj?.Number,
  };
}
