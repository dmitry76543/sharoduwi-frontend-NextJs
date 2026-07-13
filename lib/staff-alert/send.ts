import { webpush } from "@/lib/webpush";
import { getSubscriptions, removeSubscription } from "@/lib/subscriptions";
import { recordLastStaffAlert } from "@/lib/staff-alert/last-alert";
import { isVapidConfigured } from "@/lib/staff-alert/vapid";

export type StaffAlertPayload = {
  title?: string;
  body?: string;
  orderId?: string;
};

export type StaffAlertResult = {
  ok: boolean;
  sent: number;
  failed: number;
  removed: number;
  total: number;
  error?: string;
  errors?: string[];
};

type PushFailure = {
  statusCode?: number;
  message: string;
};

function getPushFailure(reason: unknown): PushFailure {
  if (reason && typeof reason === "object") {
    const err = reason as {
      statusCode?: number;
      body?: string;
      message?: string;
    };

    const body =
      typeof err.body === "string" && err.body.trim()
        ? err.body.trim()
        : undefined;

    return {
      statusCode: err.statusCode,
      message: body || err.message || "Неизвестная ошибка push",
    };
  }

  return { message: String(reason) };
}

function describePushFailure(failure: PushFailure): string {
  if (failure.statusCode === 401 || failure.statusCode === 403) {
    return `VAPID-ключ не совпадает (${failure.statusCode}). Переподпишитесь на устройстве.`;
  }

  if (failure.statusCode === 404 || failure.statusCode === 410) {
    return `Подписка устарела (${failure.statusCode}).`;
  }

  if (failure.statusCode) {
    return `${failure.message} (HTTP ${failure.statusCode})`;
  }

  return failure.message;
}

export async function sendStaffAlert(
  payload: StaffAlertPayload = {}
): Promise<StaffAlertResult> {
  const title = payload.title || "🚨 Новый заказ в ШАРОДУВЫ!";
  const body = payload.body || "Скорее оформляем — клиент ждёт свои шары 🎈";
  const orderId = payload.orderId || String(Date.now());

  await recordLastStaffAlert({ orderId, title, body });

  if (!isVapidConfigured()) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      removed: 0,
      total: 0,
      error:
        "VAPID-ключи не настроены на сервере. Добавьте VAPID_PUBLIC_KEY и VAPID_PRIVATE_KEY.",
    };
  }

  const subscriptions = await getSubscriptions();

  if (subscriptions.length === 0) {
    return {
      ok: true,
      sent: 0,
      failed: 0,
      removed: 0,
      total: 0,
      errors: [
        "Нет web-push подписок в браузере. Desktop-приложение в трее получит сигнал через опрос.",
      ],
    };
  }

  const notification = JSON.stringify({
    title,
    body,
    orderId,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, notification, {
        // Несколько часов: сообщение ждёт, пока ПК/браузер выйдут из сна/сети.
        TTL: 60 * 60 * 4,
        urgency: "high",
      })
    )
  );

  let sent = 0;
  let failed = 0;
  let removed = 0;
  const errors: string[] = [];

  await Promise.all(
    results.map(async (res, i) => {
      if (res.status === "fulfilled") {
        sent++;
        return;
      }

      failed++;
      const failure = getPushFailure(res.reason);
      const description = describePushFailure(failure);

      if (!errors.includes(description)) {
        errors.push(description);
      }

      if (failure.statusCode === 404 || failure.statusCode === 410) {
        await removeSubscription(subscriptions[i].endpoint);
        removed++;
      }
    })
  );

  if (sent === 0) {
    return {
      ok: false,
      sent,
      failed,
      removed,
      total: subscriptions.length,
      error:
        errors[0] ||
        "Не удалось доставить сигнал ни на одно устройство. Переподпишитесь на сигналы.",
      errors,
    };
  }

  return {
    ok: true,
    sent,
    failed,
    removed,
    total: subscriptions.length,
    ...(errors.length > 0 ? { errors } : {}),
  };
}
