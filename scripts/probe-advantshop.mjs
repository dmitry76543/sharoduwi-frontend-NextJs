/**
 * Диагностика подключения AdvantShop.
 * Использование: заполнить .env.local и запустить:
 *   node scripts/probe-advantshop.mjs
 */
import { readFileSync, existsSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const base = process.env.ADVANTSHOP_BASE_URL?.replace(/\/$/, "");
const serverKey = process.env.ADVANTSHOP_SERVER_API_KEY || process.env.ADVANTSHOP_API_KEY;
const clientKey = process.env.ADVANTSHOP_CLIENT_API_KEY || process.env.ADVANTSHOP_API_KEY;
const categoryMapRaw = process.env.ADVANTSHOP_CATEGORY_MAP ?? "";

function parseCategoryMap(raw) {
  if (raw.startsWith("{")) {
    try {
      return Object.entries(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return raw
    .split(",")
    .map((part) => part.split(":").map((s) => s.trim()))
    .filter(([slug, url]) => slug && url);
}

function fail(label, error) {
  console.error(`FAIL  ${label}:`, error instanceof Error ? error.message : error);
  return false;
}

async function request(url, { apiKey, userId, method = "GET", body } = {}) {
  const u = new URL(url);
  u.searchParams.set("apikey", apiKey);
  const headers = {
    Accept: "application/json, text/plain, */*",
    "User-Agent": "Sharoduwi-Storefront/1.0",
    "X-API-KEY": apiKey,
  };
  if (body) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }
  if (userId) headers["X-API-USER-ID"] = userId;

  const response = await fetch(u, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }

  return { ok: response.ok, status: response.status, data, userId: response.headers.get("x-api-user-id") };
}

console.log("AdvantShop probe (ШАРОДУВЫ)\n==========================");

if (!base) {
  console.error("ADVANTSHOP_BASE_URL is missing");
  process.exit(1);
}
if (!serverKey) {
  console.error("ADVANTSHOP_SERVER_API_KEY is missing");
  process.exit(1);
}
if (!clientKey) {
  console.error("ADVANTSHOP_CLIENT_API_KEY is missing");
  process.exit(1);
}

console.log("BASE_URL:", base);
console.log("CATEGORY_MAP:", categoryMapRaw || "(empty)");
console.log("");

let ok = true;

try {
  const { ok: resOk, status, data } = await request(`${base}/api/categories`, {
    apiKey: serverKey,
  });
  const count = data.categories?.length ?? 0;
  if (!resOk || data.status === "error") {
    ok = fail("Server API /api/categories", data.errors ?? status) && ok;
  } else {
    console.log(`OK    Server API categories: ${count} items`);
  }
} catch (e) {
  ok = fail("Server API /api/categories", e) && ok;
}

let clientUserId;
try {
  const { ok: resOk, data, userId } = await request(`${base}/api/init`, { apiKey: clientKey });
  clientUserId = userId ?? data.customer?.id;
  if (!resOk || !clientUserId) {
    ok = fail("Client API /api/init", data.errors ?? "no X-API-USER-ID") && ok;
  } else {
    console.log(`OK    Client API init: userId=${clientUserId}`);
  }
} catch (e) {
  ok = fail("Client API /api/init", e) && ok;
}

const categoryEntries = parseCategoryMap(categoryMapRaw);
if (!categoryEntries.length) {
  console.warn("WARN  ADVANTSHOP_CATEGORY_MAP is empty — skip catalog test");
} else if (clientUserId) {
  for (const [slug, url] of categoryEntries) {
    try {
      const { ok: resOk, data } = await request(`${base}/api/catalog`, {
        apiKey: clientKey,
        userId: clientUserId,
        method: "POST",
        body: { url, sorting: "NoSorting", page: 1, itemsPerPage: 5 },
      });
      const count = data.products?.length ?? 0;
      if (!resOk || data.status === "error") {
        ok = fail(`Catalog [${slug}→${url}]`, data.errors) && ok;
      } else {
        console.log(`OK    Catalog [${slug}→${url}]: ${count} products (page 1)`);
        const first = data.products?.[0];
        if (first?.productId) {
          const details = await request(`${base}/api/products/${first.productId}`, {
            apiKey: clientKey,
            userId: clientUserId,
          });
          if (details.ok) {
            console.log(`OK    Product ${first.productId}: ${details.data.name ?? first.name}`);
          } else {
            ok = fail(`Product ${first.productId}`, details.data.errors) && ok;
          }
        }
      }
    } catch (e) {
      ok = fail(`Catalog [${slug}]`, e) && ok;
    }
  }
}

try {
  const { ok: resOk, status, data } = await request(`${base}/api/order/add`, {
    apiKey: serverKey,
    method: "POST",
    body: {
      OrderCustomer: { FirstName: "Probe", Phone: "79000000000" },
      OrderItems: [],
      Currency: "RUB",
      ShippingName: "probe",
      ShippingCost: 0,
      CheckOrderItemExist: false,
      CheckOrderItemAvailable: false,
    },
  });
  if (status === 405) {
    ok = fail("Server API POST /api/order/add", "405 Method Not Allowed — проверьте ADVANTSHOP_BASE_URL (http://shop.funshar.ru) или ADVANTSHOP_API_BASE_URL") && ok;
  } else if (!resOk && data.status === "error") {
    const err = Array.isArray(data.errors) ? data.errors.join(", ") : data.errors;
    if (String(err).toLowerCase().includes("orderitems") || String(err).toLowerCase().includes("ordercustomer")) {
      console.log(`OK    Server API order/add: POST принят (валидация: ${err})`);
    } else {
      ok = fail("Server API POST /api/order/add", err ?? status) && ok;
    }
  } else if (resOk) {
    console.log("OK    Server API order/add: POST принят");
  } else {
    ok = fail("Server API POST /api/order/add", data.raw ?? status) && ok;
  }
} catch (e) {
  ok = fail("Server API POST /api/order/add", e) && ok;
}

console.log("");
console.log(ok ? "All checks passed." : "Some checks failed — see errors above.");
process.exit(ok ? 0 : 1);
