import {
  getAdvantShopApiBaseUrl,
  getAdvantShopApiBaseUrlProtocolFallback,
  getAdvantShopClientApiKey,
  getAdvantShopServerApiKey,
  CATALOG_REVALIDATE_SECONDS,
} from "./config";

type FetchOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined>;
  revalidate?: number | false;
};

type AdvantShopApiEnvelope = {
  status?: string;
  errors?: string | string[];
  customer?: { id?: string };
};

let cachedClientUserId: string | null = null;
let clientUserIdPromise: Promise<string> | null = null;

const DEFAULT_ADVANTSHOP_FETCH_TIMEOUT_MS = 28_000;
const DEFAULT_ADVANTSHOP_FETCH_ATTEMPTS = 2;

function getAdvantShopFetchTimeoutMs(): number {
  const raw = process.env.ADVANTSHOP_FETCH_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_ADVANTSHOP_FETCH_TIMEOUT_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ADVANTSHOP_FETCH_TIMEOUT_MS;
}

function getAdvantShopFetchAttempts(): number {
  const raw = process.env.ADVANTSHOP_FETCH_ATTEMPTS?.trim();
  if (!raw) return DEFAULT_ADVANTSHOP_FETCH_ATTEMPTS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 1
    ? Math.min(Math.floor(parsed), 4)
    : DEFAULT_ADVANTSHOP_FETCH_ATTEMPTS;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = getAdvantShopFetchTimeoutMs()
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "AdvantShop API не ответил вовремя. Попробуйте обновить страницу."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempts = getAdvantShopFetchAttempts()
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;
      const retryable = isRetryableFetchError(error);
      if (!retryable || attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    }
  }

  throw lastError;
}

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  if (
    message.includes("fetch failed") ||
    message.includes("не ответил вовремя") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("socket hang up")
  ) {
    return true;
  }

  const cause = error.cause;
  if (cause && typeof cause === "object" && "code" in cause) {
    const code = String(cause.code);
    return code === "ECONNRESET" || code === "ECONNREFUSED" || code === "ETIMEDOUT";
  }

  return false;
}

function buildAdvantShopUrl(base: string, path: string): URL {
  const normalizedPath = path.replace(/^\//, "");
  return new URL(`${base.replace(/\/$/, "")}/${normalizedPath}`);
}

function formatAdvantShopError(errors: string | string[] | undefined): string {
  if (Array.isArray(errors)) return errors.join(", ");
  return errors ?? "Unknown error";
}

function readResponseHeader(response: Response, name: string): string | null {
  return response.headers.get(name) ?? response.headers.get(name.toLowerCase());
}

async function parseAdvantShopResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    if (response.status === 404 && text.includes("404 - File or directory not found")) {
      throw new Error(
        "AdvantShop API 404: проверьте ADVANTSHOP_BASE_URL. Для технического домена нужен путь магазина (https://s4.advantme.ru/437293-slug)."
      );
    }
    if (response.status === 405) {
      const allow = response.headers.get("Allow");
      throw new Error(
        `AdvantShop API 405: метод ${allow ? `разрешены только ${allow}` : "POST не принят"}. ` +
          "Проверьте ADVANTSHOP_BASE_URL / ADVANTSHOP_API_BASE_URL (нужен домен магазина AdvantShop, например http://shop.funshar.ru, не sharoduwi.ru)."
      );
    }
    if (response.status === 406) {
      throw new Error(
        "AdvantShop API 406: сервер не вернул JSON (часто из‑за https или неверного домена). " +
          "Укажите ADVANTSHOP_BASE_URL=http://shop.funshar.ru или ADVANTSHOP_API_BASE_URL с http."
      );
    }
    throw new Error(`AdvantShop API ${response.status}: ${text.slice(0, 300)}`);
  }

  let payload: T & AdvantShopApiEnvelope;
  try {
    payload = JSON.parse(text) as T & AdvantShopApiEnvelope;
  } catch {
    throw new Error(
      `AdvantShop API returned invalid JSON: ${text.slice(0, 200)}`
    );
  }

  if (payload.status === "error") {
    const message = formatAdvantShopError(payload.errors);
    if (message === "Check apikey") {
      throw new Error(
        "Неверный Client API ключ. Сгенерируйте ключ на вкладке «API с авторизацией» в AdvantShop (Настройки → API) и укажите его в ADVANTSHOP_CLIENT_API_KEY."
      );
    }
    throw new Error(`AdvantShop API error: ${message}`);
  }

  return payload;
}

function buildAdvantShopHeaders(
  apiKey: string,
  hasBody: boolean,
  extraHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    // Строгий Accept: application/json на IIS часто даёт 406, если ответ не JSON.
    Accept: "application/json, text/plain, */*",
    "X-API-KEY": apiKey,
    "User-Agent": "Sharoduwi-Storefront/1.0",
    ...extraHeaders,
  };

  if (hasBody) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  return headers;
}

function isAdvantShopTransportError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("AdvantShop API 405") ||
    error.message.includes("AdvantShop API 406")
  );
}

async function advantshopRequestOnce<T>(
  path: string,
  apiKey: string,
  options: FetchOptions = {},
  extraHeaders?: Record<string, string>,
  baseUrl = getAdvantShopApiBaseUrl()
): Promise<T> {
  const url = buildAdvantShopUrl(baseUrl, path);
  url.searchParams.set("apikey", apiKey);

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const method = options.method ?? "GET";
  const isMutation = method !== "GET";
  const hasBody = Boolean(options.body);

  const fetchInit: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers: buildAdvantShopHeaders(apiKey, hasBody, extraHeaders),
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  // Next.js Data Cache с `next.revalidate` может превратить POST в GET → IIS 405 на /api/order/add.
  if (isMutation) {
    fetchInit.cache = "no-store";
  } else {
    fetchInit.next =
      options.revalidate === false
        ? { revalidate: 0 }
        : { revalidate: options.revalidate ?? CATALOG_REVALIDATE_SECONDS };
  }

  const response = await fetchWithRetry(url.toString(), fetchInit);

  return parseAdvantShopResponse<T>(response);
}

async function advantshopRequest<T>(
  path: string,
  apiKey: string,
  options: FetchOptions = {},
  extraHeaders?: Record<string, string>,
  baseUrl = getAdvantShopApiBaseUrl()
): Promise<T> {
  const bases = [baseUrl];
  const fallback = getAdvantShopApiBaseUrlProtocolFallback(baseUrl);
  if (fallback && fallback !== baseUrl) {
    bases.push(fallback);
  }

  let lastError: unknown;

  for (const currentBase of bases) {
    try {
      return await advantshopRequestOnce<T>(
        path,
        apiKey,
        options,
        extraHeaders,
        currentBase
      );
    } catch (error) {
      lastError = error;
      if (!isAdvantShopTransportError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function fetchClientUserId(): Promise<string> {
  const apiKey = getAdvantShopClientApiKey();
  const bases = [getAdvantShopApiBaseUrl()];
  const fallback = getAdvantShopApiBaseUrlProtocolFallback(bases[0]);
  if (fallback && fallback !== bases[0]) {
    bases.push(fallback);
  }

  let lastError: unknown;

  for (const base of bases) {
    try {
      const url = buildAdvantShopUrl(base, "api/init");
      url.searchParams.set("apikey", apiKey);

      const response = await fetchWithRetry(url.toString(), {
        method: "GET",
        headers: buildAdvantShopHeaders(apiKey, false),
        cache: "no-store",
      });

      const userId =
        readResponseHeader(response, "X-API-USER-ID") ??
        readResponseHeader(response, "x-api-user-id");

      if (userId) {
        return userId;
      }

      const payload = await parseAdvantShopResponse<{ customer?: { id?: string } }>(
        response
      );
      const customerId = payload.customer?.id;

      if (customerId) {
        return customerId;
      }

      throw new Error(
        "AdvantShop не вернул X-API-USER-ID. Проверьте Client API ключ (вкладка «API с авторизацией»)."
      );
    } catch (error) {
      lastError = error;
      if (!isAdvantShopTransportError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function fetchClientUserIdUncached(): Promise<string> {
  return fetchClientUserId();
}

async function ensureClientUserId(): Promise<string> {
  if (cachedClientUserId) return cachedClientUserId;

  if (!clientUserIdPromise) {
    clientUserIdPromise = import("./session")
      .then(({ getCachedClientUserId }) => getCachedClientUserId())
      .then((userId) => {
        cachedClientUserId = userId;
        return userId;
      })
      .finally(() => {
        clientUserIdPromise = null;
      });
  }

  return clientUserIdPromise;
}

export async function advantshopFetch<T>(
  path: string,
  options: FetchOptions = {},
  baseUrl?: string
): Promise<T> {
  return advantshopRequest<T>(path, getAdvantShopServerApiKey(), options, undefined, baseUrl);
}

export async function advantshopClientFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const userId = await ensureClientUserId();
  return advantshopRequest<T>(path, getAdvantShopClientApiKey(), options, {
    "X-API-USER-ID": userId,
  });
}
