import { DEFAULT_SERVING_HOURS, type DayEntry, type MenuItem, type WeekMenu } from "./types";
import { czechHoliday, dayName, formatShort, weekDates } from "./week";

export const ALLERGENS: Record<string, string> = {
  "1": "obiloviny obsahující lepek",
  "2": "korýši",
  "3": "vejce",
  "4": "ryby",
  "5": "arašídy",
  "6": "sója",
  "7": "mléko",
  "8": "skořápkové plody",
  "9": "celer",
  "10": "hořčice",
  "11": "sezam",
  "12": "oxid siřičitý a siřičitany",
  "13": "vlčí bob",
  "14": "měkkýši",
};

export const NOTE_SUGGESTIONS = [
  "Státní svátek – zavřeno",
  "Státní svátek – otevřeno, polední menu nepodáváme",
  "Svátek, otevřeno",
  "Zavřeno – soukromá akce",
  "Dovolená – zavřeno",
];

export function emptyItem(): MenuItem {
  return { name: "", price: "", allergens: "" };
}

export function emptyDay(date: string): DayEntry {
  const holiday = czechHoliday(date);
  return {
    date,
    soup: emptyItem(),
    meals: [emptyItem(), emptyItem()],
    note: holiday ? `${holiday} – zavřeno` : "",
    closed: Boolean(holiday),
  };
}

export function emptyWeek(weekStart: string): WeekMenu {
  return {
    weekStart,
    days: weekDates(weekStart).map(emptyDay),
    servingHours: DEFAULT_SERVING_HOURS,
    footerNote: "",
    published: false,
  };
}

function normalizeItem(raw: unknown): MenuItem {
  const r = (raw ?? {}) as Partial<MenuItem>;
  return {
    name: typeof r.name === "string" ? r.name : "",
    price: typeof r.price === "string" ? r.price : r.price != null ? String(r.price) : "",
    allergens: typeof r.allergens === "string" ? r.allergens : "",
  };
}

/**
 * Srovná data z úložiště do úplné podoby (vždy 5 dní Po–Pá se správnými daty),
 * aby UI i PDF nemusely řešit chybějící pole ani starší formát záznamu.
 */
export function normalizeWeek(raw: Partial<WeekMenu> & { weekStart: string }): WeekMenu {
  const stored = Array.isArray(raw.days) ? raw.days : [];
  const days = weekDates(raw.weekStart).map((date) => {
    const found = stored.find((d) => d?.date === date);
    if (!found) return emptyDay(date);
    return {
      date,
      soup: normalizeItem(found.soup),
      meals: Array.isArray(found.meals) ? found.meals.map(normalizeItem) : [],
      note: typeof found.note === "string" ? found.note : "",
      closed: Boolean(found.closed),
    };
  });
  return {
    weekStart: raw.weekStart,
    days,
    servingHours: raw.servingHours || DEFAULT_SERVING_HOURS,
    footerNote: raw.footerNote ?? "",
    published: Boolean(raw.published),
    updatedAt: raw.updatedAt,
    updatedBy: raw.updatedBy,
  };
}

/** Odstraní prázdné řádky jídel a přebytečné mezery – volá se před uložením. */
export function cleanWeek(week: WeekMenu): WeekMenu {
  const trimItem = (i: MenuItem): MenuItem => ({
    name: i.name.trim(),
    price: i.price.trim(),
    allergens: i.allergens.trim(),
  });
  return {
    ...week,
    servingHours: week.servingHours.trim() || DEFAULT_SERVING_HOURS,
    footerNote: week.footerNote.trim(),
    days: week.days.map((d) => ({
      ...d,
      note: d.note.trim(),
      soup: trimItem(d.soup),
      meals: d.meals.map(trimItem).filter((m) => m.name),
    })),
  };
}

export function formatPrice(price: string): string {
  const p = price.trim();
  if (!p) return "";
  return /^\d+([.,]\d+)?$/.test(p) ? `${p} Kč` : p;
}

export function filledMeals(day: DayEntry): MenuItem[] {
  return day.meals.filter((m) => m.name.trim());
}

/** Den, který se má zobrazit jako "jen poznámka" (zavřeno / bez menu). */
export function isNoteOnlyDay(day: DayEntry): boolean {
  return day.closed || (!day.soup.name.trim() && filledMeals(day).length === 0);
}

export function usedAllergens(week: WeekMenu): string[] {
  const set = new Set<string>();
  for (const d of week.days) {
    if (d.closed) continue;
    for (const item of [d.soup, ...d.meals]) {
      for (const a of item.allergens.split(/[^\d]+/)) {
        if (ALLERGENS[a]) set.add(a);
      }
    }
  }
  return [...set].sort((a, b) => Number(a) - Number(b));
}

/** Upozornění pro klienta před zveřejněním / tiskem. Neblokují uložení. */
export function weekWarnings(week: WeekMenu): string[] {
  const out: string[] = [];
  week.days.forEach((d) => {
    if (d.closed) {
      if (!d.note.trim()) out.push(`${dayLabel(d)}: je označený jako zavřeno, ale chybí poznámka (např. „Státní svátek – zavřeno“).`);
      return;
    }
    if (!d.soup.name.trim()) out.push(`${dayLabel(d)}: chybí polévka.`);
    if (filledMeals(d).length === 0) out.push(`${dayLabel(d)}: chybí hlavní jídla.`);
  });
  return out;
}

function dayLabel(d: DayEntry): string {
  return `${dayName(d.date)} ${formatShort(d.date)}`;
}
