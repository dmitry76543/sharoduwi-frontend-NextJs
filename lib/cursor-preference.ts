const CURSOR_OFF_KEY = "sharoduwi-cursor-off";

export const CURSOR_PREF_EVENT = "sharoduwi-cursor-pref-change";
export const CURSOR_PREF_CHANGE_EVENT = CURSOR_PREF_EVENT;

/** По умолчанию обычный курсор; шарик только если пользователь явно включил. */
export function isCursorDisabledByUser(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(CURSOR_OFF_KEY);
  if (stored === null) return true;
  return stored === "1";
}

export function readCursorPreference(): boolean {
  return !isCursorDisabledByUser();
}

export function setCursorDisabledByUser(disabled: boolean) {
  if (typeof window === "undefined") return;
  // Явно сохраняем оба состояния: без ключа больше значит «по умолчанию выкл».
  localStorage.setItem(CURSOR_OFF_KEY, disabled ? "1" : "0");
  window.dispatchEvent(
    new CustomEvent(CURSOR_PREF_EVENT, { detail: { disabled } })
  );
}

export function writeCursorPreference(enabled: boolean) {
  setCursorDisabledByUser(!enabled);
}

export function isBalloonCursorViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer:fine) and (min-width: 721px)").matches;
}

export function isBalloonCursorSupported(): boolean {
  return isBalloonCursorViewport();
}

export function isBalloonCursorActive(): boolean {
  return isBalloonCursorViewport() && !isCursorDisabledByUser();
}

export function isBalloonCursorEnabled(): boolean {
  return isBalloonCursorActive();
}
