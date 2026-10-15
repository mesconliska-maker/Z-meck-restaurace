import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import type { StandingMenu } from "../../lib/standingMenu";
import { registerPdfFonts } from "./fonts";
import { StandingMenuPdfDocument, type ListekLang } from "./StandingMenuPdf";

export async function renderStandingMenuPdf(menu: StandingMenu, lang: ListekLang): Promise<Blob> {
  const assetBase = window.location.origin;
  registerPdfFonts(assetBase);
  // createElement místo JSX – soubor je .ts kvůli souladu s renderPdf.ts
  return pdf(createElement(StandingMenuPdfDocument, { menu, lang, assetBase }) as never).toBlob();
}
