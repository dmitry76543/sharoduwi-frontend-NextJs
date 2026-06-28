const CURSOR_OFF_KEY = "sharoduwi-cursor-off";

export const CURSOR_PREF_EVENT = "sharoduwi-cursor-pref-change";
export const CURSOR_PREF_CHANGE_EVENT = CURSOR_PREF_EVENT;

export function isCursorDisabledByUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CURSOR_OFF_KEY) === "1";
}

export function readCursorPreference(): boolean {
  return !isCursorDisabledByUser();
}

export function setCursorDisabledByUser(disabled: boolean) {
  if (typeof window === "undefined") return;
  if (disabled) localStorage.setItem(CURSOR_OFF_KEY, "1");
  else localStorage.removeItem(CURSOR_OFF_KEY);
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
