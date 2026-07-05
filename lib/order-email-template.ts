import path from "node:path";

import type { CartItem } from "@/lib/cart";
import type { CheckoutFormData } from "@/lib/checkout";
import { cityPath, DEFAULT_CITY_SLUG } from "@/lib/cities/paths";
import { getProductSlug } from "@/lib/product-slug";
import { SITE_NAME, SITE_PHONE, SITE_URL } from "@/lib/seo/site";

export const ORDER_EMAIL_LOGO_CID = "order-logo@sharoduwi";

export const ORDER_EMAIL_LOGO_PATH = path.join(
  process.cwd(),
  "public",
  "images",
  "logo_mail.png"
);

export type OrderEmailContentInput = {
  orderId: string;
  advantshopOrderNumber?: string;
  customer: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  citySlug?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("ru-RU")} руб.`;
}

function absoluteUrl(relativeOrAbsolute: string): string {
  if (/^https?:\/\//i.test(relativeOrAbsolute)) return relativeOrAbsolute;
  const base = SITE_URL.replace(/\/$/, "");
  const path = relativeOrAbsolute.startsWith("/")
    ? relativeOrAbsolute
    : `/${relativeOrAbsolute}`;
  return `${base}${path}`;
}

function splitCustomerName(fullName: string): {
  firstName: string;
  lastName?: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "Покупатель" };
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

function displayOrderNumber(input: OrderEmailContentInput): string {
  if (input.advantshopOrderNumber?.trim()) {
    return input.advantshopOrderNumber.trim();
  }
  return input.orderId.replace(/^SH-/, "");
}

function productHref(item: CartItem, citySlug?: string): string {
  const slug = getProductSlug({
    id: item.id,
    name: item.name,
    urlPath: item.urlPath,
  });
  const relative = cityPath(citySlug ?? DEFAULT_CITY_SLUG, `/products/${slug}`);
  return absoluteUrl(relative);
}

function productImageSrc(item: CartItem): string | null {
  if (!item.image?.trim()) return null;
  return absoluteUrl(item.image.trim());
}

function buildCustomerRows(customer: CheckoutFormData): string {
  const { firstName, lastName } = splitCustomerName(customer.name);
  const rows: [string, string][] = [["Имя", firstName]];

  if (lastName) rows.push(["Фамилия", lastName]);
  rows.push(["Контактный телефон", customer.phone]);
  if (customer.email?.trim()) rows.push(["E-mail", customer.email.trim()]);
  rows.push(["Страна", "Россия"]);
  if (customer.city?.trim()) rows.push(["Город", customer.city.trim()]);
  if (customer.address?.trim()) rows.push(["Адрес", customer.address.trim()]);

  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:4px 0;font-size:14px;color:#111827;">${escapeHtml(value)}</td></tr>`
    )
    .join("");
}

function buildOrderItemsRows(
  items: CartItem[],
  citySlug?: string
): string {
  return items
    .map((item) => {
      const href = productHref(item, citySlug);
      const imageSrc = productImageSrc(item);
      const lineTotal = item.price * item.quantity;
      const thumb = imageSrc
        ? `<a href="${escapeHtml(href)}" style="text-decoration:none;"><img src="${escapeHtml(imageSrc)}" alt="" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid #f3e8ef;background:#fff;" /></a>`
        : `<div style="width:72px;height:72px;border-radius:10px;background:#fff5fa;border:1px solid #f3e8ef;"></div>`;

      return `
        <tr>
          <td style="padding:14px 10px 14px 0;border-bottom:1px solid #f3e8ef;vertical-align:top;width:82px;">${thumb}</td>
          <td style="padding:14px 10px;border-bottom:1px solid #f3e8ef;vertical-align:top;">
            <a href="${escapeHtml(href)}" style="color:#2563eb;font-size:14px;line-height:1.45;text-decoration:none;font-weight:600;">${escapeHtml(item.name)}</a>
          </td>
          <td style="padding:14px 8px;border-bottom:1px solid #f3e8ef;vertical-align:top;text-align:right;font-size:14px;color:#111827;white-space:nowrap;">${escapeHtml(formatMoney(item.price))}</td>
          <td style="padding:14px 8px;border-bottom:1px solid #f3e8ef;vertical-align:top;text-align:center;font-size:14px;color:#111827;white-space:nowrap;">${item.quantity} шт</td>
          <td style="padding:14px 0 14px 8px;border-bottom:1px solid #f3e8ef;vertical-align:top;text-align:right;font-size:14px;font-weight:700;color:#111827;white-space:nowrap;">${escapeHtml(formatMoney(lineTotal))}</td>
        </tr>`;
    })
    .join("");
}

function buildCommentsBlock(
  customer: CheckoutFormData,
  citySlug?: string
): string {
  const parts: string[] = [];
  if (customer.comment?.trim()) parts.push(customer.comment.trim());
  if (citySlug?.trim()) parts.push(`Регион сайта (slug): ${citySlug.trim()}`);

  if (!parts.length) return "";

  const text = parts.map((part) => escapeHtml(part)).join("<br />");

  return `
    <tr>
      <td style="padding:20px 28px 28px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#111827;">Ваши комментарии к заказу</p>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#374151;">${text}</p>
      </td>
    </tr>`;
}

export function buildOrderConfirmationEmail(input: OrderEmailContentInput): {
  html: string;
  text: string;
} {
  const { firstName } = splitCustomerName(input.customer.name);
  const orderNumber = displayOrderNumber(input);
  const shippingName = "Доставка по согласованию";
  const paymentName = "Согласование при звонке";
  const deliveryRow =
    input.deliveryFee > 0
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#374151;text-align:right;">Доставка</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;color:#111827;text-align:right;white-space:nowrap;">${escapeHtml(formatMoney(input.deliveryFee))}</td></tr>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Заказ ${escapeHtml(orderNumber)} — ${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:#fff5fa;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff5fa;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ffd4e9;box-shadow:0 8px 28px rgba(255,45,149,0.08);">
          <tr>
            <td style="padding:24px 28px 18px;border-bottom:1px solid #f3e8ef;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <a href="${escapeHtml(SITE_URL)}" style="text-decoration:none;">
                      <img src="cid:${ORDER_EMAIL_LOGO_CID}" alt="${escapeHtml(SITE_NAME)}" width="180" style="display:block;max-width:180px;height:auto;border:0;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align:middle;font-size:18px;font-weight:700;color:#111827;white-space:nowrap;">
                    <a href="tel:${SITE_PHONE.replace(/[^\d+]/g, "")}" style="color:#111827;text-decoration:none;">${escapeHtml(SITE_PHONE)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#111827;">Здравствуйте, <strong>${escapeHtml(firstName)}</strong>!</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Благодарим Вас за заказ. В ближайшее время с Вами свяжется наш оператор для его подтверждения.</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#111827;"><strong>Номер заказа:</strong> ${escapeHtml(orderNumber)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:50%;padding:16px 12px 16px 0;vertical-align:top;">
                    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#111827;">Информация о покупателе</p>
                    <table role="presentation" cellspacing="0" cellpadding="0">${buildCustomerRows(input.customer)}</table>
                  </td>
                  <td style="width:50%;padding:16px 0 16px 12px;vertical-align:top;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#111827;">Метод доставки</p>
                    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(shippingName)}</p>
                    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#111827;">Метод оплаты</p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(paymentName)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0;">
              <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111827;">Содержание заказа</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #f3e8ef;">
                <tr>
                  <td style="padding:10px 10px 10px 0;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #f3e8ef;">Товар</td>
                  <td style="padding:10px;border-bottom:1px solid #f3e8ef;"></td>
                  <td style="padding:10px 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;text-align:right;border-bottom:1px solid #f3e8ef;white-space:nowrap;">Цена</td>
                  <td style="padding:10px 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;text-align:center;border-bottom:1px solid #f3e8ef;white-space:nowrap;">Кол-во</td>
                  <td style="padding:10px 0 10px 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;text-align:right;border-bottom:1px solid #f3e8ef;white-space:nowrap;">Стоимость</td>
                </tr>
                ${buildOrderItemsRows(input.items, input.citySlug)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="right">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="min-width:260px;">
                      <tr><td style="padding:6px 0;font-size:14px;color:#374151;text-align:right;">Стоимость заказа</td><td style="padding:6px 0 6px 16px;font-size:14px;font-weight:600;color:#111827;text-align:right;white-space:nowrap;">${escapeHtml(formatMoney(input.subtotal))}</td></tr>
                      ${deliveryRow}
                      <tr><td style="padding:10px 0 0;font-size:16px;font-weight:700;color:#111827;text-align:right;border-top:1px solid #f3e8ef;">Итого</td><td style="padding:10px 0 0 16px;font-size:16px;font-weight:800;color:#D81271;text-align:right;white-space:nowrap;border-top:1px solid #f3e8ef;">${escapeHtml(formatMoney(input.total))}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${buildCommentsBlock(input.customer, input.citySlug)}
          <tr>
            <td style="padding:0 28px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:#6b7280;text-align:center;">
                ${escapeHtml(SITE_NAME)} · <a href="${escapeHtml(SITE_URL)}" style="color:#FF2D95;text-decoration:none;">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const itemLines = input.items.map(
    (item) =>
      `${item.name} — ${item.quantity} шт × ${formatMoney(item.price)} = ${formatMoney(item.price * item.quantity)}`
  );

  const text = [
    `Здравствуйте, ${firstName}!`,
    "",
    "Благодарим Вас за заказ. В ближайшее время с Вами свяжется наш оператор для его подтверждения.",
    "",
    `Номер заказа: ${orderNumber}`,
    "",
    `Телефон: ${input.customer.phone}`,
    input.customer.email?.trim() ? `E-mail: ${input.customer.email.trim()}` : "",
    input.customer.city?.trim() ? `Город: ${input.customer.city.trim()}` : "",
    input.customer.address?.trim() ? `Адрес: ${input.customer.address.trim()}` : "",
    "",
    `Доставка: ${shippingName}`,
    `Оплата: ${paymentName}`,
    "",
    "Содержание заказа:",
    ...itemLines,
    "",
    `Стоимость заказа: ${formatMoney(input.subtotal)}`,
    input.deliveryFee > 0
      ? `Доставка: ${formatMoney(input.deliveryFee)}`
      : "",
    `Итого: ${formatMoney(input.total)}`,
    "",
    input.customer.comment?.trim()
      ? `Комментарий: ${input.customer.comment.trim()}`
      : "",
    "",
    SITE_PHONE,
    SITE_URL,
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}
