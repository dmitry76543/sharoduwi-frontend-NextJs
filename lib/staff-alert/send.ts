import { webpush } from "@/lib/webpush";
import { getSubscriptions, removeSubscription } from "@/lib/subscriptions";

export type StaffAlertPayload = {
  title?: string;
  body?: string;
  orderId?: string;
};

export type StaffAlertResult = {
  ok: boolean;
  sent: number;
  removed: number;
  total: number;
  error?: string;
};

export async function sendStaffAlert(
  payload: StaffAlertPayload = {}
): Promise<StaffAlertResult> {
  const subscriptions = await getSubscriptions();

  if (subscriptions.length === 0) {
    return {
      ok: false,
      sent: 0,
      removed: 0,
      total: 0,
      error: "Нет ни одной подписки. Сотрудники ещё не подписались.",
    };
  }

  const notification = JSON.stringify({
    title: payload.title || "🚨 Новый заказ в ШАРОДУВЫ!",
    body: payload.body || "Скорее оформляем — клиент ждёт свои шары 🎈",
    orderId: payload.orderId || String(Date.now()),
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, notification, {
        TTL: 60,
        urgency: "high",
        // Для iPhone/ iOS при заблокированном экране: включаем системный звук.
        // Пользователь всё равно должен разрешить звук в настройках уведомлений.
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
      } as any)
    )
  );

  let sent = 0;
  let removed = 0;

  await Promise.all(
    results.map(async (res, i) => {
      if (res.status === "fulfilled") {
        sent++;
        return;
      }

      const statusCode = (res.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await removeSubscription(subscriptions[i].endpoint);
        removed++;
      }
    })
  );

  return { ok: true, sent, removed, total: subscriptions.length };
}
