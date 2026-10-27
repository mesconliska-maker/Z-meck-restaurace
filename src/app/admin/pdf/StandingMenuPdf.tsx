// Tisková podoba stálého jídelního lístku (react-pdf) – A4 na výšku, více stran.
//
// Stejný jazyk jako polední menu (MenuPdf.tsx): bílý papír, Cormorant + Inter,
// jediná doplňková barva je zlatá z loga. Lístek se na jednu stranu nevejde,
// proto:
//   - kategorie se mezi stranami nedělí – když se nevejde, začne na další straně
//     (jen kategorie delší než celá strana se dělí, a to vždy mezi jídly,
//     a nadpis nikdy nezůstane sám dole na straně)
//   - jedno jídlo (název + německý překlad + cena) se nikdy nerozdělí
//   - od druhé strany je nahoře malé záhlaví, dole na každé straně kontakt
//     a číslo strany "2 / 3"
// Jazyk: "cs-de" (česky s německým překladem), "cs" (jen česky), "de" (jen
// německy – chybějící německý text nahradí čeština, aby nic nechybělo).

import type { ReactNode } from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatStandingPrice, type StandingMenu, type StandingMenuCategory } from "../../lib/standingMenu";
import { RESTAURANT } from "../lib/restaurant";

export type ListekLang = "cs-de" | "cs" | "de";

const TEXT = {
  "cs-de": { title: "Jídelní lístek", subtitle: "Speisekarte", running: "Jídelní lístek · Speisekarte", popular: "OBLÍBENÉ" },
  cs: { title: "Jídelní lístek", subtitle: "", running: "Jídelní lístek", popular: "OBLÍBENÉ" },
  de: { title: "Speisekarte", subtitle: "", running: "Speisekarte", popular: "BELIEBT" },
} as const;

const INK = "#1c1917";
const MUTED = "#6b645c";
// Překlady a podnázvy – tmavší než MUTED, aby se v tisku daly dobře číst.
const SOFT = "#4a443d";
const GOLD = "#8a6e3a";
const RULE = "#e4dccd";

const SERIF = "Cormorant";
const SANS = "Inter";

/** Kategorie s víc jídly než tolik se smí rozdělit mezi strany (jinak by přetekla). */
const SPLIT_ABOVE_ITEMS = 16;

const PAGE = { top: 44, bottom: 58, x: 46 };

const st = StyleSheet.create({
  page: { paddingTop: PAGE.top, paddingBottom: PAGE.bottom, paddingHorizontal: PAGE.x, backgroundColor: "#ffffff" },

  // úvod na první straně
  intro: { alignItems: "center", marginBottom: 16 },
  monogram: { width: 40, height: 40, marginBottom: 8 },
  eyebrow: { fontFamily: SANS, fontWeight: 500, fontSize: 7.5, letterSpacing: 2.4, color: GOLD, textTransform: "uppercase", marginBottom: 4 },
  title: { fontFamily: SERIF, fontWeight: 600, fontSize: 34, color: INK, lineHeight: 1.05 },
  subtitle: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 16, color: SOFT, marginTop: 2 },
  ornament: { flexDirection: "row", alignItems: "center", marginTop: 11 },
  ornamentLine: { width: 60, height: 0.6, backgroundColor: GOLD },
  ornamentDot: { width: 4, height: 4, backgroundColor: GOLD, transform: "rotate(45deg)", marginHorizontal: 7 },

  // záhlaví od 2. strany
  runningHead: {
    position: "absolute", top: 22, left: PAGE.x, right: PAGE.x,
    flexDirection: "row", justifyContent: "space-between",
    fontFamily: SANS, fontSize: 8, letterSpacing: 1.4, color: GOLD, textTransform: "uppercase",
  },

  // patička na každé straně
  footer: {
    position: "absolute", bottom: 24, left: PAGE.x, right: PAGE.x,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 0.6, borderTopColor: RULE, paddingTop: 7,
  },
  footerText: { fontFamily: SANS, fontSize: 8.5, color: MUTED, letterSpacing: 0.2 },
  pageNumber: { fontFamily: SERIF, fontWeight: 600, fontSize: 12, color: GOLD },

  // kategorie
  category: { marginBottom: 16 },
  catHead: { alignItems: "center", marginBottom: 5 },
  catName: { fontFamily: SERIF, fontWeight: 600, fontSize: 23, color: INK, lineHeight: 1.1, textAlign: "center" },
  catNameDe: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 15, color: SOFT, textAlign: "center" },
  catRule: { width: 30, height: 1, backgroundColor: GOLD, marginTop: 4 },

  // jídlo
  item: {
    flexDirection: "row", alignItems: "flex-start", paddingVertical: 4.2,
    borderBottomWidth: 0.5, borderBottomColor: RULE,
  },
  itemLast: { borderBottomWidth: 0 },
  itemText: { flex: 1, paddingRight: 14 },
  itemName: { fontFamily: SANS, fontSize: 12, color: INK, lineHeight: 1.3 },
  // Cormorant má malé písmo – proto o kus větší než česká Inter vedle něj
  itemDe: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 13.5, color: SOFT, lineHeight: 1.15 },
  priceCol: { width: 74, alignItems: "flex-end" },
  price: { fontFamily: SANS, fontWeight: 500, fontSize: 12, color: INK, lineHeight: 1.3, textAlign: "right" },
  popular: { fontFamily: SANS, fontWeight: 600, fontSize: 7, letterSpacing: 1, color: GOLD, marginTop: 1.5 },

  // poznámka na konci
  notes: { marginTop: 10, paddingTop: 9, borderTopWidth: 0.6, borderTopColor: GOLD, alignItems: "center" },
  note: { fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 13, color: INK, textAlign: "center", lineHeight: 1.35 },
  noteSmall: { fontFamily: SANS, fontSize: 9, color: MUTED, textAlign: "center", marginTop: 4 },
});

/**
 * Název jídla jen německy. Gramáž je v lístku jen u českého názvu ("200 g Losos…"),
 * proto ji převezmeme, když německý název žádnou nemá. Bez překladu zůstane čeština.
 */
function germanName(name: string, nameDe: string): string {
  const de = nameDe.trim();
  if (!de) return name;
  const weight = name.match(/^\d+(?:[.,]\d+)?\s*(?:g|kg|ml|cl|dl|l)\b/i)?.[0];
  return weight && !/^\d/.test(de) ? `${weight} ${de}` : de;
}

/** "Polévky / Suppen" → { cz: "Polévky", de: "Suppen" } */
function splitName(name: string): { cz: string; de: string } {
  const i = name.indexOf(" / ");
  return i === -1 ? { cz: name.trim(), de: "" } : { cz: name.slice(0, i).trim(), de: name.slice(i + 3).trim() };
}

function Notes({ notes: raw }: { notes: string[] }) {
  const notes = raw.filter((n) => n.trim());
  if (notes.length === 0) return null;
  return (
    <View style={st.notes} wrap={false}>
      {notes.map((n, i) =>
        i === notes.length - 1 && notes.length > 1 ? (
          <Text key={i} style={st.noteSmall}>
            {n}
          </Text>
        ) : (
          <Text key={i} style={st.note}>
            {n}
          </Text>
        ),
      )}
    </View>
  );
}

function Category({
  category,
  lang,
  children,
}: {
  category: StandingMenuCategory;
  lang: ListekLang;
  /** Obsah připojený za kategorii, který se s ní nesmí rozdělit (poznámka za poslední kategorií). */
  children?: ReactNode;
}) {
  const { cz, de } = splitName(category.name);
  const title = lang === "de" ? de || cz : cz;
  const subtitle = lang === "cs-de" ? de : "";
  const long = category.items.length > SPLIT_ABOVE_ITEMS;
  const head = (
    // minPresenceAhead: nadpis nezůstane dole na straně bez aspoň dvou jídel
    <View style={st.catHead} wrap={false} minPresenceAhead={70}>
      <Text style={st.catName}>{title}</Text>
      {subtitle ? <Text style={st.catNameDe}>{subtitle}</Text> : null}
      <View style={st.catRule} />
    </View>
  );
  return (
    <View style={st.category} wrap={long}>
      {head}
      {category.items.map((item, i) => (
        <View key={item.id} style={i === category.items.length - 1 ? [st.item, st.itemLast] : st.item} wrap={false}>
          <View style={st.itemText}>
            <Text style={st.itemName}>{lang === "de" ? germanName(item.name, item.nameDe) : item.name}</Text>
            {lang === "cs-de" && item.nameDe ? <Text style={st.itemDe}>{item.nameDe}</Text> : null}
          </View>
          <View style={st.priceCol}>
            <Text style={st.price}>{formatStandingPrice(item.price)}</Text>
            {item.popular ? <Text style={st.popular}>{TEXT[lang].popular}</Text> : null}
          </View>
        </View>
      ))}
      {children}
    </View>
  );
}

export function StandingMenuPdfDocument({
  menu,
  lang = "cs-de",
  assetBase = "",
}: {
  menu: StandingMenu;
  lang?: ListekLang;
  /** Kde leží /menu-monogram.png – v prohlížeči origin webu, v Node cesta k /public. */
  assetBase?: string;
}) {
  const t = TEXT[lang];
  // jen německy: německý řádek poznámky, kde chybí, zůstane český
  const notes = lang === "de" ? menu.notes.map((n, i) => menu.notesDe[i]?.trim() || n) : menu.notes;
  return (
    <Document title={t.title} author={RESTAURANT.name} language={lang === "de" ? "de" : "cs"}>
      <Page size="A4" style={st.page}>
        <View
          fixed
          style={st.runningHead}
          render={({ pageNumber }) =>
            pageNumber > 1 ? (
              <>
                <Text>{RESTAURANT.name}</Text>
                <Text>{t.running}</Text>
              </>
            ) : null
          }
        />

        <View style={st.intro}>
          <Image style={st.monogram} src={`${assetBase}/menu-monogram.png`} />
          <Text style={st.eyebrow}>{RESTAURANT.name}</Text>
          <Text style={st.title}>{t.title}</Text>
          {t.subtitle ? <Text style={st.subtitle}>{t.subtitle}</Text> : null}
          <View style={st.ornament}>
            <View style={st.ornamentLine} />
            <View style={st.ornamentDot} />
            <View style={st.ornamentLine} />
          </View>
        </View>

        {/* Poznámka patří k poslední kategorii – nikdy nezůstane sama na nové straně */}
        {menu.categories.map((c, i) => (
          <Category key={c.id} category={c} lang={lang}>
            {i === menu.categories.length - 1 ? <Notes notes={notes} /> : null}
          </Category>
        ))}
        {menu.categories.length === 0 && <Notes notes={notes} />}

        <View fixed style={st.footer}>
          <Text style={st.footerText}>
            {RESTAURANT.address}  ·  {RESTAURANT.phone}  ·  {RESTAURANT.web}
          </Text>
          <Text style={st.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export function standingPdfFileName(lang: ListekLang): string {
  return lang === "cs-de" ? "jidelni-listek.pdf" : lang === "cs" ? "jidelni-listek-cz.pdf" : "speisekarte-de.pdf";
}
