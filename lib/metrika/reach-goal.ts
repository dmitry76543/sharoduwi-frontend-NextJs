import { YANDEX_METRIKA_ID } from "@/lib/metrika/constants";

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ym !== "function") return;
  if (params) {
    window.ym(YANDEX_METRIKA_ID, "reachGoal", goal, params);
    return;
  }
  window.ym(YANDEX_METRIKA_ID, "reachGoal", goal);
}
