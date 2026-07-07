const SEARCH_QUERY_KEY = "sharoduwi-catalog-search";
const SEARCH_FOCUS_KEY = "sharoduwi-catalog-search-focus";

export function readStoredSearchQuery(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(SEARCH_QUERY_KEY) ?? "";
  } catch {
    return "";
  }
}

export function persistSearchQuery(query: string): void {
  if (typeof window === "undefined") return;
  try {
    if (query.trim()) {
      sessionStorage.setItem(SEARCH_QUERY_KEY, query);
    } else {
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
    }
  } catch {
    // ignore quota / private mode
  }
}

export function readInitialSearchQuery(): string {
  if (typeof window === "undefined") return "";
  const fromUrl = new URLSearchParams(window.location.search).get("q");
  if (fromUrl != null) return fromUrl;
  return readStoredSearchQuery();
}

/** После перехода на каталог вернуть фокус в поле поиска в шапке. */
export function markSearchFocusPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SEARCH_FOCUS_KEY, "1");
  } catch {
    // ignore
  }
}

export function consumeSearchFocusPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(SEARCH_FOCUS_KEY) !== "1") return false;
    sessionStorage.removeItem(SEARCH_FOCUS_KEY);
    return true;
  } catch {
    return false;
  }
}
