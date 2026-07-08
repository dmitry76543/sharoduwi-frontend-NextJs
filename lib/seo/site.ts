export const SITE_NAME = "ШАРОДУВЫ";

/** Оба частых поисковых запроса — в title и описаниях */
export const SEO_BALLOONS = "гелиевые и воздушные шары";
export const SEO_BALLOONS_TITLE = "Гелиевые и воздушные шары";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://sharoduwi.ru";

export const SITE_DESCRIPTION =
  "ШАРОДУВЫ — гелиевые и воздушные шары и шарики, фольгированные цифры и праздничные композиции в Жуковском, Раменском и Люберецком районах. Делаем праздник с 2005 года.";

/** OG-изображение по умолчанию (коллекция «Наборы шаров базовые») */
export const DEFAULT_OG_IMAGE = "/images/%D0%9D%D0%B0%D0%B1%D0%BE%D1%80%D1%8B%20%D1%88%D0%B0%D1%80%D0%BE%D0%B2%20%D0%B1%D0%B0%D0%B7%D0%BE%D0%B2%D1%8B%D0%B5.png";

export const SITE_PHONE = "+7-926-708-63-74";
export const SITE_PHONE_RAW = "+79267086374";

export const SITE_LOCATIONS = [
  {
    name: "ШАРОДУВЫ — ул. Чкалова",
    streetAddress: "ул. Чкалова, д. 6, цокольный этаж",
    addressLocality: "Жуковский",
    addressRegion: "Московская область",
    postalCode: "140180",
    mapUrl: "https://yandex.ru/maps/org/sharoduvy/1855601489/",
  },
  {
    name: "ШАРОДУВЫ — ТЦ «Фермер»",
    streetAddress: "ул. Мясищева, д. 28/1, ТЦ «Фермер»",
    addressLocality: "Жуковский",
    addressRegion: "Московская область",
    postalCode: "140180",
    mapUrl: "https://yandex.ru/maps/org/sharoduvy/1796536309/",
  },
] as const;
