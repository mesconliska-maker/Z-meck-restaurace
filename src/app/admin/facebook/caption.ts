// Text příspěvku na Facebook – celé menu i jako text, aby šlo číst bez
// rozkliknutí obrázku, hledat v něm a přečíst ho čtečkou obrazovky.

import { RESTAURANT } from "../lib/restaurant";
import { filledMeals, formatPrice, isNoteOnlyDay } from "../lib/menu";
import type { MenuItem, WeekMenu } from "../lib/types";
import { dayName, formatShort, formatWeekRangeLong } from "../lib/week";

function line(prefix: string, item: MenuItem): string {
  const price = formatPrice(item.price);
  return `${prefix}${item.name}${price ? ` – ${price}` : ""}`;
}

export function buildCaption(week: WeekMenu): string {
  const parts: string[] = [`Polední menu ${formatWeekRangeLong(week.weekStart)}`];

  for (const d of week.days) {
    const head = `${dayName(d.date).toUpperCase()} ${formatShort(d.date)}`;
    if (isNoteOnlyDay(d)) {
      parts.push(`${head}\n${d.note || "Polední menu se nepodává"}`);
      continue;
    }
    const rows = [head];
    if (d.soup.name) rows.push(line("Polévka: ", d.soup));
    filledMeals(d).forEach((m, i) => rows.push(line(`${i + 1}. `, m)));
    if (d.note) rows.push(d.note);
    parts.push(rows.join("\n"));
  }

  const footer = [`Polední menu podáváme ${week.servingHours}.`];
  if (week.footerNote) footer.push(week.footerNote);
  footer.push(`${RESTAURANT.address} · ${RESTAURANT.phone}`);
  footer.push(`https://${RESTAURANT.web}`);
  parts.push(footer.join("\n"));

  return parts.join("\n\n");
}
