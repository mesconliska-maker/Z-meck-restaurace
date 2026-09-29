// Datový model týdenního poledního menu (administrace + PDF + budoucí veřejný web).
//
// Data se ukládají jako jeden záznam na týden (klíč = pondělí daného týdne),
// dny Po–Pá jsou uvnitř jako JSON. Pro jednu restauraci a pár zápisů týdně
// je to nejjednodušší model – celý týden se vždy načte a uloží najednou.

export interface MenuItem {
  name: string;
  /** Volný text – "149" se v PDF zobrazí jako "149 Kč", "149 Kč" zůstane beze změny. */
  price: string;
  /** Čísla alergenů oddělená čárkou, např. "1, 3, 7". */
  allergens: string;
}

export interface DayEntry {
  /** ISO datum YYYY-MM-DD */
  date: string;
  soup: MenuItem;
  meals: MenuItem[];
  /** Poznámka ke dni, např. "Státní svátek – zavřeno". */
  note: string;
  /** Den bez poledního menu (svátek, zavřeno, soukromá akce) – zobrazí se jen poznámka. */
  closed: boolean;
}

export interface WeekMenu {
  /** ISO datum pondělí daného týdne */
  weekStart: string;
  days: DayEntry[];
  servingHours: string;
  /** Volitelný text do patičky PDF a pod menu na webu (např. "Ke každému menu káva za 29 Kč"). */
  footerNote: string;
  published: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface WeekSummary {
  weekStart: string;
  published: boolean;
  updatedAt?: string;
}

export const DEFAULT_SERVING_HOURS = "11:00–14:00";
