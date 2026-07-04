import type { CityConfig, CityPublic, CitySlug } from "@/lib/cities/types";
import { buildAreaLabel } from "@/lib/cities/area-label";
import { CITY_ENHANCEMENTS, type CityEnhancement } from "@/lib/cities/city-enhancements";
import { getSettlementEnhancement } from "@/lib/cities/settlement-content-generator";
import {
  DEFAULT_SETTLEMENT_DISTRICT,
  isLyuberetskyDistrict,
  PRIMARY_SETTLEMENT_NAMES,
  SETTLEMENT_DISTRICT_OVERRIDES,
  SETTLEMENT_NAMES,
} from "@/lib/cities/settlements-data";
import {
  buildSettlementForms,
  buildUniqueSlugs,
} from "@/lib/cities/settlement-forms";

const SHARED_FAQ_TAIL = [
  {
    q: "Как оформить заказ?",
    a: "Выбираете шары в каталоге и пишете нам в MAX, Telegram или WhatsApp — либо звоните. Поможем выбрать, согласуем состав, время и доставку.",
  },
  {
    q: "Сколько шары держат полёт?",
    a: "Зависит от типа. Латекс с Hi-Float в отопительный сезон летает до 2 недель, фольгированные — дольше. Условия гарантии — в разделе «Гарантия на полёт».",
  },
  {
    q: "Можно собрать композицию под мой повод и цвета?",
    a: "Конечно. Каждую композицию собираем вручную под ваш повод, тематику и цветовую гамму.",
  },
  {
    q: "А заказать срочно, на сегодня?",
    a: "Часто это возможно — зависит от загрузки и наличия. Напишите или позвоните, подскажем ближайшее время.",
  },
] as const;

const SLUG_BY_NAME = buildUniqueSlugs(SETTLEMENT_NAMES);

function buildSettlementSeo(
  name: string,
  namePrepositional: string,
  district: string
): CityConfig["seo"] {
  return {
    homeTitle: `Гелиевые и воздушные шары с доставкой в ${namePrepositional}`,
    homeDescription: `Заказ гелиевых и воздушных шаров с доставкой в ${namePrepositional}. Сборка композиций в Жуковском, доставка точно к торжеству.`,
    homeH1: `Гелиевые и воздушные шары с доставкой в ${namePrepositional}`,
    heroLead: `Гелиевые и воздушные шары с доставкой в ${namePrepositional}. Собираем композиции вручную и привозим в согласованное время.`,
    areaLabel: buildAreaLabel(namePrepositional, district),
  };
}

function resolveDetailsSlug(name: string, district: string): string {
  if (name === "Жуковский") return "zhukovsky";
  if (isLyuberetskyDistrict(district)) return "lyubertsy";
  return "ramenskoe";
}

function buildSettlementDelivery(
  name: string,
  namePrepositional: string,
  district: string
): CityConfig["delivery"] {
  const detailsSlug = resolveDetailsSlug(name, district);
  const lyuberetsky = detailsSlug === "lyubertsy";

  return {
    detailsSlug,
    deliveryInLabel: lyuberetsky
      ? `${namePrepositional} и Люберецком округе`
      : namePrepositional,
    lead: lyuberetsky
      ? `Доставляем гелиевые и воздушные шары в ${namePrepositional} из мастерской в Жуковском. Тарифы Люберецкого округа — на странице доставки, точную сумму подскажет менеджер.`
      : `Доставляем гелиевые и воздушные шары в ${namePrepositional} из нашей мастерской в Жуковском. Стоимость и время уточняйте у менеджера.`,
    zones: lyuberetsky
      ? [name, "Люберецкий городской округ", "Жилые кварталы и частный сектор"]
      : [name, "Жилые кварталы и частный сектор"],
  };
}

function buildSettlementCity(name: string): CityConfig {
  const slug = SLUG_BY_NAME.get(name)!;
  const forms = buildSettlementForms(name);
  const district = SETTLEMENT_DISTRICT_OVERRIDES[name] ?? DEFAULT_SETTLEMENT_DISTRICT;
  const isZhukovsky = name === "Жуковский";

  return {
    slug,
    name,
    ...forms,
    hasStores: isZhukovsky,
    isDefault: isZhukovsky,
    district,
    seo: buildSettlementSeo(name, forms.namePrepositional, district),
    delivery: buildSettlementDelivery(name, forms.namePrepositional, district),
    faq: [
      {
        q: `Доставляете в ${forms.namePrepositional}?`,
        a: isZhukovsky
          ? "Да. Возим по всему Жуковскому круглосуточно. Также удобный самовывоз с ул. Чкалова и из ТЦ «Фермер»."
          : `Да. Привозим шары в ${forms.namePrepositional} из Жуковского — тариф зависит от адреса, уточните у менеджера.`,
      },
      ...SHARED_FAQ_TAIL,
    ],
  };
}

function mergeCityConfig(base: CityConfig, patch?: CityEnhancement): CityConfig {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    seo: { ...base.seo, ...patch.seo },
    delivery: { ...base.delivery, ...patch.delivery },
    faq: patch.faq ?? base.faq,
  };
}

/** Все населённые пункты зоны доставки */
export const CITIES: CityConfig[] = SETTLEMENT_NAMES.map((name) =>
  mergeCityConfig(
    buildSettlementCity(name),
    getSettlementEnhancement(name, CITY_ENHANCEMENTS[name])
  )
);

export const CITY_SLUGS: CitySlug[] = CITIES.map((city) => city.slug);

export const DEFAULT_CITY_SLUG: CitySlug =
  CITIES.find((city) => city.isDefault)?.slug ?? "zhukovskiy";

export const CITY_COOKIE = "sharoduwi_city";

export const LEGACY_CITY_SLUGS: Record<string, CitySlug> = {
  zhukovsky: "zhukovskiy",
  ilinskoe: "ilinskoe",
};

export function toPublicCity(city: CityConfig): CityPublic {
  return {
    ...city,
    basePath: `/${city.slug}`,
  };
}

export function getAllCities(): CityPublic[] {
  return CITIES.map(toPublicCity);
}

export function getCityBySlug(slug: string): CityPublic | undefined {
  const normalized = LEGACY_CITY_SLUGS[slug] ?? slug;
  const city = CITIES.find((item) => item.slug === normalized);
  return city ? toPublicCity(city) : undefined;
}

export function isCitySlug(slug: string): slug is CitySlug {
  return getCityBySlug(slug) !== undefined;
}

export function getDefaultCity(): CityPublic {
  return getCityBySlug(DEFAULT_CITY_SLUG)!;
}

export const PRIMARY_CITY_SLUGS: CitySlug[] = PRIMARY_SETTLEMENT_NAMES.map(
  (name) => SLUG_BY_NAME.get(name)!
);

export function getPrimaryCities(): CityPublic[] {
  return PRIMARY_CITY_SLUGS.map((slug) => getCityBySlug(slug)!);
}

/** Населённые пункты кроме основных городов, по алфавиту */
export function getSecondaryCities(): CityPublic[] {
  const primary = new Set(PRIMARY_CITY_SLUGS);
  return getAllCities()
    .filter((city) => !primary.has(city.slug))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function resolveCitySlug(input?: string | null): CitySlug {
  if (input && isCitySlug(input)) return getCityBySlug(input)!.slug;
  return DEFAULT_CITY_SLUG;
}

export function getCityByName(name: string): CityPublic | undefined {
  const slug = SLUG_BY_NAME.get(name);
  return slug ? getCityBySlug(slug) : undefined;
}

export { SETTLEMENT_NAMES };
