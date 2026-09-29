// Tisková podoba týdenního menu (react-pdf).
//
// Navrženo pro kancelářskou tiskárnu: bílý papír, žádné plné plochy ani tisk
// do kraje, jediná doplňková barva je zlatá z loga (v černobílém tisku vyjde
// jako střední šedá). Dva formáty ze stejné šablony:
//   - "a4":   A4 na výšku – vývěska, nástěnka
//   - "a5x2": A4 na šířku se dvěma kopiemi A5 vedle sebe – po rozstřižení na stoly
//
// Velikost písma se dopočítává podle množství textu (fitScale), takže krátký
// týden vyplní stránku většími písmeny a plný týden se vejde na jednu stránku.

import type { ReactElement } from "react";
import { Document, Image, Page, Path, StyleSheet, Svg, Text, View, type DocumentProps } from "@react-pdf/renderer";
import { RESTAURANT } from "../lib/restaurant";
import { ALLERGENS, filledMeals, formatPrice, isNoteOnlyDay, usedAllergens } from "../lib/menu";
import type { DayEntry, MenuItem, WeekMenu } from "../lib/types";
import { dayName, formatShort, formatWeekRangeLong } from "../lib/week";

export type PdfFormat = "a4" | "a5x2";

const INK = "#1c1917";
const MUTED = "#6b645c";
const GOLD = "#8a6e3a";
const RULE = "#ddd5c6";

const SERIF = "Cormorant";
const SANS = "Inter";

// Základní rozměry (pt) při měřítku 1 – z nich vychází styly i odhad výšky.
const BASE = {
  dayHeadWidth: 88,
  marker: 15,
  markerGap: 7,
  priceWidth: 52,
  dayPadV: 9,
  rowGap: 4.5,
  itemSize: 10,
  itemLeading: 1.35,
  soupSize: 12.5,
  soupLeading: 1.2,
};

// --- Odhad výšky sazby ------------------------------------------------------

/** Průměrná šířka znaku v em (Inter / Cormorant kurzíva) včetně rezervy na zalomení slov. */
const SANS_EM = 0.47;
const SERIF_EM = 0.41;

function textLines(text: string, widthPt: number, fontSize: number, em: number): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil((text.length * fontSize * em) / widthPt));
}

function itemLabel(item: MenuItem): string {
  // alergeny jsou menším písmem, počítáme je zhruba poloviční šířkou
  return item.allergens ? `${item.name}${" ".repeat(Math.ceil(item.allergens.length * 0.7) + 3)}` : item.name;
}

function estimateHeight(week: WeekMenu, s: number, width: number, allergenCount: number): number {
  const hasPrices = week.days.some((d) => [d.soup, ...d.meals].some((i) => i.price.trim()));
  const textWidth =
    width - s * (BASE.dayHeadWidth + BASE.marker + BASE.markerGap + (hasPrices ? BASE.priceWidth : 0));

  const header = 145 * s;
  let footer = (8 + 17 + 15) * s;
  if (week.footerNote) footer += 15 * s;
  if (allergenCount) footer += (4 + 8.5 * Math.ceil((allergenCount * 22 * 5.8 * s) / width)) * s;

  let days = 0;
  for (const d of week.days) {
    let body: number;
    if (isNoteOnlyDay(d)) {
      body = 17 * s;
    } else {
      body = 0;
      const rows: number[] = [];
      if (d.soup.name) {
        rows.push(textLines(itemLabel(d.soup), textWidth, BASE.soupSize * s, SERIF_EM) * BASE.soupSize * BASE.soupLeading * s);
      }
      for (const m of filledMeals(d)) {
        rows.push(textLines(itemLabel(m), textWidth, BASE.itemSize * s, SANS_EM) * BASE.itemSize * BASE.itemLeading * s);
      }
      body = rows.reduce((a, b) => a + b, 0) + Math.max(0, rows.length - 1) * BASE.rowGap * s;
      if (d.note) body += 17 * s;
    }
    days += Math.max(body, 31 * s) + 2 * BASE.dayPadV * s + 0.6;
  }
  return header + days + footer;
}

/** Největší měřítko, při kterém se menu vejde do daného rámečku. */
function fitScale(week: WeekMenu, box: { width: number; height: number }, min: number, max: number): number {
  const allergenCount = usedAllergens(week).length;
  for (let s = max; s > min; s -= 0.01) {
    if (estimateHeight(week, s, box.width, allergenCount) <= box.height * 0.97) return s;
  }
  return min;
}

// --- Styly --------------------------------------------------------------------

function makeStyles(k: number) {
  const s = (v: number) => Math.round(v * k * 100) / 100;
  return StyleSheet.create({
    sheet: { flexGrow: 1, flexDirection: "column" },
    header: { alignItems: "center", marginBottom: s(14) },
    monogram: { width: s(40), height: s(40), marginBottom: s(8) },
    eyebrow: {
      fontFamily: SANS, fontWeight: 500, fontSize: s(7.5), letterSpacing: s(2.4),
      color: GOLD, textTransform: "uppercase", marginBottom: s(4),
    },
    title: { fontFamily: SERIF, fontWeight: 600, fontSize: s(34), color: INK, lineHeight: 1.05 },
    range: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: s(13.5), color: MUTED, marginTop: s(3) },
    ornament: { flexDirection: "row", alignItems: "center", marginTop: s(10) },
    ornamentLine: { width: s(56), height: 0.6, backgroundColor: GOLD },
    ornamentDot: { width: s(4), height: s(4), backgroundColor: GOLD, transform: "rotate(45deg)", marginHorizontal: s(7) },

    // Dny si rovnoměrně rozdělí případné volné místo – linky mezi dny pak
    // tvoří pravidelnou mřížku i u krátkého menu.
    days: { flexGrow: 1 },
    day: {
      flexGrow: 1, flexDirection: "row", paddingVertical: s(BASE.dayPadV),
      borderTopWidth: 0.6, borderTopColor: RULE,
    },
    dayFirst: { borderTopWidth: 0 },
    dayHead: { width: s(BASE.dayHeadWidth), paddingRight: s(8) },
    dayName: { fontFamily: SERIF, fontWeight: 600, fontSize: s(17), color: INK, lineHeight: 1.1 },
    dayDate: { fontFamily: SANS, fontSize: s(8), color: MUTED, marginTop: s(2) },
    dayBody: { flex: 1 },

    row: { flexDirection: "row", alignItems: "flex-start", marginBottom: s(BASE.rowGap) },
    rowLast: { marginBottom: 0 },
    marker: { width: s(BASE.marker), marginRight: s(BASE.markerGap), alignItems: "center" },
    badge: {
      width: s(BASE.marker), height: s(BASE.marker), borderRadius: s(BASE.marker / 2),
      borderWidth: 0.8, borderColor: GOLD, alignItems: "center", justifyContent: "center", marginTop: s(0.5),
    },
    badgeText: { fontFamily: SANS, fontWeight: 600, fontSize: s(7.5), color: GOLD, lineHeight: 1 },
    bowl: { width: s(13), height: s(13), marginTop: s(0.5) },
    itemText: { flex: 1, fontFamily: SANS, fontSize: s(BASE.itemSize), color: INK, lineHeight: BASE.itemLeading },
    soupText: {
      flex: 1, fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: s(BASE.soupSize),
      color: INK, lineHeight: BASE.soupLeading,
    },
    allergens: { fontFamily: SANS, fontStyle: "normal", fontWeight: 400, fontSize: s(6.8), color: MUTED },
    price: {
      width: s(BASE.priceWidth), fontFamily: SANS, fontWeight: 500, fontSize: s(BASE.itemSize), color: INK,
      lineHeight: BASE.itemLeading, textAlign: "right",
    },
    note: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: s(13), color: MUTED, paddingTop: s(1) },
    dayNote: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: s(10.5), color: MUTED, marginTop: s(4) },

    footer: { borderTopWidth: 0.6, borderTopColor: GOLD, paddingTop: s(8), marginTop: s(4), alignItems: "center" },
    serving: { fontFamily: SERIF, fontWeight: 600, fontSize: s(13), color: INK },
    footerNote: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: s(11), color: INK, marginTop: s(2), textAlign: "center" },
    contact: { fontFamily: SANS, fontSize: s(7.5), color: MUTED, marginTop: s(5), letterSpacing: 0.2, textAlign: "center" },
    legend: { fontFamily: SANS, fontSize: s(5.8), color: MUTED, marginTop: s(4), textAlign: "center", lineHeight: 1.4 },
  });
}

type Styles = ReturnType<typeof makeStyles>;

// --- Komponenty ---------------------------------------------------------------

function SoupBowl({ st }: { st: Styles }) {
  return (
    <Svg viewBox="0 0 16 16" style={st.bowl}>
      <Path d="M2 8.5h12a6 5.5 0 0 1-12 0z" stroke={GOLD} strokeWidth={1.1} fill="none" />
      <Path d="M5.5 15h5" stroke={GOLD} strokeWidth={1.1} />
      <Path d="M6 6.2c-.9-.9.9-1.8 0-3M10 6.2c-.9-.9.9-1.8 0-3" stroke={GOLD} strokeWidth={0.9} fill="none" />
    </Svg>
  );
}

const NBSP = "\u00a0";

function ItemName({ item, st, serif }: { item: MenuItem; st: Styles; serif?: boolean }) {
  // Nezlomitelné mezery drží "(1, 3, 7)" pohromadě. Před závorkou musí být
  // obyčejná mezera – jinak react-pdf zlomí řádek na hranici textů se spojovníkem.
  const allergens = item.allergens.replace(/\s*,\s*/g, `,${NBSP}`);
  return (
    <Text style={serif ? st.soupText : st.itemText}>
      {allergens ? `${item.name} ` : item.name}
      {allergens ? <Text style={st.allergens}>{`(${allergens})`}</Text> : null}
    </Text>
  );
}

function DayBlock({ day, first, st, showPrices }: { day: DayEntry; first: boolean; st: Styles; showPrices: boolean }) {
  const meals = filledMeals(day);
  const noteOnly = isNoteOnlyDay(day);
  const price = (item: MenuItem) =>
    showPrices ? <Text style={st.price}>{formatPrice(item.price)}</Text> : null;

  return (
    <View style={first ? [st.day, st.dayFirst] : st.day} wrap={false}>
      <View style={st.dayHead}>
        <Text style={st.dayName}>{dayName(day.date)}</Text>
        <Text style={st.dayDate}>{formatShort(day.date)}</Text>
      </View>
      <View style={st.dayBody}>
        {noteOnly ? (
          <Text style={st.note}>{day.note || (day.closed ? "Polední menu se nepodává" : "")}</Text>
        ) : (
          <>
            {day.soup.name ? (
              <View style={meals.length ? st.row : [st.row, st.rowLast]}>
                <View style={st.marker}>
                  <SoupBowl st={st} />
                </View>
                <ItemName item={day.soup} st={st} serif />
                {price(day.soup)}
              </View>
            ) : null}
            {meals.map((m, i) => (
              <View key={i} style={i === meals.length - 1 ? [st.row, st.rowLast] : st.row}>
                <View style={st.marker}>
                  <View style={st.badge}>
                    <Text style={st.badgeText}>{i + 1}</Text>
                  </View>
                </View>
                <ItemName item={m} st={st} />
                {price(m)}
              </View>
            ))}
            {day.note ? <Text style={st.dayNote}>{day.note}</Text> : null}
          </>
        )}
      </View>
    </View>
  );
}

function MenuSheet({ week, st, assetBase }: { week: WeekMenu; st: Styles; assetBase: string }) {
  const allergens = usedAllergens(week);
  const showPrices = week.days.some((d) => !d.closed && [d.soup, ...d.meals].some((i) => i.price.trim()));
  return (
    <View style={st.sheet}>
      <View style={st.header}>
        <Image style={st.monogram} src={`${assetBase}/menu-monogram.png`} />
        <Text style={st.eyebrow}>{RESTAURANT.name}</Text>
        <Text style={st.title}>Polední menu</Text>
        <Text style={st.range}>{formatWeekRangeLong(week.weekStart)}</Text>
        <View style={st.ornament}>
          <View style={st.ornamentLine} />
          <View style={st.ornamentDot} />
          <View style={st.ornamentLine} />
        </View>
      </View>

      <View style={st.days}>
        {week.days.map((d, i) => (
          <DayBlock key={d.date} day={d} first={i === 0} st={st} showPrices={showPrices} />
        ))}
      </View>

      <View style={st.footer} wrap={false}>
        <Text style={st.serving}>Polední menu podáváme {week.servingHours}</Text>
        {week.footerNote ? <Text style={st.footerNote}>{week.footerNote}</Text> : null}
        <Text style={st.contact}>
          {RESTAURANT.address}  ·  {RESTAURANT.phone}  ·  {RESTAURANT.web}
        </Text>
        {allergens.length > 0 ? (
          <Text style={st.legend}>
            Alergeny: {allergens.map((a) => `${a} ${ALLERGENS[a]}`).join(", ")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// A4 = 595 × 842 pt
const A4 = { pad: { top: 36, bottom: 30, x: 46 } };
const A5_HALF = { pad: { top: 24, bottom: 20, x: 28 } };

const pageStyles = StyleSheet.create({
  a4: {
    paddingTop: A4.pad.top, paddingBottom: A4.pad.bottom, paddingHorizontal: A4.pad.x,
    backgroundColor: "#ffffff",
  },
  landscape: { flexDirection: "row", backgroundColor: "#ffffff" },
  half: {
    width: "50%", paddingTop: A5_HALF.pad.top, paddingBottom: A5_HALF.pad.bottom,
    paddingHorizontal: A5_HALF.pad.x,
  },
  cut: {
    position: "absolute", top: 14, bottom: 14, left: "50%",
    borderLeftWidth: 0.5, borderLeftColor: "#c8c2b8", borderStyle: "dashed",
  },
});

export interface MenuPdfProps {
  week: WeekMenu;
  format: PdfFormat;
  /** Kde leží /menu-monogram.png – v prohlížeči origin webu, v Node cesta k /public. */
  assetBase?: string;
  /** Dodatečné zmenšení oproti odhadu (používá renderMenuFitted při přetečení). */
  shrink?: number;
  onPageCount?: (pages: number) => void;
}

/** Neviditelný prvek, přes který se při sazbě dozvíme celkový počet stran. */
function PageCounter({ onPageCount }: { onPageCount?: (pages: number) => void }) {
  if (!onPageCount) return null;
  return (
    <Text
      fixed
      style={{ position: "absolute", top: 0, left: 0, fontSize: 1, color: "#ffffff" }}
      render={({ totalPages }) => {
        onPageCount(totalPages ?? 1);
        return " ";
      }}
    />
  );
}

export function MenuPdfDocument({ week, format, assetBase = "", shrink = 1, onPageCount }: MenuPdfProps) {
  const title = `Polední menu ${formatWeekRangeLong(week.weekStart)}`;

  if (format === "a5x2") {
    const box = { width: 421 - 2 * A5_HALF.pad.x, height: 595 - A5_HALF.pad.top - A5_HALF.pad.bottom };
    const st = makeStyles(fitScale(week, box, 0.5, 0.95) * shrink);
    return (
      <Document title={title} author={RESTAURANT.name} language="cs">
        <Page size="A4" orientation="landscape" style={pageStyles.landscape}>
          <View style={pageStyles.half}>
            <MenuSheet week={week} st={st} assetBase={assetBase} />
          </View>
          <View style={pageStyles.half}>
            <MenuSheet week={week} st={st} assetBase={assetBase} />
          </View>
          <View style={pageStyles.cut} fixed />
          <PageCounter onPageCount={onPageCount} />
        </Page>
      </Document>
    );
  }

  const box = { width: 595 - 2 * A4.pad.x, height: 842 - A4.pad.top - A4.pad.bottom };
  const st = makeStyles(fitScale(week, box, 0.72, 1.4) * shrink);
  return (
    <Document title={title} author={RESTAURANT.name} language="cs">
      <Page size="A4" style={pageStyles.a4}>
        <MenuSheet week={week} st={st} assetBase={assetBase} />
        <PageCounter onPageCount={onPageCount} />
      </Page>
    </Document>
  );
}

/**
 * Vyrenderuje menu a pokud by se i přes odhad nevešlo na jednu stranu,
 * zkusí to znovu s menší sazbou. `output` je pdf(...).toBlob() v prohlížeči
 * nebo renderToFile v Node.
 */
export async function renderMenuFitted<T>(
  props: Omit<MenuPdfProps, "shrink" | "onPageCount">,
  output: (doc: ReactElement<DocumentProps>) => Promise<T>,
): Promise<T> {
  let result: T | undefined;
  for (let shrink = 1; shrink > 0.6; shrink -= 0.05) {
    let pages = 1;
    const doc = (
      <MenuPdfDocument {...props} shrink={shrink} onPageCount={(n) => (pages = Math.max(pages, n))} />
    ) as ReactElement<DocumentProps>;
    result = await output(doc);
    if (pages <= 1) break;
  }
  return result as T;
}
