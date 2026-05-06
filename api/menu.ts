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
function parseMenu(html: string): DayMenu[] {
  const $ = cheerio.load(html);

  // Najdeme element obsahující "Menu:" hlavičku se sloupcem časem podávání.
  // Tohle je dostatečně robustní – nezávisí na konkrétní třídě.
  const bodyText = $("body").text();
  const menuStart = bodyText.search(/Menu:\s*\d{1,2}:\d{2}/);
  if (menuStart === -1) return [];

  // Useknu vše před "Menu:" a vše za patičkou (Nahlásit nepřesné údaje / text)
  let menuSection = bodyText.slice(menuStart);
  const cutoff = menuSection.search(/Nahlásit nepřesné údaje|# text|# Nahlásit/);
  if (cutoff > 0) menuSection = menuSection.slice(0, cutoff);

  // Rozdělím sekci na řádky a vyčistím prázdné
  const lines = menuSection
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const today = getTodayDay();
  const days: DayMenu[] = [];
  let current: DayMenu | null = null;

  for (const line of lines) {
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

    // Menička.cz posílá obsah v kódování windows-1250 → musíme dekódovat
    const buffer = Buffer.from(await response.arrayBuffer());
    const html = iconv.decode(buffer, "windows-1250");

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
