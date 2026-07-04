import type { CityConfig } from "@/lib/cities/types";
import { buildAreaLabel } from "@/lib/cities/area-label";
import type { CityEnhancement } from "@/lib/cities/city-enhancements";
import { MANUAL_CITY_ENHANCEMENT_NAMES } from "@/lib/cities/city-enhancements";
import {
  DEFAULT_SETTLEMENT_DISTRICT,
  SETTLEMENT_DISTRICT_OVERRIDES,
  SETTLEMENT_NAMES,
} from "@/lib/cities/settlements-data";
import { buildSettlementForms } from "@/lib/cities/settlement-forms";

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

type Ctx = { prep: string; name: string; kind: SettlementKind };

type SettlementKind = "village" | "industrial" | "sanatorium" | "microdistrict";

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length];
}

function detectSettlementKind(name: string): SettlementKind {
  if (/санатор/i.test(name)) return "sanatorium";
  if (/завод|комбинат|СВХ|ВЭИ|агрохим|фарфор|стройматериал|электроизолятор|ремзавод/i.test(name)) {
    return "industrial";
  }
  if (/мкр|Жилино|Городок|микрорайон/i.test(name)) return "microdistrict";
  return "village";
}

function districtDeliveryHint(district: string): string {
  if (district.includes("Люберц")) return "тарифы Люберецкого округа";
  if (district.includes("Бронниц")) return "тарифы Бронницкого округа";
  if (district.includes("Фрязино")) return "доставка по Фрязино";
  return "тарифы Раменского района";
}

const HERO_OPENINGS: readonly ((c: Ctx) => string)[] = [
  (c) => `Гелиевые и воздушные шары с доставкой в ${c.prep}`,
  (c) => `Закажите яркие композиции с доставкой в ${c.prep}`,
  (c) => `Оформим праздник шарами в ${c.prep}`,
  (c) => `Привозим гелиевые букеты и цифры в ${c.prep}`,
  (c) => `Воздушные шары на торжество в ${c.prep}`,
  (c) => `Шары с доставкой в ${c.prep} — ${c.name}`,
  (c) => `Праздничные наборы с доставкой в ${c.prep}`,
  (c) => `Гелиевые композиции для ${c.prep}`,
  (c) => `Фольгированные цифры и букеты в ${c.prep}`,
  (c) => `Яркие шары с доставкой в ${c.prep}`,
  (c) => `Наборы и фонтаны с доставкой в ${c.prep}`,
  (c) => `Композиции из латекса и фольги в ${c.prep}`,
];

const HERO_MIDDLES: readonly ((c: Ctx) => string)[] = [
  () => "— для дома, дачи или загородного праздника.",
  () => "— букеты, цифры и тематические наборы под ваш повод.",
  () => ": дни рождения, юбилеи, выпускные и семейные застолья.",
  () => " — фольга, латекс и авторские связки.",
  () => ". Собираем каждый заказ вручную в Жуковском.",
  () => ". Поможем подобрать цвета и размер под бюджет.",
  () => " — курьер приедет в согласованный час.",
  () => ". Фото готового заказа перед выездом по запросу.",
  () => " — доставка из мастерской точно ко времени.",
  () => ". Hi-Float и проверенный гелий для долгого полёта.",
  () => " — оформление квартиры, банкета или детского праздника.",
  () => ". Согласуем состав и время заранее с менеджером.",
  (c) =>
    c.kind === "industrial"
      ? " — корпоративные и семейные мероприятия."
      : " — от первого годика до юбилеев.",
  (c) =>
    c.kind === "sanatorium"
      ? " — для гостей и резидентов санаторной зоны."
      : " — ярко, аккуратно и без шаблонов.",
];

const HERO_CLOSINGS: readonly ((c: Ctx) => string)[] = [
  () => "Привозим из Жуковского.",
  () => "Сборка не с конвейера.",
  () => "Напишите — подберём шары под ваш адрес.",
  () => "Стоимость доставки уточним при заказе.",
  () => "Самовывоз возможен в Жуковском.",
  () => "Работаем с 2005 года.",
  (c) => `Доставляем в ${c.name} и по округу.`,
  () => "Заказ через каталог, MAX или WhatsApp.",
  () => "Курьер к подъезду или калитке.",
  () => "Предоплата и точное время — с менеджером.",
];

const FAQ_ANSWERS: readonly ((prep: string, hint: string) => string)[] = [
  (prep, hint) =>
    `Да. Доставляем в ${prep} из Жуковского — ${hint}. Напишите адрес, рассчитаем стоимость.`,
  (prep) =>
    `Да. Привозим в ${prep} — обычно в день заказа или на следующий, время согласуем заранее.`,
  (prep, hint) =>
    `Да. Возим в ${prep} по ${hint}. Уточните адрес и желаемое время.`,
  (prep) =>
    `Да. Курьер приедет в ${prep} в согласованный интервал. Самовывоз — в Жуковском.`,
  (prep, hint) =>
    `Да. Привозим в ${prep} — ${hint}, минимальная сумма у менеджера.`,
  (prep) =>
    `Да. Доставляем в ${prep} и окрестности. Поможем с выбором и расчётом доставки.`,
  (prep) =>
    `Да. Возим в ${prep} из мастерской. Стоимость зависит от адреса — подскажем при заказе.`,
  (prep, hint) =>
    `Да. Работаем с ${prep}, ${hint}. Согласуем состав и дату заранее.`,
  (prep) =>
    `Да. Гелиевые и фольгированные шары в ${prep} — фото заказа перед выездом по запросу.`,
  (prep, hint) =>
    `Да. Доставка в ${prep} возможна, ${hint}. Позвоните — подскажем ближайшее время.`,
  (prep) =>
    `Да. Привозим в ${prep} точно ко времени торжества. Напишите состав и адрес.`,
  (prep, hint) =>
    `Да. Из Жуковского в ${prep} — ${hint}. Рассчитаем доставку при оформлении.`,
];

function buildHeroLead(name: string, namePrepositional: string): string {
  const kind = detectSettlementKind(name);
  const ctx: Ctx = { prep: namePrepositional, name, kind };
  const h = hashString(name);
  const opening = pick(HERO_OPENINGS, h);
  const middle = pick(HERO_MIDDLES, h >>> 8);
  const closing = pick(HERO_CLOSINGS, h >>> 16);
  return `${opening(ctx)} ${middle(ctx)} ${closing(ctx)}`.replace(/\s+/g, " ").trim();
}

function buildFaqAnswer(name: string, namePrepositional: string, district: string): string {
  const hint = districtDeliveryHint(district);
  const h = hashString(`${name}|faq`);
  return pick(FAQ_ANSWERS, h)(namePrepositional, hint);
}

function buildFaq(name: string, namePrepositional: string, district: string): CityConfig["faq"] {
  return [
    {
      q: `Доставляете в ${namePrepositional}?`,
      a: buildFaqAnswer(name, namePrepositional, district),
    },
    ...SHARED_FAQ_TAIL,
  ];
}

export function buildGeneratedSettlementEnhancement(
  name: string,
  namePrepositional: string,
  district: string
): CityEnhancement {
  return {
    seo: {
      homeH1: `Гелиевые шары с доставкой в ${namePrepositional}`,
      heroLead: buildHeroLead(name, namePrepositional),
      areaLabel: buildAreaLabel(namePrepositional, district),
    },
    faq: buildFaq(name, namePrepositional, district),
  };
}

const GENERATED_CACHE = new Map<string, CityEnhancement>();

function getGeneratedEnhancement(name: string): CityEnhancement {
  let cached = GENERATED_CACHE.get(name);
  if (cached) return cached;

  const forms = buildSettlementForms(name);
  const district = SETTLEMENT_DISTRICT_OVERRIDES[name] ?? DEFAULT_SETTLEMENT_DISTRICT;
  cached = buildGeneratedSettlementEnhancement(name, forms.namePrepositional, district);
  GENERATED_CACHE.set(name, cached);
  return cached;
}

export function getSettlementEnhancement(
  name: string,
  manual?: CityEnhancement
): CityEnhancement {
  if (manual) return manual;
  return getGeneratedEnhancement(name);
}

export function countGeneratedSettlements(): number {
  return SETTLEMENT_NAMES.filter((name) => !MANUAL_CITY_ENHANCEMENT_NAMES.has(name)).length;
}
