import type { WeekMenu } from "../lib/types";
import type { PdfFormat } from "./MenuPdf";

export function pdfFileName(week: WeekMenu, format: PdfFormat): string {
  const [y, m, d] = week.weekStart.split("-").map(Number);
  return `poledni-menu-${d}-${m}-${y}${format === "a5x2" ? "-2xA5" : ""}.pdf`;
}
