"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CURSOR_PREF_EVENT,
  isBalloonCursorSupported,
  readCursorPreference,
  writeCursorPreference,
} from "@/lib/cursor-preference";

export function CursorToggle() {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [show, setShow] = useState(false);

  const sync = useCallback(() => {
    setEnabled(readCursorPreference());
    setShow(isBalloonCursorSupported());
  }, []);

  useEffect(() => {
    sync();
    setMounted(true);

    const onPrefChange = () => sync();
    window.addEventListener(CURSOR_PREF_EVENT, onPrefChange);
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener(CURSOR_PREF_EVENT, onPrefChange);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  if (!mounted || !show) return null;

  const label = enabled ? "Выключить курсор-шарик" : "Включить курсор-шарик";

  return (
    <button
      type="button"
      className={`cursor-toggle${enabled ? "" : " is-off"}`}
      aria-pressed={!enabled}
      aria-label={label}
      title={label}
      onClick={() => writeCursorPreference(!enabled)}
    >
      <span className="cursor-toggle-icon" aria-hidden="true">
        {enabled ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l18 18M9.5 5A5 5 0 0116 9M7 7l10 10M5 12a7 7 0 0012 4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <ellipse cx="12" cy="9" rx="5" ry="6.5" />
            <path d="M12 15v2M10 19h4" />
          </svg>
        )}
      </span>
      <span className="cursor-toggle-label">{enabled ? "Курсор" : "Шарик"}</span>
    </button>
  );
}
