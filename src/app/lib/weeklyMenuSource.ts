// Připravené napojení veřejné sekce „Menu tohoto týdne“ na vlastní databázi.
//
// WeeklyMenu.tsx volá fetchCurrentWeekMenu() jako první zdroj; když vrátí null,
// pokračuje stávajícím /api/menu (menicka.cz) a fallbackem. Dokud je
// PUBLIC_SITE_CONNECTED = false, vrací se null hned bez dotazu – veřejný web
// se chová přesně jako dřív. Žádná závislost navíc (jen fetch na REST API).

import { PUBLIC_SITE_CONNECTED, SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "../admin/lib/config";
import { filledMeals, isNoteOnlyDay, normalizeWeek } from "../admin/lib/menu";
import type { WeekMenu } from "../admin/lib/types";
import { dayName, formatCompact, pragueDate } from "../admin/lib/week";

/** Stejný tvar dat, jaký dnes vrací /api/menu a zobrazuje WeeklyMenu.tsx. */
export interface PublicDayMenu {
  day: string;
  date: string;
  isToday: boolean;
  soup: string;
  meals: { number: string; name: string }[];
  note?: string;
}

export function toPublicDays(week: WeekMenu, today: string = pragueDate()): PublicDayMenu[] {
  return week.days
    .filter((d) => !(isNoteOnlyDay(d) && !d.note.trim()))
    .map((d) => {
      const noteOnly = isNoteOnlyDay(d);
      return {
        day: dayName(d.date),
        date: formatCompact(d.date),
        isToday: d.date === today,
        soup: noteOnly ? "" : d.soup.name.trim(),
        meals: noteOnly
          ? []
          : filledMeals(d).map((m, i) => ({ number: String(i + 1), name: m.name.trim() })),
        note: d.note.trim() || undefined,
      };
    });
}

/**
 * Menu aktuálního týdne z databáze (view current_week_menu – týden se
 * přepíná v pondělí v 00:01 českého času podle hodin databáze).
 * Vrací null, když databáze není nastavená, menu pro tento týden není
 * zveřejněné nebo nastala chyba – volající pak použije stávající zdroj.
 */
export async function fetchCurrentWeekMenu(): Promise<PublicDayMenu[] | null> {
  if (!PUBLIC_SITE_CONNECTED || !isSupabaseConfigured) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/current_week_menu?select=*`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;
    const week = normalizeWeek({
      weekStart: row.week_start,
      days: row.days,
      servingHours: row.serving_hours,
      footerNote: row.footer_note,
      published: row.published,
    });
    const days = toPublicDays(week);
    return days.length > 0 ? days : null;
  } catch {
    return null;
  }
}
