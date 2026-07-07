const SEARCH_QUERY_KEY = "sharoduwi-catalog-search";

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
