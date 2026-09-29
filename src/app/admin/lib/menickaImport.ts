// Přechodové období: menu je pořád zadané i na menicka.cz. Tohle umožní
// jedním klikem předvyplnit týden z existujícího /api/menu, aby klient
// nemusel psát totéž dvakrát.

import { emptyItem } from "./menu";
import type { DayEntry } from "./types";
import { parseCompact } from "./week";

interface MenickaDay {
  date: string;
  soup: string;
  meals: { number: string; name: string }[];
  note?: string;
}

// /api/menu je Vercel funkce – při lokálním vývoji (vite) neexistuje,
// sáhneme tedy na produkční web (posílá Access-Control-Allow-Origin: *).
const MENU_API =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? "https://www.zamecka-htyn.cz/api/menu"
    : "/api/menu";

/** Vrátí dny z menicka.cz jako DayEntry, klíčované ISO datem. */
export async function fetchMenickaDays(): Promise<Map<string, DayEntry>> {
  const res = await fetch(MENU_API, { cache: "no-store" });
  if (!res.ok) throw new Error(`menicka.cz import selhal (HTTP ${res.status})`);
  const data = await res.json();
  const list: MenickaDay[] = Array.isArray(data?.menu) ? data.menu : [];
  const out = new Map<string, DayEntry>();

  for (const d of list) {
    const iso = parseCompact(d.date ?? "");
    if (!iso) continue;
    const meals = (d.meals ?? []).map((m) => ({ ...emptyItem(), name: m.name }));
    const soup = { ...emptyItem(), name: d.soup ?? "" };
    const note = /nebylo zadáno menu/i.test(d.note ?? "") ? "" : (d.note ?? "");
    if (!soup.name && meals.length === 0 && !note) continue;
    out.set(iso, {
      date: iso,
      soup,
      meals,
      note,
      closed: !soup.name && meals.length === 0,
    });
  }
  return out;
}
