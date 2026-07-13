"use client";

import { isAlarmSoundId, type AlarmSoundId } from "./alarm-sounds";

export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** Android/Chrome: keys теряются при JSON.stringify(sub) — нужен toJSON(). */
export function serializePushSubscription(
  subscription: PushSubscription
): PushSubscriptionPayload {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error(
      "Браузер вернул неполную push-подписку. Откройте страницу в Chrome на Android."
    );
  }

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}

export async function registerStaffServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  if (registration.installing) {
    await new Promise<void>((resolve) => {
      registration.installing!.addEventListener("statechange", (event) => {
        if ((event.target as ServiceWorker).state === "activated") resolve();
      });
    });
  }

  await navigator.serviceWorker.ready;
  return registration;
}

export async function fetchVapidPublicKey(fallback = ""): Promise<string> {
  if (fallback) return fallback;

  const response = await fetch("/api/staff-alert/config", {
    credentials: "same-origin",
  });
  const json = (await response.json()) as {
    ok?: boolean;
    publicKey?: string;
    error?: string;
  };

  if (!response.ok || !json.publicKey) {
    throw new Error(
      json.error ||
        "Не удалось получить VAPID-ключ с сервера. Проверьте переменные окружения."
    );
  }

  return json.publicKey;
}

export async function createPushSubscription(
  vapidPublicKey: string
): Promise<PushSubscription> {
  const registration = await registerStaffServiceWorker();
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey) as BufferSource;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  try {
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  } catch (error) {
    const stale = await registration.pushManager.getSubscription();
    if (stale) {
      await stale.unsubscribe();
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }
    throw error;
  }
}

export async function getLocalPushSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function saveSubscriptionOnServer(
  subscription: PushSubscription,
  soundId?: AlarmSoundId
): Promise<number> {
  const response = await fetch("/api/subscribe", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: serializePushSubscription(subscription),
      soundId,
    }),
  });

  const json = (await response.json()) as {
    ok?: boolean;
    error?: string;
    total?: number;
  };

  if (!response.ok || !json.ok) {
    throw new Error(json.error || "Ошибка сохранения подписки на сервере");
  }

  return json.total ?? 0;
}

export async function saveSoundOnServer(
  endpoint: string,
  soundId: AlarmSoundId
): Promise<void> {
  const response = await fetch("/api/subscribe", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, soundId }),
  });

  const json = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok || !json.ok) {
    throw new Error(json.error || "Не удалось сохранить сигнал на сервере");
  }
}

export async function loadSoundFromServer(
  endpoint: string
): Promise<AlarmSoundId | null> {
  const response = await fetch(
    `/api/subscribe?sound=${encodeURIComponent(endpoint)}`,
    { credentials: "same-origin" }
  );

  if (!response.ok) return null;

  const json = (await response.json()) as { soundId?: number | null };
  if (typeof json.soundId === "number" && isAlarmSoundId(json.soundId)) {
    return json.soundId;
  }
  return null;
}

export type ServerSubscriptionStatus = {
  exists: boolean;
  soundId: AlarmSoundId | null;
};

/** Проверка: есть ли подписка на сервере (после 410 она могла быть удалена). */
export async function checkSubscriptionOnServer(
  endpoint: string
): Promise<ServerSubscriptionStatus> {
  const response = await fetch(
    `/api/subscribe?check=${encodeURIComponent(endpoint)}`,
    { credentials: "same-origin" }
  );

  if (!response.ok) {
    return { exists: false, soundId: null };
  }

  const json = (await response.json()) as {
    exists?: boolean;
    soundId?: number | null;
  };

  return {
    exists: Boolean(json.exists),
    soundId:
      typeof json.soundId === "number" && isAlarmSoundId(json.soundId)
        ? json.soundId
        : null,
  };
}

export async function removeSubscriptionOnServer(endpoint: string): Promise<void> {
  const response = await fetch("/api/subscribe", {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });

  const json = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok || !json.ok) {
    throw new Error(json.error || "Не удалось удалить подписку на сервере");
  }
}

export async function unsubscribeLocally(): Promise<void> {
  const subscription = await getLocalPushSubscription();
  if (subscription) await subscription.unsubscribe();
}
