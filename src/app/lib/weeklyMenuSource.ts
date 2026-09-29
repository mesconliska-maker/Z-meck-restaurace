// Připravené napojení veřejné sekce „Menu tohoto týdne“ na vlastní databázi.
//
// ZATÍM SE NIKDE NEPOUŽÍVÁ – veřejný web dál čte /api/menu (menicka.cz).
// Po otestování administrace stačí ve WeeklyMenu.tsx nejdřív zavolat
// fetchCurrentWeekMenu() a teprve když vrátí null, pokračovat stávajícím
// fetch("/api/menu") + fallbackem. Žádná závislost navíc (jen fetch na REST
// API Supabase), takže se veřejný bundle nezvětší.

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "../admin/lib/config";
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
  if (!isSupabaseConfigured) return null;
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
