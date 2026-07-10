
export const COLORS = {
  pink: "#FF2D95",
  sky: "#36B7F0",
  sun: "#FFC93C",
  mint: "#2FD3A5",
  coral: "#FF7A59",
  lav: "#A98BF5",
  red: "#FF3B5B",
  white: "#FFFFFF",
} as const;

export type ColorKey = keyof typeof COLORS;

/** Теги для фильтра в блоке «Каталог» */
export const TAGS = [
  "Все",
  "Цифры",
  "Латексные",
  "Детям",
  "Романтика",
  "Выписка",
] as const;

export type TagFilter = (typeof TAGS)[number];
export type ProductTag = Exclude<TagFilter, "Все">;

export interface Collection {
  slug: CollectionSlug;
  name: string;
  sub: string;
  colors: ColorKey[];
  /** urlPath категории в AdvantShop (совпадает с slug) */
  categoryPath: string;
  href: string;
  img?: string;
  bg?: string;
}

export const COLLECTIONS_BASE = "https://sharoduwi.ru/categories";

export type CollectionSlug =
  | "nabory-sharov-bazovye"
  | "bazovyi-premium"
  | "premium-shary"
  | "shary-pod-potolok-1"
  | "oblaka-iz-5-sharov-bez-gruzov"
  | "fontany-iz-7-sharov"
  | "fontany-iz-sharov-1"
  | "dlya-devochek-1"
  | "dlya-malchikov-1"
  | "dlya-nee"
  | "dlya-nego"
  | "bolshie-shary-bubble"
  | "shary-gigant-s-nadpisyami-1"
  | "shary-na-devichnik"
  | "set-s-tsifroi"
  | "1-godik-1"
  | "korobki-s-sharami"
  | "dlya-novorozhdennykh"
  | "dlya-vliublennykh"
  | "pirotekhnika";

/** Коллекции = категории каталога (AdvantShop) */
export const COLLECTIONS: Collection[] = [
  { slug: "nabory-sharov-bazovye", categoryPath: "nabory-sharov-bazovye", href: `${COLLECTIONS_BASE}/nabory-sharov-bazovye`, name: "Наборы шаров базовые", sub: "на каждый праздник", colors: ["pink", "sun", "sky"] },
  { slug: "bazovyi-premium", categoryPath: "bazovyi-premium", href: `${COLLECTIONS_BASE}/bazovyi-premium`, name: "Базовый Премиум", sub: "ярче и богаче", colors: ["pink", "lav", "sky"] },
  { slug: "premium-shary", categoryPath: "premium-shary", href: `${COLLECTIONS_BASE}/premium-shary`, name: "Премиум шары", sub: "вау-эффект", colors: ["sky", "white", "lav"] },
  { slug: "shary-pod-potolok-1", categoryPath: "shary-pod-potolok-1", href: `${COLLECTIONS_BASE}/shary-pod-potolok-1`, name: "Шары под потолок", sub: "облако под потолком", colors: ["pink", "lav", "pink", "sky"] },
  { slug: "oblaka-iz-5-sharov-bez-gruzov", categoryPath: "oblaka-iz-5-sharov-bez-gruzov", href: `${COLLECTIONS_BASE}/oblaka-iz-5-sharov-bez-gruzov`, name: "Облака из 5 шаров без грузов", sub: "лёгкий набор", colors: ["pink", "lav", "sky", "mint"] },
  { slug: "fontany-iz-7-sharov", categoryPath: "fontany-iz-7-sharov", href: `${COLLECTIONS_BASE}/fontany-iz-7-sharov`, name: "Фонтаны из 7 шаров", sub: "пышный фонтан", colors: ["sun", "mint", "lav", "pink"] },
  { slug: "fontany-iz-sharov-1", categoryPath: "fontany-iz-sharov-1", href: `${COLLECTIONS_BASE}/fontany-iz-sharov-1`, name: "Фонтаны из шаров", sub: "классический фонтан", colors: ["lav", "pink", "mint"] },
  { slug: "dlya-devochek-1", categoryPath: "dlya-devochek-1", href: `${COLLECTIONS_BASE}/dlya-devochek-1`, name: "Для девочек", sub: "нежно и мило", colors: ["pink", "lav", "white"] },
  { slug: "dlya-malchikov-1", categoryPath: "dlya-malchikov-1", href: `${COLLECTIONS_BASE}/dlya-malchikov-1`, name: "Для мальчиков", sub: "ярко и смело", colors: ["sky", "mint", "white"] },
  { slug: "dlya-nee", categoryPath: "dlya-nee", href: `${COLLECTIONS_BASE}/dlya-nee`, name: "Для неё", sub: "с любовью", colors: ["pink", "red", "lav"] },
  { slug: "dlya-nego", categoryPath: "dlya-nego", href: `${COLLECTIONS_BASE}/dlya-nego`, name: "Для него", sub: "стильно", colors: ["sun", "lav", "sky"] },
  { slug: "bolshie-shary-bubble", categoryPath: "bolshie-shary-bubble", href: `${COLLECTIONS_BASE}/bolshie-shary-bubble`, name: "Шары Гигант", sub: "огромные шары", colors: ["pink", "sky"] },
  { slug: "shary-gigant-s-nadpisyami-1", categoryPath: "shary-gigant-s-nadpisyami-1", href: `${COLLECTIONS_BASE}/shary-gigant-s-nadpisyami-1`, name: "Шары Гигант с надписями", sub: "ваш текст на шаре", colors: ["pink", "lav"] },
  { slug: "shary-na-devichnik", categoryPath: "shary-na-devichnik", href: `${COLLECTIONS_BASE}/shary-na-devichnik`, name: "Шары на девичник", sub: "для подружек", colors: ["pink", "sun", "mint"] },
  { slug: "set-s-tsifroi", categoryPath: "set-s-tsifroi", href: `${COLLECTIONS_BASE}/set-s-tsifroi`, name: "Сет с цифрой", sub: "возраст в шарах", colors: ["mint", "lav", "pink"] },
  { slug: "1-godik-1", categoryPath: "1-godik-1", href: `${COLLECTIONS_BASE}/1-godik-1`, name: "1 годик", sub: "первый праздник", colors: ["sky", "pink", "sun"] },
  { slug: "korobki-s-sharami", categoryPath: "korobki-s-sharami", href: `${COLLECTIONS_BASE}/korobki-s-sharami`, name: "Коробки с шарами", sub: "сюрприз в коробке", colors: ["lav", "pink", "sun"] },
  { slug: "dlya-novorozhdennykh", categoryPath: "dlya-novorozhdennykh", href: `${COLLECTIONS_BASE}/dlya-novorozhdennykh`, name: "Для новорождённых", sub: "с появлением малыша", colors: ["sky", "white", "mint"] },
  { slug: "dlya-vliublennykh", categoryPath: "dlya-vliublennykh", href: `${COLLECTIONS_BASE}/dlya-vliublennykh`, name: "Для влюблённых", sub: "сердца", colors: ["red", "pink"] },
  { slug: "pirotekhnika", categoryPath: "pirotekhnika", href: `${COLLECTIONS_BASE}/pirotekhnika`, name: "Пиротехника", sub: "финальный залп", colors: ["coral", "sun", "red"] },
];

/** Подкатегории AdvantShop для коллекций с несколькими источниками товаров */
export const COLLECTION_MULTI_CATEGORY_PATHS: Partial<
  Record<CollectionSlug, string[]>
> = {
  pirotekhnika: [
    "batarei-saliutov",
    "bengalskie-svechi",
    "dymy",
    "petardy",
    "rimskie-svechi",
    "rakety",
    "festivalnye-shary",
    "fontany",
  ],
};

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getCollectionName(slug: CollectionSlug): string {
  return getCollectionBySlug(slug)?.name ?? slug;
}

export interface Product {
  id: number;
  name: string;
  collectionSlug: CollectionSlug;
  collection: string;
  tags: ProductTag[];
  price: number;
  old?: number;
  colors: ColorKey[];
  tag?: "hit" | "new";
  img?: string;
  artNo?: string;
  urlPath?: string;
}

export interface ProductDetails extends Product {
  slug: string;
  description?: string;
  briefDescription?: string;
  images: string[];
}

export const PRODUCTS: Product[] = [
  { id: 1, name: "Фольгированная цифра «Гелий»", collectionSlug: "set-s-tsifroi", collection: "Сет с цифрой", tags: ["Цифры"], price: 590, colors: ["pink"], tag: "hit" },
  { id: 2, name: "Набор «С Днём Рождения»", collectionSlug: "nabory-sharov-bazovye", collection: "Наборы шаров базовые", tags: [], price: 2490, old: 2900, colors: ["pink", "sun", "sky"], tag: "hit" },
  { id: 3, name: "Облако из 15 шаров", collectionSlug: "oblaka-iz-5-sharov-bez-gruzov", collection: "Облака из 5 шаров без грузов", tags: [], price: 1890, old: 2300, colors: ["pink", "sky", "mint", "lav"] },
  { id: 4, name: "Композиция «Единорог»", collectionSlug: "dlya-devochek-1", collection: "Для девочек", tags: ["Детям"], price: 2990, colors: ["lav", "pink", "mint"], tag: "new" },
  { id: 5, name: "Сердца «Я люблю тебя»", collectionSlug: "dlya-vliublennykh", collection: "Для влюблённых", tags: ["Романтика"], price: 1690, colors: ["pink", "red"] },
  { id: 6, name: "Набор «Выписка: Мальчик»", collectionSlug: "dlya-novorozhdennykh", collection: "Для новорождённых", tags: ["Выписка"], price: 2290, colors: ["sky", "white", "mint"] },
  { id: 7, name: "Набор «Выписка: Девочка»", collectionSlug: "dlya-novorozhdennykh", collection: "Для новорождённых", tags: ["Выписка"], price: 2290, colors: ["pink", "white", "lav"] },
  { id: 8, name: "Цифра + россыпь звёзд", collectionSlug: "set-s-tsifroi", collection: "Сет с цифрой", tags: ["Цифры"], price: 1290, colors: ["sun", "pink"] },
  { id: 9, name: "Букет «Радуга»", collectionSlug: "nabory-sharov-bazovye", collection: "Наборы шаров базовые", tags: [], price: 2190, colors: ["pink", "sun", "mint", "sky", "lav"], tag: "hit" },
  { id: 10, name: "Шары с конфетти (5 шт)", collectionSlug: "oblaka-iz-5-sharov-bez-gruzov", collection: "Облака из 5 шаров без грузов", tags: [], price: 990, colors: ["pink", "sun", "mint"] },
  { id: 11, name: "Композиция «Космос»", collectionSlug: "dlya-malchikov-1", collection: "Для мальчиков", tags: ["Детям"], price: 3290, colors: ["lav", "sky", "pink"], tag: "new" },
  { id: 12, name: "Гигант-сердце 90 см", collectionSlug: "dlya-vliublennykh", collection: "Для влюблённых", tags: ["Романтика"], price: 1490, colors: ["pink"] },
];

export const COL_VISIBLE = 8;

export const HERO_MINI = [
  { c: "pink" as ColorKey, x: 8, y: 4, w: 78, d: 0, dur: 5.2, rot: -4 },
  { c: "sky" as ColorKey, x: 74, y: 2, w: 70, d: 0.4, dur: 5.8, rot: 5 },
  { c: "sun" as ColorKey, x: 2, y: 42, w: 62, d: 0.8, dur: 6.2, rot: -6 },
  { c: "mint" as ColorKey, x: 80, y: 46, w: 66, d: 0.2, dur: 5.5, rot: 4 },
  { c: "coral" as ColorKey, x: 18, y: 70, w: 54, d: 1.0, dur: 6.6, rot: -3 },
  { c: "lav" as ColorKey, x: 66, y: 72, w: 58, d: 0.6, dur: 6.0, rot: 6 },
  { c: "pink" as ColorKey, x: 42, y: -6, w: 50, d: 1.3, dur: 7.0, rot: -5 },
];

export const REVIEWS: {
  initial: string;
  color: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  photo?: string;
}[] = [
  {
    initial: "Д",
    color: "var(--pink)",
    name: "Диана Т.",
    city: "ул. Чкалова, 6",
    rating: 5,
    text: "Заказывали на день рождения за день до праздника, привезли утром четко ко времени. Удобно, что есть доставка. Шары держались 1,5–2 месяца, только потом начали сдуваться. Спасибо за отличные шары!",
  },
  {
    initial: "Ю",
    color: "var(--sky)",
    name: "Юлия",
    city: "ул. Чкалова, 6",
    rating: 5,
    text: "Всё отлично: готовила фонтан из шаров на день рождения ребёнка, собрали шары, оформили доставку — всё привезли вовремя, очень предупредительный курьер, отзвонился. Спасибо, ребёнок был рад!",
  },
  {
    initial: "Н",
    color: "var(--mint)",
    name: "Наталья В.",
    city: "ул. Чкалова, 6",
    rating: 5,
    text: "Постоянно покупаю шары на разные мероприятия! Очень нравятся сотрудники — всегда посоветуют и подскажут. Большой выбор шаров и сопутствующих товаров для праздников. Однозначно советую это место!",
  },
  {
    initial: "С",
    color: "var(--coral)",
    name: "Светлана Т.",
    city: "ТЦ «Фермер»",
    rating: 5,
    text: "Отличный магазин. Срочно нужны были шары — продавец Наталья быстро сориентировалась, прислала фото шаров, оформила доставку. Всё быстро, вежливо, чётко. Рекомендую!",
  },
  {
    initial: "В",
    color: "var(--sun)",
    name: "Валерия С.",
    city: "ТЦ «Фермер»",
    rating: 5,
    text: "Прекрасный магазин: покупала шарики домой — две недели назад, до сих пор висят под потолком. Вежливые сотрудники, большой ассортимент шариков. Покупкой очень довольна!",
  },
  {
    initial: "А",
    color: "var(--lav)",
    name: "Анастасия Х.",
    city: "ТЦ «Фермер»",
    rating: 5,
    text: "Большой ассортимент шаров, свечей и всего для праздника. Приятная атмосфера, вежливое обслуживание. Помогли подобрать шары на день рождения ребёнка.",
  },
];

export const FAQ_ITEMS = [
  { q: "Доставляете в Раменское и район?", a: "Да. Возим по Жуковскому и Раменскому району и привозим точно ко времени торжества. Также удобный самовывоз из двух магазинов в Жуковском." },
  { q: "Как оформить заказ?", a: "Выбираете шары в каталоге и пишете нам в удобный мессенджер — MAX, Telegram или WhatsApp — либо звоните по телефону. Поможем выбрать, согласуем состав, время и доставку." },
  { q: "Сколько шары держат полёт?", a: "Зависит от типа. Латекс с Hi-Float в отопительный сезон летает до 2 недель, фольгированные — дольше всего. Честные сроки и условия гарантии собраны в разделе «Гарантия на полёт»." },
  { q: "Можно собрать композицию под мой повод и цвета?", a: "Конечно. Каждую композицию собираем вручную под ваш повод, тематику и цветовую гамму — от выписки и первого годика до девичника и романтики." },
  { q: "А заказать срочно, на сегодня?", a: "Часто это возможно — зависит от загрузки и наличия. Напишите или позвоните прямо сейчас, и мы подскажем ближайшее время, к которому успеем собрать и привезти." },
];
