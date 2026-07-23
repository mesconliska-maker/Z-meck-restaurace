// /api/menu.ts
//
// Vercel serverless funkce – stáhne týdenní menu z menička.cz,
// vyparsuje ho a vrátí jako JSON ve struktuře, kterou očekává WeeklyMenu.tsx.
//
// Cachuje se 1 hodinu na Vercel Edge (s-maxage=3600), takže menička.cz
// se sahá maximálně 1× za hodinu i při tisíci návštěvách.
//
// Pokud parser cokoli pokazí, vrátí prázdné pole + 200 OK – frontend
// si pak zobrazí svůj hardcoded fallback.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

const MENICKA_URL = "https://www.menicka.cz/9311-zamecka-restaurace.html";

interface Meal {
  number: string;
  name: string;
}

interface DayMenu {
  day: string;
  date: string;
  isToday: boolean;
  soup: string;
  meals: Meal[];
  note?: string; // např. "Svátek, otevřeno" nebo "Pro tento den nebylo zadáno menu."
}

const DAY_NAMES = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];

function getTodayDay(): string {
  return DAY_NAMES[new Date().getDay()];
}

/**
 * Z hlavičky dne ve tvaru "Středa 6.5.2026" vytáhne {day, date}.
 * Funguje i bez datumu nebo s odlišnými oddělovači.
 */
function parseDayHeader(text: string): { day: string; date: string } | null {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const match = trimmed.match(
    /^(Pondělí|Úterý|Středa|Čtvrtek|Pátek|Sobota|Neděle)\s+(\d{1,2}\.\s*\d{1,2}\.\s*\d{4})/
  );
  if (!match) return null;
  return {
    day: match[1],
    date: match[2].replace(/\s+/g, ""),
  };
}

/**
 * Hlavní parser – vezme HTML a vrátí pole denních menu.
 *
 * Menička.cz zobrazují menu v sekci uvozené "Menu: 11:00–15:00",
 * pak následují bloky pro každý den. Každý den má hlavičku
 * (Pondělí 6.5.2026) a pod ní řádky:
 *   - polévka (řádek bez čísla)
 *   - 1. … 2. … (hlavní jídla, číslovaná)
 *   - speciální texty: "Svátek, otevřeno" / "Pro tento den nebylo zadáno menu."
 *
 * Struktura HTML se mírně liší podle toho, jak menička.cz aktuálně
 * vykreslují — proto parser pracuje text-based přístupem na celé
 * sekci menu, ne na konkrétních CSS selektorech.
 */
function parseMenu(html: string, debugLines?: string[]): DayMenu[] {
  const $ = cheerio.load(html);

  // Nejdřív vyhodíme všechny <style>, <script>, <noscript> elementy,
  // ať se nám do textu nedostane CSS / JS kód.
  $("style, script, noscript").remove();

  // Najdeme element obsahující "Menu:" hlavičku se sloupcem časem podávání.
  // Tohle je dostatečně robustní – nezávisí na konkrétní třídě.
  const bodyText = $("body").text();
  const menuStart = bodyText.search(/Menu:\s*\d{1,2}:\d{2}/);
  if (menuStart === -1) return [];

  // Useknu vše před "Menu:" a vše za patičkou (Nahlásit nepřesné údaje)
  let menuSection = bodyText.slice(menuStart);
  const cutoff = menuSection.search(/Nahlásit nepřesné údaje|Vyberte, čeho/);
  if (cutoff > 0) menuSection = menuSection.slice(0, cutoff);

  // Rozdělím sekci na řádky a vyčistím prázdné
  const lines = menuSection
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (debugLines) debugLines.push(...lines);

  const today = getTodayDay();
  const days: DayMenu[] = [];
  let current: DayMenu | null = null;

  for (const line of lines) {
    // Přeskoč CSS pravidla, HTML značky a podobné smetí — nikdy to není
    // jídlo/polévka. Detekce: obsahuje { } ; složené závorky CSS, nebo začíná .
    if (/[{};]/.test(line)) continue;
    if (/^\.[a-zA-Z-]/.test(line)) continue; // CSS selektor jako .ui-dialog
    if (/^@[a-zA-Z-]/.test(line)) continue; // @media, @keyframes
    if (line.length > 200) continue; // moc dlouhý řádek = určitě smetí

    // Hlavička dne? "Středa 6.5.2026"
    const header = parseDayHeader(line);
    if (header) {
      if (current) days.push(current);
      current = {
        day: header.day,
        date: header.date,
        isToday: header.day === today,
        soup: "",
        meals: [],
      };
      continue;
    }

    if (!current) continue;

    // Speciální texty — svátek, prázdný den
    if (/Svátek|otevřeno|Pro tento den nebylo zadáno menu/i.test(line)) {
      current.note = line.replace(/^[-•]\s*/, "").trim();
      continue;
    }

    // Číslované jídlo? "1. Pečené vepřové kostky..."
    const mealMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (mealMatch) {
      current.meals.push({
        number: mealMatch[1],
        name: mealMatch[2].trim(),
      });
      continue;
    }

    // Vše ostatní bez čísla považuju za polévku (typicky první řádek po hlavičce)
    if (!current.soup) {
      current.soup = line.replace(/^[-•]\s*/, "").trim();
    }
  }

  if (current) days.push(current);
  return days;
}

/**
 * Normalizuje název kódování (z HTTP hlavičky nebo <meta charset>) na label,
 * který zná iconv-lite.
 */
function normalizeCharset(label: string): string {
  const l = label.trim().toLowerCase();
  if (/^utf-?8$/.test(l)) return "utf-8";
  if (/^(windows-1250|cp1250|win-1250|x-cp1250)$/.test(l)) return "windows-1250";
  if (/^(iso-8859-2|latin2|latin-2)$/.test(l)) return "iso-8859-2";
  return l || "utf-8";
}

/**
 * Zkusí zjistit kódování stránky z:
 *  1) Content-Type hlavičky odpovědi (charset=...)
 *  2) <meta charset="..."> nebo <meta http-equiv="Content-Type" content="...charset=...">
 * Když nic nenajde, vrátí null (volající pak rozhodne fallback).
 *
 * Tohle je záměrně odolné vůči tomu, že menička.cz může kódování v budoucnu
 * zase změnit (přesně tohle se stalo — dřív posílali windows-1250, teď UTF-8,
 * a natvrdo zapsané "windows-1250" pak rozbíjelo veškerou diakritiku).
 */
function detectCharsetFromHeader(contentTypeHeader: string | null): string | null {
  if (!contentTypeHeader) return null;
  const match = contentTypeHeader.match(/charset=([^;]+)/i);
  return match ? normalizeCharset(match[1]) : null;
}

function detectCharsetFromMeta(buffer: Buffer): string | null {
  // Prvních pár KB stačí – <meta> je vždy v <head>. Dekódujeme jako latin1
  // (1 byte = 1 znak), protože ASCII část hlavičky (meta tagy, atributy)
  // vypadá stejně bez ohledu na skutečné kódování stránky.
  const head = buffer.slice(0, 2048).toString("latin1");
  const metaCharset = head.match(/<meta[^>]+charset=["']?([a-zA-Z0-9_-]+)/i);
  if (metaCharset) return normalizeCharset(metaCharset[1]);
  return null;
}

/**
 * Je buffer platný UTF-8? Používáme jako spolehlivý test skutečného
 * kódování – windows-1250 text s diakritikou (vysoké bajty 0x80–0xFF)
 * téměř nikdy netvoří platné vícebajtové UTF-8 sekvence, takže striktní
 * dekodér na něm spolehlivě spadne. Mnohem přesnější než hledání
 * konkrétních "mojibake" znaků v textu.
 */
function isValidUtf8(buffer: Buffer): boolean {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    return true;
  } catch {
    return false;
  }
}

function decodeMenickaHtml(buffer: Buffer, contentTypeHeader: string | null): string {
  const declared = detectCharsetFromHeader(contentTypeHeader) ?? detectCharsetFromMeta(buffer);

  // Pokud stránka sama tvrdí, že je windows-1250/iso-8859-2 (ne-UTF8),
  // a bajty skutečně nejsou platné UTF-8, věříme deklaraci.
  if (declared && declared !== "utf-8" && !isValidUtf8(buffer)) {
    return iconv.decode(buffer, declared);
  }

  // Ve všech ostatních případech: platné UTF-8 bajty → je to UTF-8
  // (ať už deklarace říká cokoli). Menička.cz historicky posílala
  // windows-1250, teď posílá UTF-8 – tenhle test funguje správně pro obě.
  if (isValidUtf8(buffer)) return iconv.decode(buffer, "utf-8");

  // Bajty nejsou platné UTF-8 → skoro jistě windows-1250 (starý formát menička.cz).
  return iconv.decode(buffer, declared ?? "windows-1250");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch(MENICKA_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ZameckaRestauraceBot/1.0; +https://www.zamecka-htyn.cz)",
      },
    });

    if (!response.ok) {
      // Stránka nedostupná → vrátíme prázdno, frontend ukáže fallback
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json({ menu: [], error: `menicka.cz returned ${response.status}` });
    }

    // Kódování stránky zjišťujeme dynamicky (Content-Type hlavička → <meta charset>
    // → utf-8 default), s mojibake pojistkou. Menička.cz totiž mezitím přešla
    // z windows-1250 na UTF-8, a natvrdo zapsané windows-1250 rozbíjelo diakritiku
    // (a tím i detekci dnů v týdnu, protože "Pondělí", "Úterý" apod. přestaly sedět).
    const buffer = Buffer.from(await response.arrayBuffer());
    const html = decodeMenickaHtml(buffer, response.headers.get("content-type"));

    // Dočasný debug režim (?debug=1): vrátí syrové řádky, jak je parser vidí,
    // ať můžeme přesně zjistit, kde se teď menička.cz liší strukturou.
    // AŽ TO DOLADÍME, TENHLE BLOK ZASE ODSTRANÍME.
    if (req.query.debug) {
      const debugLines: string[] = [];
      const menu = parseMenu(html, debugLines);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({
        menu,
        debugLines: debugLines.slice(0, 80),
        htmlSnippet: html.slice(0, 500),
      });
    }

    const menu = parseMenu(html);

    // Cache: 1 hodina na CDN, frontend si stejně cachuje sám
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    return res.status(200).json({ menu, source: "menicka.cz", fetchedAt: new Date().toISOString() });
  } catch (err: any) {
    // Cokoli neočekávaného → tichý fail, frontend má fallback
    res.setHeader("Cache-Control", "s-maxage=60");
    return res.status(200).json({ menu: [], error: err?.message ?? "unknown error" });
  }
}
