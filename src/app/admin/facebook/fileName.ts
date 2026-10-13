import type { WeekMenu } from "../lib/types";

// Samostatně, aby panel nemusel kvůli názvu souboru načítat pdf.js
export function imageFileName(week: WeekMenu): string {
  const [y, m, d] = week.weekStart.split("-").map(Number);
  return `poledni-menu-${d}-${m}-${y}.jpg`;
}
