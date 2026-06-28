import type { CollectionSlug } from "@/lib/products";
import type { Product, ProductDetails } from "@/lib/data";
import { advantshopClientFetch, advantshopFetch } from "./client";
import { getCategoryUrlMap } from "./config";
import { mapCatalogProduct, mapProductDetails } from "./mapper";
import type {
  AdvantShopCatalogResponse,
  AdvantShopCategoriesResponse,
  AdvantShopProductDetails as AdvantShopProductDetailsResponse,
  AdvantShopProperty,
  AdvantShopPropertiesResponse,
} from "./types";

const SORT_MAP: Record<string, string> = {
  default: "NoSorting",
  "price-asc": "AscByPrice",
  "price-desc": "DescByPrice",
  new: "DescByAddingDate",
};

function isMissingCategoryError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.includes("Категория не найдена")
  );
}

function flattenAdvantShopProperties(
  response: AdvantShopPropertiesResponse
): AdvantShopProperty[] {
  if (Array.isArray(response)) {
    return response.flatMap((group) => group.properties ?? []);
  }

  return response.properties ?? [];
}

async function fetchCatalogPage(body: Record<string, unknown>) {
  return advantshopClientFetch<AdvantShopCatalogResponse>("/api/catalog", {
    method: "POST",
    body,
  });
}

async function fetchAllCatalogProducts(body: Record<string, unknown>) {
  const products: NonNullable<AdvantShopCatalogResponse["products"]> = [];
  let page = 1;
  let totalPages = 1;
  const pageSize = 500;

  do {
    const response = await fetchCatalogPage({
      ...body,
      page,
      itemsPerPage: pageSize,
    });
    products.push(...(response.products ?? []));
    totalPages = response.pager?.totalPageCount ?? 1;
    page += 1;
  } while (page <= totalPages);

  return products;
}

async function fetchProductProperties(productId: number): Promise<AdvantShopProperty[]> {
  const response = await advantshopClientFetch<AdvantShopPropertiesResponse>(
    `/api/products/${productId}/properties`,
    { searchParams: { type: "inDetails" } }
  ).catch(() => [] as AdvantShopPropertiesResponse);

  return flattenAdvantShopProperties(response);
}

export async function fetchAdvantShopCategories() {
  return advantshopFetch<AdvantShopCategoriesResponse>("/api/categories", {
    searchParams: { parentCategoryId: 0, extended: true },
  });
}

async function mapCatalogItems(
  items: NonNullable<AdvantShopCatalogResponse["products"]>,
  collectionSlug: CollectionSlug
): Promise<Product[]> {
  return Promise.all(
    items.map(async (item) => {
      const properties = await fetchProductProperties(item.productId).catch(
        () => [] as AdvantShopProperty[]
      );
      return mapCatalogProduct(item, collectionSlug, properties);
    })
  );
}

export async function fetchAdvantShopProducts(options?: {
  collection?: CollectionSlug;
  sort?: string;
}): Promise<Product[]> {
  const categoryMap = getCategoryUrlMap();
  const sort = SORT_MAP[options?.sort ?? "default"] ?? "NoSorting";

  if (options?.collection) {
    const categoryUrl = categoryMap[options.collection];
    if (!categoryUrl) return [];

    try {
      const items = await fetchAllCatalogProducts({
        url: categoryUrl,
        sorting: sort,
      });
      return mapCatalogItems(items, options.collection);
    } catch (error) {
      if (isMissingCategoryError(error)) {
        console.warn(
          `AdvantShop category not found for "${options.collection}" (url: ${categoryUrl})`
        );
        return [];
      }
      throw error;
    }
  }

  const slugs = Object.keys(categoryMap) as CollectionSlug[];
  if (!slugs.length) return [];

  const results = await Promise.all(
    slugs.map(async (slug) => {
      const url = categoryMap[slug];
      if (!url) return [] as Product[];

      try {
        const items = await fetchAllCatalogProducts({ url, sorting: sort });
        return mapCatalogItems(items, slug);
      } catch (error) {
        if (isMissingCategoryError(error)) {
          console.warn(
            `AdvantShop category not found for "${slug}" (url: ${url})`
          );
          return [] as Product[];
        }
        throw error;
      }
    })
  );

  const merged = new Map<number, Product>();
  for (const list of results) {
    for (const product of list) {
      merged.set(product.id, product);
    }
  }

  return Array.from(merged.values());
}

export async function findAdvantShopProductById(
  productId: number
): Promise<Product | undefined> {
  const products = await fetchAdvantShopProducts();
  return products.find((product) => product.id === productId);
}

export async function loadAdvantShopProductDetails(
  productId: number,
  collectionSlug: CollectionSlug
): Promise<ProductDetails | null> {
  const [details, properties] = await Promise.all([
    advantshopClientFetch<AdvantShopProductDetailsResponse>(
      `/api/products/${productId}`
    ),
    fetchProductProperties(productId).catch(() => [] as AdvantShopProperty[]),
  ]);

  if (!details?.productId) return null;

  return mapProductDetails(details, collectionSlug, properties);
}
