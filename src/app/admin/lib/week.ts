// Práce s kalendářními daty a týdny – vždy v českém čase (Europe/Prague),
// nezávisle na časovém pásmu prohlížeče nebo serveru.
//
// Kalendářní data držíme jako ISO řetězce "YYYY-MM-DD" a počítáme s nimi
// přes UTC, takže přechod na letní/zimní čas nikdy neposune den.

export const PRAGUE_TZ = "Europe/Prague";

export const DAY_NAMES = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

const MONTHS_GENITIVE = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

/** Menu se přepíná na nový týden v pondělí v 00:01 českého času. */
export const WEEK_SWITCH_DELAY_MS = 60_000;

const pragueDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: PRAGUE_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Dnešní datum v Praze jako "YYYY-MM-DD". */
export function pragueDate(now: Date = new Date()): string {
  return pragueDateFormat.format(now);
}

function toUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtc(d);
}

/** 0 = pondělí … 6 = neděle */
export function weekdayIndex(iso: string): number {
  return (toUtc(iso).getUTCDay() + 6) % 7;
}

export function mondayOf(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

/**
 * Pondělí týdne, který má být právě vidět na webu.
 * Posuneme okamžik o minutu zpět a vezmeme pražské datum – v pondělí
 * mezi 00:00:00 a 00:00:59 tak ještě platí minulý týden, od 00:01 nový.
 * Stejnou logiku má SQL view `current_week_menu` (supabase/schema.sql).
 */
export function activeWeekStart(now: Date = new Date()): string {
  return mondayOf(pragueDate(new Date(now.getTime() - WEEK_SWITCH_DELAY_MS)));
}

export function weekDates(weekStart: string): string[] {
  return [0, 1, 2, 3, 4].map((i) => addDays(weekStart, i));
}

export function dayName(iso: string): string {
  return DAY_NAMES[weekdayIndex(iso)];
}

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** "29.9.2026" – stejný formát, jaký dnes zobrazuje web (z menicka.cz). */
export function formatCompact(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d}.${m}.${y}`;
}

/** "29. 9." */
export function formatShort(iso: string): string {
  const { m, d } = parts(iso);
  return `${d}. ${m}.`;
}

/** "28. 9. – 2. 10. 2026" */
export function formatWeekRange(weekStart: string): string {
  const end = addDays(weekStart, 4);
  return `${formatShort(weekStart)} – ${formatShort(end)} ${parts(end).y}`;
}

/** "28. září – 2. října 2026" (slovně, pro PDF) */
export function formatWeekRangeLong(weekStart: string): string {
  const a = parts(weekStart);
  const b = parts(addDays(weekStart, 4));
  const left = a.m === b.m ? `${a.d}.` : `${a.d}. ${MONTHS_GENITIVE[a.m - 1]}`;
  const leftYear = a.y !== b.y ? ` ${a.y}` : "";
  return `${left}${leftYear} – ${b.d}. ${MONTHS_GENITIVE[b.m - 1]} ${b.y}`;
}

/** Převede "29.9.2026" (formát menicka.cz) na ISO, nebo null. */
export function parseCompact(text: string): string | null {
  const m = text.replace(/\s+/g, "").match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

// --- České státní svátky -------------------------------------------------

const FIXED_HOLIDAYS: Record<string, string> = {
  "01-01": "Nový rok",
  "05-01": "Svátek práce",
  "05-08": "Den vítězství",
  "07-05": "Den Cyrila a Metoděje",
  "07-06": "Den upálení mistra Jana Husa",
  "09-28": "Den české státnosti",
  "10-28": "Den vzniku samostatného československého státu",
  "11-17": "Den boje za svobodu a demokracii",
  "12-24": "Štědrý den",
  "12-25": "1. svátek vánoční",
  "12-26": "2. svátek vánoční",
};

/** Velikonoční neděle (anonymní gregoriánský algoritmus). */
function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Název státního svátku v daný den, nebo null. */
export function czechHoliday(iso: string): string | null {
  const fixed = FIXED_HOLIDAYS[iso.slice(5)];
  if (fixed) return fixed;
  const easter = easterSunday(Number(iso.slice(0, 4)));
  if (iso === addDays(easter, -2)) return "Velký pátek";
  if (iso === addDays(easter, 1)) return "Velikonoční pondělí";
  return null;
}
