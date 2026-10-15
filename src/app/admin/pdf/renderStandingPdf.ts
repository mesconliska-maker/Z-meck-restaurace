import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import type { StandingMenu } from "../../lib/standingMenu";
import { registerPdfFonts } from "./fonts";
import { StandingMenuPdfDocument } from "./StandingMenuPdf";

export async function renderStandingMenuPdf(menu: StandingMenu, german: boolean): Promise<Blob> {
  const assetBase = window.location.origin;
  registerPdfFonts(assetBase);
  // createElement místo JSX – soubor je .ts kvůli souladu s renderPdf.ts
  return pdf(createElement(StandingMenuPdfDocument, { menu, german, assetBase }) as never).toBlob();
}
