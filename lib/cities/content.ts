import { FAQ_ITEMS } from "@/lib/data";
import type { CityPublic } from "@/lib/cities/types";

/** FAQ для города: переопределения из конфига или общий список */
export function getCityFaqItems(city: CityPublic | null | undefined) {
  if (city?.faq?.length) return city.faq;
  return FAQ_ITEMS;
}

export function getCityHeroStats(city: CityPublic | null | undefined) {
  const storesLabel = city?.hasStores
    ? "магазина в городе"
    : `доставка в ${city?.namePrepositional ?? "район"}`;

  return {
    storesLabel,
    areaLabel: city?.seo.areaLabel ?? "Жуковском и Раменском районе",
  };
}

export function getDeliveryConfigForCity(city: CityPublic) {
  const detailsSlug = city.delivery.detailsSlug;
  return {
    slug: detailsSlug,
    path: `/${city.slug}/delivery`,
    cityLabel: city.name,
    deliveryInLabel: city.delivery.deliveryInLabel,
    title: `Доставка гелиевых и воздушных шаров ${city.hasStores ? "по" : "в"} ${city.nameInstrumental}`,
    metaDescription: city.seo.homeDescription,
    lead: city.delivery.lead,
    zones: city.delivery.zones,
    pickupNote: city.hasStores
      ? "Можно забрать заказ самостоятельно: ул. Чкалова, 6 (цокольный этаж) или ул. Мясищева, 28/1, ТЦ «Фермер»."
      : "Самовывоз возможен в Жуковском: ул. Чкалова, 6 или ТЦ «Фермер» на ул. Мясищева — удобно, если забираете заказ по пути.",
    mapUrl:
      city.delivery.detailsSlug === "ramenskoe" || city.delivery.detailsSlug === "lyubertsy"
        ? "https://yandex.ru/maps/org/sharoduvy/1796536309/"
        : "https://yandex.ru/maps/org/sharoduvy/1855601489/",
    mapLabel:
      city.delivery.detailsSlug === "ramenskoe" || city.delivery.detailsSlug === "lyubertsy"
        ? "ШАРОДУВЫ на Яндекс.Картах — ТЦ «Фермер»"
        : "ШАРОДУВЫ на Яндекс.Картах — ул. Чкалова",
  };
}
