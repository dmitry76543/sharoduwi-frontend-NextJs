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

const BUILD_TIME_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

type Status = "idle" | "loading" | "subscribed" | "error" | "unsupported";

export default function StaffAlertPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [alarmOn, setAlarmOn] = useState(false);
  const [selectedSound, setSelectedSound] = useState<AlarmSoundId>(0);
  const [isWindows, setIsWindows] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState(BUILD_TIME_VAPID_KEY);
  const [vapidReady, setVapidReady] = useState(Boolean(BUILD_TIME_VAPID_KEY));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedSoundRef = useRef<AlarmSoundId>(0);

  useEffect(() => {
    setSelectedSound(readStoredAlarmSound());
    setIsWindows(isWindowsDesktop());
  }, []);

  useEffect(() => {
    if (BUILD_TIME_VAPID_KEY) return;

    let cancelled = false;

    fetch("/api/staff-alert/config", { credentials: "same-origin" })
      .then(async (response) => {
        const json = (await response.json()) as {
          ok?: boolean;
          publicKey?: string;
          error?: string;
        };

        if (cancelled) return;

        if (response.ok && json.publicKey) {
          setVapidPublicKey(json.publicKey);
          setVapidReady(true);
          return;
        }

        setMessage(
          json.error ||
            "Не удалось получить VAPID-ключ с сервера. Проверьте переменные окружения на хостинге."
        );
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("Не удалось загрузить настройки push-уведомлений.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    selectedSoundRef.current = selectedSound;
    storeAlarmSound(selectedSound);
  }, [selectedSound]);

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

  const previewSound = useCallback(
    (soundId: AlarmSoundId) => {
      stopAlarm();
      selectedSoundRef.current = soundId;
      setSelectedSound(soundId);
      audioCtxRef.current = ensureAudioContext(audioCtxRef.current);
      playAlarmCycle(audioCtxRef.current, soundId);
      clearPreviewTimer();
      previewTimerRef.current = setTimeout(() => {
        playAlarmCycle(audioCtxRef.current!, soundId);
      }, getAlarmCycleInterval(soundId));
    },
    [clearPreviewTimer, stopAlarm]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!supportsStaffPush()) {
      setStatus("unsupported");
      setMessage("Ваш браузер не поддерживает push-уведомления");
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      setMessage(`Не удалось зарегистрировать service worker: ${error.message}`);
    });

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
  }, [clearAlarmTimer, clearPreviewTimer, startAlarm]);

  const subscribe = useCallback(async () => {
    try {
      setStatus("loading");
      setMessage("");

      if (!vapidPublicKey) {
        throw new Error(
          vapidReady
            ? "Публичный VAPID-ключ пустой. Добавьте VAPID_PUBLIC_KEY на сервере."
            : "Загружаем VAPID-ключ с сервера… Подождите секунду и нажмите снова."
        );
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Разрешение на уведомления не выдано.");
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; total?: number };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Ошибка сервера");
      }

      setStatus("subscribed");
      setMessage(
        `Готово! Устройств подписано: ${json.total}. ${
          isWindowsDesktop()
            ? "Разрешите уведомления для Chrome/Edge в настройках Windows."
            : "Добавьте страницу на главный экран."
        }`
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ошибка подписки");
    }
  }, [vapidPublicKey, vapidReady]);

  const simulateOrder = useCallback(async () => {
    setMessage("Отправляю тестовый сигнал на все устройства…");
    try {
      const res = await fetch("/api/send-alert", {
        method: "POST",
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

  return (
    <main className="staff-alert-page">
      <div className="staff-alert-balloons" aria-hidden>
        🎈🎈🎈🎈🎈
      </div>

      <h1 className="staff-alert-title">🎈 ШАРОДУВЫ</h1>
      <p className="staff-alert-subtitle">Сигнал о новых заказах для сотрудников</p>

      <section className="staff-alert-sound-picker" aria-label="Выбор сигнала">
        <strong>Выберите громкий сигнал</strong>
        <div className="staff-alert-sound-grid">
          {ALARM_SOUNDS.map((sound) => {
            const active = selectedSound === sound.id;
            return (
              <button
                key={sound.id}
                type="button"
                className={`staff-alert-sound-option${active ? " staff-alert-sound-option--active" : ""}`}
                onClick={() => previewSound(sound.id)}
              >
                <span className="staff-alert-sound-emoji">{sound.emoji}</span>
                <span className="staff-alert-sound-name">{sound.name}</span>
                <span className="staff-alert-sound-desc">{sound.description}</span>
              </button>
            );
          })}
        </div>
        <p className="staff-alert-hint">Нажмите на вариант, чтобы прослушать. Выбор сохраняется на этом устройстве.</p>
      </section>

      <button
        type="button"
        onClick={subscribe}
        disabled={status === "loading" || status === "subscribed"}
        className="staff-alert-big-button"
      >
        {status === "subscribed"
          ? "✅ Вы подписаны"
          : status === "loading"
            ? "⏳ Подписываю…"
            : "🔊 Подписаться на сигналы"}
      </button>

      <button type="button" onClick={simulateOrder} className="staff-alert-test-button">
        🧪 Симулировать новый заказ
      </button>

      {alarmOn ? (
        <button type="button" onClick={stopAlarm} className="staff-alert-stop-button">
          🛑 ОСТАНОВИТЬ СИГНАЛ
        </button>
      ) : (
        <button type="button" onClick={startAlarm} className="staff-alert-play-button">
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
        <strong>Телефон (Android / iPhone)</strong>
        <ol>
          <li>Открыть страницу в браузере и войти по паролю.</li>
          <li>Выбрать сигнал и нажать «Подписаться на сигналы».</li>
          <li>Разрешить уведомления и добавить на главный экран.</li>
        </ol>
      </div>

      <div className="staff-alert-steps">
        <strong>Компьютер Windows</strong>
        <ol>
          <li>Откройте эту страницу в <strong>Chrome</strong> или <strong>Edge</strong>.</li>
          <li>Нажмите «Подписаться на сигналы» и разрешите уведомления в браузере.</li>
          <li>
            В Windows: Параметры → Система → Уведомления → включите уведомления для Chrome/Edge.
          </li>
          <li>
            {isWindows
              ? "Можно закрепить вкладку или установить приложение: меню браузера → «Установить ШАРОДУВЫ» / «Приложения»."
              : "Для ПК используйте Chrome или Edge на Windows 10/11."}
          </li>
        </ol>
      </div>
    </main>
  );
}
