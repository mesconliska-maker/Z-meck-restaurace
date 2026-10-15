// Stálý jídelní lístek (stránka /menu) – datový model, výchozí obsah a načtení
// pro veřejný web. Upravuje se v administraci (/admin/jidelni-listek), ukládá
// do Supabase (tabulka standing_menu, jeden řádek). Když databáze neodpoví,
// web ukáže DEFAULT_STANDING_MENU – obsah lístku v době napojení na administraci.

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "../admin/lib/config";

export interface StandingMenuItem {
  id: string;
  name: string;
  /** Německý překlad (menší šedou kurzívou pod názvem), nepovinný */
  nameDe: string;
  /** Volný text – "175" se zobrazí jako "175 Kč", "175 Kč" zůstane beze změny */
  price: string;
  /** Štítek OBLÍBENÉ */
  popular: boolean;
}

export interface StandingMenuCategory {
  id: string;
  /** Např. "Polévky / Suppen" */
  name: string;
  items: StandingMenuItem[];
}

export interface StandingMenu {
  categories: StandingMenuCategory[];
  /** Řádky poznámky pod lístkem (poloviční porce, alergeny, DPH…) */
  notes: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatStandingPrice(price: string): string {
  const p = price.trim();
  if (!p) return "";
  return /^\d+([.,]\d+)?$/.test(p) ? `${p} Kč` : p;
}

function normalizeItem(raw: unknown): StandingMenuItem {
  const r = (raw ?? {}) as Partial<StandingMenuItem>;
  return {
    id: typeof r.id === "string" && r.id ? r.id : newId(),
    name: typeof r.name === "string" ? r.name : "",
    nameDe: typeof r.nameDe === "string" ? r.nameDe : "",
    price: typeof r.price === "string" ? r.price : r.price != null ? String(r.price) : "",
    popular: Boolean(r.popular),
  };
}

/** Srovná data z úložiště do úplné podoby (chybějící pole, starší formát). */
export function normalizeStandingMenu(raw: Partial<StandingMenu> | null | undefined): StandingMenu {
  const cats = Array.isArray(raw?.categories) ? raw.categories : [];
  return {
    categories: cats.map((c) => {
      const r = (c ?? {}) as Partial<StandingMenuCategory>;
      return {
        id: typeof r.id === "string" && r.id ? r.id : newId(),
        name: typeof r.name === "string" ? r.name : "",
        items: Array.isArray(r.items) ? r.items.map(normalizeItem) : [],
      };
    }),
    notes: Array.isArray(raw?.notes) ? raw.notes.filter((n): n is string => typeof n === "string") : [],
    updatedAt: raw?.updatedAt,
    updatedBy: raw?.updatedBy,
  };
}

/** Odstraní prázdné řádky a přebytečné mezery – volá se před uložením. */
export function cleanStandingMenu(menu: StandingMenu): StandingMenu {
  return {
    ...menu,
    categories: menu.categories
      .map((c) => ({
        ...c,
        name: c.name.trim(),
        items: c.items
          .map((i) => ({ ...i, name: i.name.trim(), nameDe: i.nameDe.trim(), price: i.price.trim() }))
          .filter((i) => i.name),
      }))
      .filter((c) => c.name || c.items.length),
    notes: menu.notes.map((n) => n.trim()).filter(Boolean),
  };
}

/** Řádek tabulky standing_menu → StandingMenu */
export function rowToStandingMenu(row: { categories: unknown; notes: unknown; updated_at?: string; updated_by?: string | null }): StandingMenu {
  return normalizeStandingMenu({
    categories: row.categories as StandingMenuCategory[],
    notes: row.notes as string[],
    updatedAt: row.updated_at,
    updatedBy: row.updated_by ?? undefined,
  });
}

/**
 * Jídelní lístek pro veřejný web. Vrací null, když databáze není nastavená,
 * lístek v ní ještě není nebo nastala chyba – stránka pak ukáže výchozí obsah.
 */
export async function fetchStandingMenu(timeoutMs = 5000): Promise<StandingMenu | null> {
  if (!isSupabaseConfigured) return null;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/standing_menu?id=eq.1&select=*`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;
    const menu = rowToStandingMenu(row);
    return menu.categories.length > 0 ? menu : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export const DEFAULT_STANDING_MENU: StandingMenu = {
  categories: [
    {
      id: "c1",
      name: "Studené předkrmy / Kalte Vorspeisen",
      items: [
        { id: "c1-1", name: "100 g Tatarský biftek, 3 ks topinek", nameDe: "Tatar Beafsteak, 3 st geröstete Brotscheiben", price: "175 Kč", popular: false },
        { id: "c1-2", name: "80 g Hovězí carpaccio, parmezán, capary, bylinková bagetka", nameDe: "Rindercarpaccio, Parmesan, Kapern und Baguette", price: "175 Kč", popular: false },
        { id: "c1-3", name: "100 g Krevety v křupavé panádě, mangovo-limetkový dip, wakame salát, bagetka", nameDe: "Garnelen in knuspriger Panade, Mango-Limetten-Dip, Wakame-Salat, Baguette", price: "179 Kč", popular: false },
        { id: "c1-4", name: "150 g Caprese s mozarellou Burrata, bagetka", nameDe: "Caprese mit Burrata-Mozzarella, Baguette", price: "169 Kč", popular: false },
      ],
    },
    {
      id: "c2",
      name: "Polévky / Suppen",
      items: [
        { id: "c2-1", name: "Dle denní nabídky", nameDe: "Nach Tagesangebot", price: "49 Kč", popular: false },
        { id: "c2-2", name: "Tomatová, bylinková bageta", nameDe: "Tomatensuppe mit Baguette", price: "69 Kč", popular: false },
        { id: "c2-3", name: "Hříbková, bylinková bageta", nameDe: "Steinpilzsuppe mit Baguette", price: "69 Kč", popular: false },
      ],
    },
    {
      id: "c3",
      name: "Speciality",
      items: [
        { id: "c3-1", name: "300 g Gril mix (rump steak, panenka, kuřecí prso), pečená zelenina, bramborový špíz, chedarová omáčka, BBQ dip", nameDe: "Grill-Mix (Rumpsteak, Schweinefilet, Hähnchenbrust), gebratenes Gemüse, Kartoffelspieß, Cheddarsoße, BBQ-Dip", price: "349 Kč", popular: false },
        { id: "c3-2", name: "Burger s trhaným hovězím masem, slaninou a chedarovými uhlíky, batátové hranolky, BBQ smoked dip", nameDe: "Burger mit Pulled Beef, Bacon und Cheddar-Chips, Süßkartoffel-Pommes, BBQ-Smoked-Dip", price: "299 Kč", popular: false },
      ],
    },
    {
      id: "c4",
      name: "Saláty / Salate",
      items: [
        { id: "c4-1", name: "S krevetami v křupavé panádě, mangový dip, bagetka", nameDe: "Mit Garnelen in knuspriger Panade, Mango-Dip, Baguette", price: "269 Kč", popular: false },
        { id: "c4-2", name: "S rozpečeným hermelínem, karamelizované ořechy, vinaigrette, bylinková bageta", nameDe: "Mit gerösteten Camembert, karamellisierten Nüssen, Vinaigrette, Baguette", price: "249 Kč", popular: false },
        { id: "c4-3", name: "S kuřecím masem, slaninový chips, parmezán, caesar dresink a bylinková bageta", nameDe: "Mit Hühnerfleisch, Speckchips, Parmesan Käse, Caesar Dressing, Baguette", price: "249 Kč", popular: true },
      ],
    },
    {
      id: "c5",
      name: "Bezmasá jídla / Vegetarisches Essen",
      items: [
        { id: "c5-1", name: "150 g Smažený sýr, tatarka", nameDe: "Panierter Käse, Remoulade", price: "159 Kč", popular: false },
        { id: "c5-2", name: "150 g Rozpečený hermelín s pečenou zeleninou, bylinkový dip, bagetka", nameDe: "Überbackener Hermelin mit geröstetem Gemüse, Kräuterdip, Baguette", price: "189 Kč", popular: false },
        { id: "c5-3", name: "200 g Smažený sýrový talíř (eidam, niva, balkánský sýr, hermelín), spousta čerstvé zeleniny, bylinkový dip, brusinky", nameDe: "Frittierter Käseteller (Edamer, Blauschimmelkäse, Balkan-Käse, Hermelinkäse), viel frisches Gemüse, Kräuterdip, Preiselbeeren", price: "229 Kč", popular: false },
      ],
    },
    {
      id: "c6",
      name: "Ryby / Fisch",
      items: [
        { id: "c6-1", name: "200 g Losos filet s mangovo-limetkovou omáčkou, wakame salátek, batátové hranolky", nameDe: "Lachsfilet mit Mango-Limetten-Soße, Wakame-Salat, Süßkartoffel-Pommes", price: "329 Kč", popular: false },
        { id: "c6-2", name: "200 g Losos filet s bylinkovým máslem a spoustou čerstvé zeleniny, creme fraiche, tomatová salsa", nameDe: "Lachsfilet mit Kräuterbutter und viel frischem Gemüse, Crème fraîche, Tomatensalsa", price: "329 Kč", popular: false },
      ],
    },
    {
      id: "c7",
      name: "Drůbež / Geflügel",
      items: [
        { id: "c7-1", name: "200 g Kuřecí medailonky BBQ sweet chilli, restovaná zelenina, cibulové kroužky, creme fraiche", nameDe: "Hähnchenmedaillons mit BBQ-Sweet-Chili-Soße, gebratenem Gemüse, Zwiebelringen und Crème fraîche", price: "279 Kč", popular: false },
        { id: "c7-2", name: "200 g Mini bramborové noky s kuřecím masem, cherry rajčátky a jemnou tomatovou omáčkou, parmezán", nameDe: "Mini-Kartoffelgnocchi mit Hähnchenfleisch, Kirschtomaten und einer milden Tomatensoße, Parmesan", price: "259 Kč", popular: false },
        { id: "c7-3", name: "200 g Kuřecí steak s bylinkovým máslem, spousta čerstvé zeleniny, bylinkový dip a tomatová salsa", nameDe: "Hähnchensteak mit Kräuterbutter, reichlich frischem Gemüse, Kräuterdip und Tomatensalsa", price: "269 Kč", popular: false },
        { id: "c7-4", name: "200 g Kachní prso s pikantní zeleninou, šťouchaný bylinkový brambor", nameDe: "Entenbrust mit pikantem Gemüse, gestampfte Kräuterkartoffeln", price: "299 Kč", popular: false },
        { id: "c7-5", name: "200 g Smažený kuřecí řízek obalený v sezamu", nameDe: "Hühnerschnitzel in Sezam paniert", price: "189 Kč", popular: false },
      ],
    },
    {
      id: "c8",
      name: "Vepřové maso / Schwein",
      items: [
        { id: "c8-1", name: "200 g Vepřové medailonky s hříbkovou omáčkou", nameDe: "Schweinemedailons mit Steinpilzsauce", price: "259 Kč", popular: false },
        { id: "c8-2", name: "200 g Marinovaný špalíček BBQ sweet chilli, pečená zelenina, cibulové kroužky, creme fraiche", nameDe: "Marinierter BBQ sweet chilli Schweinefilet, Grillgemüse, Zwiebelringe, Creme Fraiche", price: "299 Kč", popular: true },
        { id: "c8-3", name: "200 g Smažený vepřový řízek", nameDe: "Schweineschnitzel paniert", price: "189 Kč", popular: false },
        { id: "c8-4", name: "200 g Řízečky z panenky v panko strouhance, šťouchaný slaninový brambor, zelný salát s křenem", nameDe: "Schnitzel (Schweinefile), Speckkartoffeln mit Zwiebel, Krautsalat mit Meerrettich", price: "299 Kč", popular: false },
      ],
    },
    {
      id: "c9",
      name: "Hovězí maso / Rind",
      items: [
        { id: "c9-1", name: "200 g Hovězí steak na barevném pepři, hráškové lusky se slaninou a cibulové kroužky, creme fraiche", nameDe: "Rindersteak mit buntem Pfeffer, Zuckerschoten mit Speck und Zwiebelringen, Crème fraîche", price: "420 Kč", popular: true },
      ],
    },
    {
      id: "c10",
      name: "Dětské jídlo / Kinder Menü",
      items: [
        { id: "c10-1", name: "100 g Kuřecí řízek, hranolky, kečup", nameDe: "Hähnchenschnitzel, Pommes Frites, Ketschup", price: "179 Kč", popular: false },
      ],
    },
    {
      id: "c11",
      name: "Přílohy / Beilagen",
      items: [
        { id: "c11-1", name: "180 g Hranolky s chedarovým přelivem posypané drcenou cibulkou se slaninou", nameDe: "Pommes mit Chedar Sosse und Zwiebelspeck", price: "75 Kč", popular: false },
        { id: "c11-2", name: "180 g Batátové hranolky", nameDe: "Süßkartoffel-Pommes", price: "75 Kč", popular: false },
        { id: "c11-3", name: "180 g Hranolky, krokety", nameDe: "Pommes Frites, Kroketten", price: "50 Kč", popular: false },
        { id: "c11-4", name: "150 g Opékaný pařížský brambor", nameDe: "Pariser Bratkartoffeln", price: "50 Kč", popular: false },
        { id: "c11-5", name: "180 g Americký brambor", nameDe: "Amerikanische Kartoffeln", price: "50 Kč", popular: false },
        { id: "c11-6", name: "180 g Bramboráčky", nameDe: "Kartoffelrösti", price: "50 Kč", popular: false },
        { id: "c11-7", name: "180 g Šťouchaný slaninový brambor", nameDe: "Kartoffeln mit Speck", price: "50 Kč", popular: false },
        { id: "c11-8", name: "180 g Vařený brambor", nameDe: "Gekochte Kartoffeln", price: "37 Kč", popular: false },
        { id: "c11-9", name: "150 g Pečená zelenina", nameDe: "Gegrillte Gemüse", price: "69 Kč", popular: false },
        { id: "c11-10", name: "200 g Míchaný salát", nameDe: "Gemischter Salat", price: "79 Kč", popular: false },
        { id: "c11-11", name: "180 g Zelný salát", nameDe: "Kräutersalat", price: "47 Kč", popular: false },
        { id: "c11-12", name: "80 g Kečup", nameDe: "Ketschup", price: "25 Kč", popular: false },
        { id: "c11-13", name: "80 g Tatarská omáčka", nameDe: "Remoulade", price: "35 Kč", popular: false },
      ],
    },
    {
      id: "c12",
      name: "Dezerty / Nachspeisen",
      items: [
        { id: "c12-1", name: "Trhanec s vanilkovou omáčkou a malinovým rozvarem", nameDe: "Kaiserschmarn mit Vanillesauce und Himbeermus", price: "99 Kč", popular: false },
        { id: "c12-2", name: "Čokoládové brownies s pistáciovým krémem a čerstvým ovocem", nameDe: "Schokoladen-Brownies mit Pistaziencreme und frischen Früchten", price: "99 Kč", popular: false },
        { id: "c12-3", name: "Čokoládový fondant s vanilkovou zmrzlinou", nameDe: "Schokoladenfondant mit Vanille-Eiscreme", price: "105 Kč", popular: true },
        { id: "c12-4", name: "Cheesecake s malinovou omáčkou", nameDe: "Cheesecake mit Himbeersauce", price: "99 Kč", popular: false },
        { id: "c12-5", name: "Horké maliny", nameDe: "Heisse Himbeeren", price: "99 Kč", popular: false },
      ],
    },
  ],
  notes: [
    "Všechna poloviční hlavní jídla = polovina ceny + 30 Kč",
    "Veškeré alergeny jsou na požádání u obsluhy.",
    "Ceny jsou uvedeny včetně DPH. Změna cen vyhrazena.",
  ],
};
