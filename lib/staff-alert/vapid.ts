export function getVapidPublicKey(): string {
  return (
    process.env.VAPID_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    ""
  ).trim();
}

export function getVapidPrivateKey(): string {
  return (process.env.VAPID_PRIVATE_KEY || "").trim();
}

export function getVapidSubject(): string {
  return (process.env.VAPID_SUBJECT || "mailto:admin@sharoduwi.ru").trim();
}

export function isVapidConfigured(): boolean {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}
