import { isCompleteRuPhone } from "@/lib/phone-mask";

export type CheckoutFormData = {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  comment?: string;
};

export function validateCheckoutForm(data: CheckoutFormData): string | null {
  if (!data.name.trim()) return "Укажите имя";
  if (!data.phone.trim()) return "Укажите телефон";
  if (!isCompleteRuPhone(data.phone)) return "Укажите корректный номер телефона";
  if (data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return "Укажите корректный e-mail";
  }
  return null;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  return phone.trim();
}

/** Формат телефона для AdvantShop API: 79001234567 */
export function formatAdvantShopPhone(phone: string): string {
  return normalizePhone(phone).replace(/\D/g, "");
}

export function generateOrderId(): string {
  return `SH-${Date.now()}`;
}

export function getDeliveryFee(): number {
  return 0;
}
