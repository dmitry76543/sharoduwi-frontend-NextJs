export type AdvantShopPhoto = {
  smallSrc?: string | null;
  middleSrc?: string | null;
  bigSrc?: string | null;
  main?: boolean;
};

export type AdvantShopCatalogProduct = {
  productId: number;
  offerId?: number;
  urlPath: string;
  name: string;
  briefDescription?: string;
  artNo?: string;
  price: number;
  priceWithDiscount?: number;
  newProduct?: boolean;
  bestseller?: boolean;
  sales?: boolean;
  photoMiddle?: string | null;
  photoSmall?: string | null;
  photos?: AdvantShopPhoto[] | null;
  offers?: AdvantShopOffer[] | null;
};

export type AdvantShopCatalogResponse = {
  products?: AdvantShopCatalogProduct[];
  pager?: {
    currentPage: number;
    totalPageCount: number;
    totalCount: number;
  };
};

export type AdvantShopCategory = {
  id: number;
  name: string;
  url: string;
  parentCategoryId?: number;
};

export type AdvantShopCategoriesResponse = {
  categories?: AdvantShopCategory[];
};

export type AdvantShopOffer = {
  offerId: number;
  artNo?: string;
  price: number;
  oldPrice?: number;
  amount?: number;
  isMain?: boolean;
};

export type AdvantShopProductDetails = {
  productId: number;
  artNo?: string;
  name: string;
  urlPath: string;
  briefDescription?: string;
  description?: string;
  price: number;
  priceWithDiscount?: number;
  newProduct?: boolean;
  bestseller?: boolean;
  sales?: boolean;
  photoMiddle?: string | null;
  photoSmall?: string | null;
  photos?: AdvantShopPhoto[] | null;
  offers?: AdvantShopOffer[];
};

export type AdvantShopProperty = {
  name?: string;
  value?: string;
  propertyName?: string;
  propertyValue?: string;
};

export type AdvantShopPropertiesResponse =
  | { properties?: AdvantShopProperty[] }
  | { groupName?: string; properties?: AdvantShopProperty[] }[];

export type AdvantShopOrderAddResponse = {
  result?: boolean;
  errors?: string | string[];
  obj?: {
    Id?: number;
    Number?: string;
  };
};
