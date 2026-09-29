import { pdf } from "@react-pdf/renderer";
import type { WeekMenu } from "../lib/types";
import { renderMenuFitted, type PdfFormat } from "./MenuPdf";
import { registerPdfFonts } from "./fonts";

export async function renderMenuPdf(week: WeekMenu, format: PdfFormat): Promise<Blob> {
  const assetBase = window.location.origin;
  registerPdfFonts(assetBase);
  return renderMenuFitted({ week, format, assetBase }, (doc) => pdf(doc).toBlob());
}
