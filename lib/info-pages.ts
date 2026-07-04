import type { CollectionSlug } from "@/lib/products";

import { SITE_PHONE, SITE_PHONE_RAW } from "@/lib/seo/site";

export const FEATURED_COLLECTION_SLUGS: CollectionSlug[] = [
  "shary-pod-potolok-1",
  "set-s-tsifroi",
  "dlya-novorozhdennykh",
  "1-godik-1",
  "nabory-sharov-bazovye",
];

export type DeliveryAreaConfig = {
  slug: string;
  path: string;
  cityLabel: string;
  /** Фраза после «доставки в …» в блоке «Как заказать» */
  deliveryInLabel: string;
  title: string;
  metaDescription: string;
  lead: string;
  zones: string[];
  pickupNote: string;
  mapUrl: string;
  mapLabel: string;
};

export type DeliveryHighlight = {
  title: string;
  text: string;
};

export type DeliveryPriceRow = {
  location: string;
  condition: string;
  price: string;
};

export type DeliveryAreaDetails = {
  highlights: DeliveryHighlight[];
  pricingTitle: string;
  pricingIntro?: string;
  pricingRows: DeliveryPriceRow[];
  pricingFooterNote?: string;
  pricingOtherNote: string;
  nightSurcharge: { title: string; text: string };
  greetingService: { title: string; text: string };
  pickupTitle: string;
  pickupText: string;
  managersNote: string;
  paymentTitle: string;
  paymentIndividuals: string[];
  paymentOrganizationsTitle: string;
  paymentOrganizations: string[];
};

const DELIVERY_STANDARD_HIGHLIGHTS: DeliveryHighlight[] = [
  {
    title: "Приём заказов",
    text: "Заказы обрабатываются с 10:00 до 20:00.",
  },
  {
    title: "Доставка 24/7",
    text: "До двери квартиры или частного дома — круглосуточно, ежедневно.",
  },
  {
    title: "Предоплата",
    text: "Доставка осуществляется после предоплаты 100%.",
  },
  {
    title: "Точно ко времени",
    text: "Привозим в согласованное время или во временном диапазоне — уточняется с менеджером.",
  },
];

const DELIVERY_STANDARD_EXTRAS = {
  nightSurcharge: {
    title: "Ночная доставка",
    text: "С 00:00 до 7:00 стоимость доставки увеличивается на 400 ₽.",
  },
  greetingService: {
    title: "Поздравление от курьера",
    text: "Курьер может зачитать поздравление от вашего имени — 1 000 ₽.",
  },
  pickupTitle: "Самовывоз",
  pickupText:
    "Вы всегда можете забрать заказ сами в одном из наших магазинов — укажите это при оформлении.",
  managersNote: "Способы и цены на доставку всегда можно обсудить с нашими менеджерами.",
  paymentTitle: "Способы оплаты",
  paymentIndividuals: [
    "Наличными или банковской картой в одном из магазинов «ШАРОДУВЫ»",
    "Переводом на банковскую карту Сбер",
    "Банковской картой при заказе в интернет-магазине «ШАРОДУВЫ»",
  ],
  paymentOrganizationsTitle: "Для организаций",
  paymentOrganizations: [
    "Выставляем счёт на оплату",
    "Оплата банковским переводом на расчётный счёт",
    "Закрывающие документы передаём вместе с заказом",
  ],
} satisfies Omit<
  DeliveryAreaDetails,
  "highlights" | "pricingTitle" | "pricingRows" | "pricingOtherNote"
>;

export const DELIVERY_ZHUKOVSKY_DETAILS: DeliveryAreaDetails = {
  highlights: DELIVERY_STANDARD_HIGHLIGHTS,
  pricingTitle: "Стоимость доставки в Жуковском",
  pricingRows: [
    {
      location: "г. Жуковский",
      condition: "заказ от 1 500 ₽",
      price: "400 ₽",
    },
    {
      location: "г. Жуковский",
      condition: "заказ до 1 500 ₽",
      price: "700 ₽",
    },
  ],
  pricingOtherNote:
    "Стоимость доставки в другие населённые пункты, а также по вашему адресу уточняйте у менеджеров.",
  ...DELIVERY_STANDARD_EXTRAS,
};

export const DELIVERY_RAMENSKOE_DETAILS: DeliveryAreaDetails = {
  highlights: DELIVERY_STANDARD_HIGHLIGHTS,
  pricingTitle: "Стоимость доставки в Раменском и районе",
  pricingIntro: "Стоимость доставки — 40 ₽ за 1 км от г. Жуковский.",
  pricingRows: [
    {
      location: "г. Раменское",
      condition: "заказ от 1 500 ₽",
      price: "500 ₽",
    },
    {
      location: "г. Раменское",
      condition: "заказ до 1 500 ₽",
      price: "700 ₽",
    },
    {
      location: "п. Ильинский, Кратово (сторона г. Жуковский)",
      condition: "заказ от 1 500 ₽",
      price: "500 ₽",
    },
    {
      location: "п. Ильинский, Кратово (сторона г. Жуковский)",
      condition: "заказ до 1 500 ₽",
      price: "700 ₽",
    },
    {
      location: "п. Быково и Удельная (сторона г. Жуковский)",
      condition: "заказ от 1 500 ₽",
      price: "500 ₽",
    },
    {
      location: "п. Быково и Удельная (сторона г. Жуковский)",
      condition: "заказ до 1 500 ₽",
      price: "700 ₽",
    },
    {
      location: "п. Быково, Удельная, Кратово (сторона г. Раменское)",
      condition: "заказ от 2 000 ₽",
      price: "500 ₽",
    },
    {
      location: "п. Быково, Удельная, Кратово (сторона г. Раменское)",
      condition: "заказ до 2 000 ₽",
      price: "700 ₽",
    },
    {
      location: "д. Чулково",
      condition: "заказ от 2 000 ₽",
      price: "500 ₽",
    },
    {
      location: "д. Чулково",
      condition: "заказ до 2 000 ₽",
      price: "700 ₽",
    },
    {
      location: "Другие населённые пункты",
      condition: "минимальный заказ",
      price: "от 2 500 ₽",
    },
  ],
  pricingFooterNote: "В других населённых пунктах минимальная сумма заказа — 2 500 ₽.",
  pricingOtherNote:
    "Стоимость доставки в другие населённые пункты, а также по вашему адресу уточняйте у менеджеров.",
  ...DELIVERY_STANDARD_EXTRAS,
};

export const DELIVERY_LYUBERTSY_DETAILS: DeliveryAreaDetails = {
  highlights: DELIVERY_STANDARD_HIGHLIGHTS,
  pricingTitle: "Стоимость доставки в Люберцах и Люберецком округе",
  pricingIntro: "Стоимость доставки — 40 ₽ за 1 км от г. Жуковский.",
  pricingRows: [
    {
      location: "г. Люберцы",
      condition: "заказ от 1 500 ₽",
      price: "600 ₽",
    },
    {
      location: "г. Люберцы",
      condition: "заказ до 1 500 ₽",
      price: "800 ₽",
    },
    {
      location: "г. Дзержинский",
      condition: "заказ от 1 500 ₽",
      price: "550 ₽",
    },
    {
      location: "г. Дзержинский",
      condition: "заказ до 1 500 ₽",
      price: "750 ₽",
    },
    {
      location: "п. Томилино, Малаховка, Красково, Жилино",
      condition: "заказ от 1 500 ₽",
      price: "500 ₽",
    },
    {
      location: "п. Томилино, Малаховка, Красково, Жилино",
      condition: "заказ до 1 500 ₽",
      price: "700 ₽",
    },
    {
      location: "п. Октябрьский, Марусино, Егорово, Чкалово",
      condition: "заказ от 1 500 ₽",
      price: "500 ₽",
    },
    {
      location: "п. Октябрьский, Марусино, Егорово, Чкалово",
      condition: "заказ до 1 500 ₽",
      price: "700 ₽",
    },
    {
      location: "Другие населённые пункты Люберецкого округа",
      condition: "минимальный заказ",
      price: "от 2 500 ₽",
    },
  ],
  pricingFooterNote:
    "В других населённых пунктах Люберецкого округа минимальная сумма заказа — 2 500 ₽.",
  pricingOtherNote:
    "Стоимость доставки в конкретный адрес Люберецкого округа уточняйте у менеджеров.",
  ...DELIVERY_STANDARD_EXTRAS,
};

export const DELIVERY_DETAILS_BY_SLUG: Record<string, DeliveryAreaDetails> = {
  zhukovsky: DELIVERY_ZHUKOVSKY_DETAILS,
  ramenskoe: DELIVERY_RAMENSKOE_DETAILS,
  lyubertsy: DELIVERY_LYUBERTSY_DETAILS,
};

/** @deprecated Use DeliveryAreaDetails */
export type DeliveryZhukovskyDetails = DeliveryAreaDetails;

export const DELIVERY_MANAGER_PHONE = SITE_PHONE;
export const DELIVERY_MANAGER_PHONE_HREF = `tel:${SITE_PHONE_RAW}`;
export const DELIVERY_MANAGER_MAX =
  "https://max.ru/u/f9LHodD0cOJ0iFHpDtxRvHxZb55wWIT4L1UpmBingh61XxPU-GdBpm5h-ls";
export const DELIVERY_MANAGER_TELEGRAM = "https://t.me/+79267086374";

export const DELIVERY_ZHUKOVSKY: DeliveryAreaConfig = {
  slug: "zhukovsky",
  path: "/delivery/zhukovsky",
  cityLabel: "Жуковский",
  deliveryInLabel: "Жуковском",
  title: "Доставка гелиевых и воздушных шаров по Жуковскому",
  metaDescription:
    "Доставка гелиевых и воздушных шаров по Жуковскому — 24/7 до двери, от 400 ₽ при заказе от 1500 ₽. Предоплата 100%, самовывоз с ул. Чкалова и из ТЦ «Фермер».",
  lead:
    "Собираем композиции вручную, надуваем гелием и привозим шары в удобное для вас время — домой, в офис, ресторан или детский сад в Жуковском.",
  zones: [
    "Весь город Жуковский",
    "Жилые кварталы и новостройки",
    "Офисы, кафе и банкетные залы",
    "Детские сады и школы",
  ],
  pickupNote:
    "Можно забрать заказ самостоятельно: ул. Чкалова, 6 (цокольный этаж) или ул. Мясищева, 28/1, ТЦ «Фермер».",
  mapUrl: "https://yandex.ru/maps/org/sharoduvy/1855601489/",
  mapLabel: "ШАРОДУВЫ на Яндекс.Картах — ул. Чкалова",
};

export const DELIVERY_RAMENSKOE: DeliveryAreaConfig = {
  slug: "ramenskoe",
  path: "/delivery/ramenskoe",
  cityLabel: "Раменское и по Раменскому району",
  deliveryInLabel: "Раменское и по Раменскому району",
  title: "Доставка гелиевых и воздушных шаров в Раменское и Раменский район",
  metaDescription:
    "Доставка гелиевых и воздушных шаров в Раменское и по Раменскому району — 24/7 до двери, от 500 ₽. Тарифы по посёлкам и деревням, 40 ₽/км от Жуковского. Предоплата 100%.",
  lead:
    "Возим шары из Жуковского в Раменское и по всему Раменскому району. Согласуем состав, время и адрес — курьер приедет точно к празднику.",
  zones: [
    "г. Раменское",
    "Раменский городской округ",
    "Посёлки и дачные посёлки района",
    "Частные дома и коттеджи",
  ],
  pickupNote:
    "Самовывоз возможен в Жуковском: ул. Чкалова, 6 или ТЦ «Фермер» на ул. Мясищева — удобно, если забираете заказ по пути.",
  mapUrl: "https://yandex.ru/maps/org/sharoduvy/1796536309/",
  mapLabel: "ШАРОДУВЫ на Яндекс.Картах — ТЦ «Фермер»",
};

export const DELIVERY_LYUBERTSY: DeliveryAreaConfig = {
  slug: "lyubertsy",
  path: "/delivery/lyubertsy",
  cityLabel: "Люберцы и Люберецкий округ",
  deliveryInLabel: "Люберцы и Люберецком округе",
  title: "Доставка гелиевых и воздушных шаров в Люберцы и Люберецкий округ",
  metaDescription:
    "Доставка гелиевых и воздушных шаров в Люберцы, Дзержинский, Томилино, Малаховку и по Люберецкому округу — от 500 ₽. Сборка в Жуковском, 40 ₽/км. Предоплата 100%.",
  lead:
    "Привозим шары из Жуковского в Люберцы и по всему Люберецкому округу — Томилино, Малаховку, Красково, Дзержинский и соседние посёлки. Согласуем состав и время заранее.",
  zones: [
    "г. Люберцы и г. Дзержинский",
    "п. Томилино, Малаховка, Красково",
    "Жилино, Октябрьский, Марусино",
    "Посёлки и деревни Люберецкого округа",
  ],
  pickupNote:
    "Самовывоз возможен в Жуковском: ул. Чкалова, 6 или ТЦ «Фермер» на ул. Мясищева — удобно, если забираете заказ по пути.",
  mapUrl: "https://yandex.ru/maps/org/sharoduvy/1796536309/",
  mapLabel: "ШАРОДУВЫ на Яндекс.Картах — ТЦ «Фермер»",
};

export const ABOUT_STATS = [
  { value: "20+", label: "лет на рынке" },
  { value: "2", label: "магазина в Жуковском" },
  { value: "5000+", label: "счастливых семей" },
] as const;

export const ABOUT_STORES = [
  {
    name: "ул. Чкалова, 6",
    address: "г. Жуковский, ул. Чкалова, д. 6, цокольный этаж",
    mapUrl: "https://yandex.ru/maps/org/sharoduvy/1855601489/",
  },
  {
    name: "ТЦ «Фермер»",
    address: "г. Жуковский, ул. Мясищева, д. 28/1, ТЦ «Фермер»",
    mapUrl: "https://yandex.ru/maps/org/sharoduvy/1796536309/",
  },
] as const;

export const ABOUT_VALUES = [
  {
    title: "С 2005 года",
    text: "Тысячи букетов и композиций для семей Жуковского и Раменского района — от выписки и первого годика до юбилеев.",
  },
  {
    title: "Качественный гелий",
    text: "Используем проверенный гелий и обработку Hi-Float — шары летают дольше. Честные сроки и гарантия на полёт.",
  },
  {
    title: "Ручная сборка",
    text: "Каждую композицию собираем под ваш повод, цвета и бюджет — не с конвейера.",
  },
  {
    title: "Два шоурума",
    text: "Удобный самовывоз на ул. Чкалова и в ТЦ «Фермер» — можно посмотреть ассортимент вживую.",
  },
] as const;
