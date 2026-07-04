/** URL-slug населённого пункта */
export type CitySlug = string;

export interface CitySeo {
  homeTitle: string;
  homeDescription: string;
  homeH1?: string;
  heroLead: string;
  areaLabel: string;
}

export interface CityDelivery {
  detailsSlug: string;
  deliveryInLabel: string;
  zones: string[];
  lead: string;
}

export interface CityConfig {
  slug: CitySlug;
  name: string;
  namePrepositional: string;
  nameGenitive: string;
  nameInstrumental: string;
  hasStores: boolean;
  isDefault?: boolean;
  district: string;
  seo: CitySeo;
  delivery: CityDelivery;
  faq?: { q: string; a: string }[];
}

export interface CityPublic extends CityConfig {
  basePath: string;
}
