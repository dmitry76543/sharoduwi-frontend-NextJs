const FAV_STORAGE_KEY = "sharoduwi-fav";

export type FavMap = Record<number, boolean>;

export function readStoredFav(): FavMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return {};
    return Object.fromEntries(
      parsed
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
        .map((id) => [id, true] as const)
    );
  } catch {
    return {};
  }
}

export function persistFav(fav: FavMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(Object.keys(fav).map(Number)));
}
