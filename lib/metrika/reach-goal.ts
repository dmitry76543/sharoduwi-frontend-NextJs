import { YANDEX_METRIKA_ID } from "@/lib/metrika/constants";
import { getMetrikaCityParams } from "@/lib/metrika/city";

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ym !== "function") return;

  const cityParams = getMetrikaCityParams();
  const merged =
    Object.keys(cityParams).length || params
      ? { ...cityParams, ...params }
      : undefined;

  if (merged && Object.keys(merged).length > 0) {
    window.ym(YANDEX_METRIKA_ID, "reachGoal", goal, merged);
    return;
  }

  window.ym(YANDEX_METRIKA_ID, "reachGoal", goal);
}
