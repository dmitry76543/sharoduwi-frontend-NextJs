import {
  SETTLEMENT_FORM_OVERRIDES,
  SETTLEMENT_SLUG_OVERRIDES,
} from "@/lib/cities/settlements-data";

const TRANSLIT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function transliterate(value: string): string {
  return Array.from(value.normalize("NFC"))
    .map((char) => {
      const lower = char.toLowerCase();
      return TRANSLIT[lower] ?? (/[a-z0-9]/i.test(char) ? char.toLowerCase() : "-");
    })
    .join("");
}

export function slugifySettlement(name: string): string {
  if (SETTLEMENT_SLUG_OVERRIDES[name]) {
    return SETTLEMENT_SLUG_OVERRIDES[name];
  }

  return transliterate(
    name
      .replace(/[«»"'`]/g, "")
      .replace(/[‑–—]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[()]/g, "")
      .toLowerCase()
  )
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface SettlementForms {
  namePrepositional: string;
  nameGenitive: string;
  nameInstrumental: string;
}

export function buildSettlementForms(name: string): SettlementForms {
  const override = SETTLEMENT_FORM_OVERRIDES[name];
  if (override) return override;

  if (/ский$/i.test(name)) {
    const stem = name.slice(0, -2);
    return {
      namePrepositional: `${stem}ском`,
      nameGenitive: `${stem}ского`,
      nameInstrumental: `${stem}скому`,
    };
  }

  if (/ое$/i.test(name)) {
    const stem = name.slice(0, -2);
    return {
      namePrepositional: `${stem}ом`,
      nameGenitive: `${stem}ого`,
      nameInstrumental: `${stem}ому`,
    };
  }

  if (/ая$/i.test(name)) {
    const stem = name.slice(0, -2);
    return {
      namePrepositional: `${stem}ой`,
      nameGenitive: `${stem}ой`,
      nameInstrumental: `${stem}ой`,
    };
  }

  if (/ий$/i.test(name)) {
    const stem = name.slice(0, -2);
    return {
      namePrepositional: `${stem}ем`,
      nameGenitive: `${stem}его`,
      nameInstrumental: `${stem}ему`,
    };
  }

  if (/ы$/i.test(name)) {
    const stem = name.slice(0, -1);
    return {
      namePrepositional: `${stem}ах`,
      nameGenitive: stem,
      nameInstrumental: `${stem}ам`,
    };
  }

  return {
    namePrepositional: name,
    nameGenitive: name,
    nameInstrumental: name,
  };
}

export function buildUniqueSlugs(names: readonly string[]): Map<string, string> {
  const map = new Map<string, string>();
  const used = new Set<string>();

  for (const name of names) {
    let base = slugifySettlement(name);
    if (!base) base = "punkt";

    let slug = base;
    let index = 2;
    while (used.has(slug)) {
      slug = `${base}-${index}`;
      index += 1;
    }

    used.add(slug);
    map.set(name, slug);
  }

  return map;
}
