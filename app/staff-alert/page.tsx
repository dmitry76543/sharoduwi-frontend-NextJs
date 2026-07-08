"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ALARM_SOUNDS,
  type AlarmSoundId,
  ensureAudioContext,
  getAlarmCycleInterval,
  isWindowsDesktop,
  playAlarmCycle,
  readStoredAlarmSound,
  storeAlarmSound,
  supportsStaffPush,
} from "./alarm-sounds";
import {
  createPushSubscription,
  fetchVapidPublicKey,
  getLocalPushSubscription,
  loadSoundFromServer,
  registerStaffServiceWorker,
  removeSubscriptionOnServer,
  saveSoundOnServer,
  saveSubscriptionOnServer,
  unsubscribeLocally,
} from "./push-client";

const BUILD_TIME_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

type Status = "idle" | "loading" | "subscribed" | "error" | "unsupported";

export default function StaffAlertPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [alarmOn, setAlarmOn] = useState(false);
  const [selectedSound, setSelectedSound] = useState<AlarmSoundId>(0);
  const [soundSaved, setSoundSaved] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState(BUILD_TIME_VAPID_KEY);
  const [vapidReady, setVapidReady] = useState(Boolean(BUILD_TIME_VAPID_KEY));
  const [pushEndpoint, setPushEndpoint] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedSoundRef = useRef<AlarmSoundId>(0);

  const clearAlarmTimer = useCallback(() => {
    if (alarmTimerRef.current) {
      clearInterval(alarmTimerRef.current);
      alarmTimerRef.current = null;
    }
  }, []);

  const clearPreviewTimer = useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  }, []);

  const playSelectedCycle = useCallback(() => {
    audioCtxRef.current = ensureAudioContext(audioCtxRef.current);
    playAlarmCycle(audioCtxRef.current, selectedSoundRef.current);
  }, []);

  const startAlarm = useCallback(() => {
    clearPreviewTimer();
    audioCtxRef.current = ensureAudioContext(audioCtxRef.current);
    setAlarmOn(true);
    playSelectedCycle();
    clearAlarmTimer();
    alarmTimerRef.current = setInterval(
      playSelectedCycle,
      getAlarmCycleInterval(selectedSoundRef.current)
    );
  }, [clearAlarmTimer, clearPreviewTimer, playSelectedCycle]);

  const stopAlarm = useCallback(() => {
    setAlarmOn(false);
    clearAlarmTimer();
    clearPreviewTimer();
    if ("vibrate" in navigator) navigator.vibrate(0);
  }, [clearAlarmTimer, clearPreviewTimer]);

  const persistSoundChoice = useCallback(
    async (soundId: AlarmSoundId, preview = true) => {
      selectedSoundRef.current = soundId;
      setSelectedSound(soundId);
      storeAlarmSound(soundId);

      if (status !== "subscribed" || !pushEndpoint) {
        setSoundSaved(false);
        if (preview) {
          stopAlarm();
          audioCtxRef.current = ensureAudioContext(audioCtxRef.current);
          playAlarmCycle(audioCtxRef.current, soundId);
        }
        return;
      }

      try {
        await saveSoundOnServer(pushEndpoint, soundId);
        setSoundSaved(true);
        setMessage(`Сигнал «${ALARM_SOUNDS[soundId].name}» сохранён на этом устройстве.`);
      } catch (error) {
        setSoundSaved(true);
        setMessage(
          `Сигнал сохранён локально. ${
            error instanceof Error ? error.message : "Сервер недоступен"
          }`
        );
      }

      if (preview) {
        stopAlarm();
        audioCtxRef.current = ensureAudioContext(audioCtxRef.current);
        playAlarmCycle(audioCtxRef.current, soundId);
        clearPreviewTimer();
        previewTimerRef.current = setTimeout(() => {
          playAlarmCycle(audioCtxRef.current!, soundId);
        }, getAlarmCycleInterval(soundId));
      }
    },
    [clearPreviewTimer, pushEndpoint, status, stopAlarm]
  );

  const syncExistingSubscription = useCallback(async () => {
    const local = await getLocalPushSubscription();
    if (!local) {
      setStatus("idle");
      setPushEndpoint(null);
      setSoundSaved(false);
      return;
    }

    setStatus("subscribed");
    setPushEndpoint(local.endpoint);

    const stored = readStoredAlarmSound();
    selectedSoundRef.current = stored;
    setSelectedSound(stored);

    const remoteSound = await loadSoundFromServer(local.endpoint);
    if (remoteSound !== null) {
      selectedSoundRef.current = remoteSound;
      setSelectedSound(remoteSound);
      storeAlarmSound(remoteSound);
      setSoundSaved(true);
    } else {
      setSoundSaved(false);
    }
  }, []);

  useEffect(() => {
    setSelectedSound(readStoredAlarmSound());
    setIsWindows(isWindowsDesktop());
  }, []);

  useEffect(() => {
    selectedSoundRef.current = selectedSound;
  }, [selectedSound]);

  useEffect(() => {
    let cancelled = false;

    fetchVapidPublicKey(BUILD_TIME_VAPID_KEY)
      .then((key) => {
        if (cancelled) return;
        setVapidPublicKey(key);
        setVapidReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(
          error instanceof Error ? error.message : "Не удалось загрузить VAPID-ключ"
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!supportsStaffPush()) {
      setStatus("unsupported");
      setMessage("Ваш браузер не поддерживает push-уведомления");
      return;
    }

    registerStaffServiceWorker().catch((error) => {
      setMessage(`Не удалось зарегистрировать service worker: ${error.message}`);
    });

    void syncExistingSubscription();

    const params = new URLSearchParams(window.location.search);
    if (params.get("alarm") === "1") {
      setTimeout(() => startAlarm(), 150);
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "PLAY_ALARM") startAlarm();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
      clearAlarmTimer();
      clearPreviewTimer();
    };
  }, [clearAlarmTimer, clearPreviewTimer, startAlarm, syncExistingSubscription]);

  const subscribe = useCallback(async () => {
    try {
      setStatus("loading");
      setMessage("");

      const publicKey = vapidPublicKey || (await fetchVapidPublicKey(BUILD_TIME_VAPID_KEY));
      if (!publicKey) {
        throw new Error("VAPID-ключ не настроен на сервере.");
      }
      setVapidPublicKey(publicKey);
      setVapidReady(true);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Разрешение на уведомления не выдано.");
      }

      const subscription = await createPushSubscription(publicKey);
      const soundId = selectedSoundRef.current;
      const total = await saveSubscriptionOnServer(subscription, soundId);

      setStatus("subscribed");
      setPushEndpoint(subscription.endpoint);
      setSoundSaved(true);
      setMessage(
        `Готово! Устройств подписано: ${total}. Теперь выберите и сохраните сигнал ниже. ${
          isWindowsDesktop()
            ? "Разрешите уведомления для Chrome/Edge в настройках Windows."
            : "На Android добавьте страницу на главный экран."
        }`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ошибка подписки");
    }
  }, [vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    try {
      setStatus("loading");
      setMessage("");
      stopAlarm();

      const local = await getLocalPushSubscription();
      const endpoint = local?.endpoint ?? pushEndpoint;

      if (endpoint) {
        await removeSubscriptionOnServer(endpoint);
      }

      await unsubscribeLocally();

      setStatus("idle");
      setPushEndpoint(null);
      setSoundSaved(false);
      setMessage("Вы отписались от сигналов на этом устройстве.");
    } catch (error) {
      setStatus("subscribed");
      setMessage(error instanceof Error ? error.message : "Ошибка отписки");
    }
  }, [pushEndpoint, stopAlarm]);

  const toggleSubscription = useCallback(async () => {
    if (status === "subscribed") {
      await unsubscribe();
      return;
    }
    await subscribe();
  }, [status, subscribe, unsubscribe]);

  const simulateOrder = useCallback(async () => {
    setMessage("Отправляю тестовый сигнал на все устройства…");
    try {
      const res = await fetch("/api/send-alert", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "🚨 Новый заказ в ШАРОДУВЫ!",
          body: "Тестовый заказ — проверка сигнала",
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        sent?: number;
        total?: number;
      };

      if (!res.ok) {
        throw new Error(json.error || "Требуется авторизация");
      }

      if (json.ok) {
        setMessage(`Сигнал отправлен! Доставлено устройств: ${json.sent} из ${json.total}.`);
      } else {
        setMessage(json.error || "Не удалось отправить сигнал.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка отправки");
    }
  }, []);

  const isSubscribed = status === "subscribed";
  const isBusy = status === "loading";

  return (
    <main className="staff-alert-page">
      <div className="staff-alert-balloons" aria-hidden>
        🎈🎈🎈🎈🎈
      </div>

      <h1 className="staff-alert-title">🎈 ШАРОДУВЫ</h1>
      <p className="staff-alert-subtitle">Сигнал о новых заказах для сотрудников</p>

      <button
        type="button"
        onClick={toggleSubscription}
        disabled={isBusy || status === "unsupported" || (!vapidReady && !BUILD_TIME_VAPID_KEY)}
        className={`staff-alert-big-button${isSubscribed ? " staff-alert-big-button--subscribed" : ""}`}
      >
        {isSubscribed
          ? "🔕 Отписаться от сигналов"
          : isBusy
            ? "⏳ Подождите…"
            : "🔊 Подписаться на сигналы"}
      </button>

      <section
        className={`staff-alert-sound-picker${isSubscribed ? "" : " staff-alert-sound-picker--locked"}`}
        aria-label="Выбор сигнала"
      >
        <strong>{isSubscribed ? "Шаг 2. Выберите и сохраните сигнал" : "Шаг 2. Выбор сигнала"}</strong>
        <div className="staff-alert-sound-grid">
          {ALARM_SOUNDS.map((sound) => {
            const active = selectedSound === sound.id;
            return (
              <button
                key={sound.id}
                type="button"
                className={`staff-alert-sound-option${active ? " staff-alert-sound-option--active" : ""}`}
                disabled={!isSubscribed || isBusy}
                onClick={() => void persistSoundChoice(sound.id)}
              >
                <span className="staff-alert-sound-emoji">{sound.emoji}</span>
                <span className="staff-alert-sound-name">{sound.name}</span>
                <span className="staff-alert-sound-desc">{sound.description}</span>
              </button>
            );
          })}
        </div>
        <p className="staff-alert-hint">
          {isSubscribed
            ? soundSaved
              ? "Сигнал сохранён. Нажмите другой вариант, чтобы изменить."
              : "Нажмите на вариант — он сохранится на этом устройстве."
            : "Сначала подпишитесь на сигналы, затем выберите звук."}
        </p>
      </section>

      <button
        type="button"
        onClick={simulateOrder}
        disabled={!isSubscribed || isBusy}
        className="staff-alert-test-button"
      >
        🧪 Симулировать новый заказ
      </button>

      {alarmOn ? (
        <button type="button" onClick={stopAlarm} className="staff-alert-stop-button">
          🛑 ОСТАНОВИТЬ СИГНАЛ
        </button>
      ) : (
        <button
          type="button"
          onClick={startAlarm}
          disabled={!isSubscribed}
          className="staff-alert-play-button"
        >
          ▶️ Проверить выбранный сигнал
        </button>
      )}

      {message && <p className="staff-alert-message">{message}</p>}
      {status === "unsupported" && (
        <p className="staff-alert-hint">
          Откройте страницу в Chrome или Edge (Windows, Android) либо Safari (iPhone, iOS 16.4+).
        </p>
      )}

      <div className="staff-alert-steps">
        <strong>Android</strong>
        <ol>
          <li>Откройте в <strong>Chrome</strong>, войдите по паролю.</li>
          <li>Нажмите «Подписаться на сигналы» и разрешите уведомления.</li>
          <li>Выберите и сохраните сигнал.</li>
          <li>Меню Chrome → «Добавить на главный экран».</li>
        </ol>
      </div>

      <div className="staff-alert-steps">
        <strong>iPhone</strong>
        <ol>
          <li>Safari → «На экран Домой», затем открыть с иконки.</li>
          <li>Подписаться на сигналы и выбрать звук.</li>
        </ol>
      </div>

      {isWindows && (
        <div className="staff-alert-steps">
          <strong>Windows</strong>
          <ol>
            <li>Chrome или Edge → подписка → выбор сигнала.</li>
            <li>Параметры Windows → Уведомления → включить для браузера.</li>
          </ol>
        </div>
      )}
    </main>
  );
}
