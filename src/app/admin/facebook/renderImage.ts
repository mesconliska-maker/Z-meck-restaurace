// Obrázek menu pro Facebook: stejná sazba jako PDF (formát "social" 4:5),
// převedená přes pdf.js do JPEG 1080 × 1350 px. Design tak zůstává na jednom
// místě (MenuPdf.tsx) a obrázek vypadá přesně jako tištěné menu.

import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { renderMenuPdf } from "../pdf/renderPdf";
import type { WeekMenu } from "../lib/types";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/** Šířka výsledného obrázku v px (výška plyne z poměru 4:5). */
const TARGET_WIDTH = 1080;

export async function renderMenuImage(week: WeekMenu): Promise<Blob> {
  const pdfBlob = await renderMenuPdf(week, "social");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await pdfBlob.arrayBuffer()) }).promise;
  try {
    const page = await doc.getPage(1);
    const scale = TARGET_WIDTH / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Prohlížeč neumí kreslit do canvasu.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Obrázek se nepodařilo vytvořit."))), "image/jpeg", 0.92),
    );
  } finally {
    await doc.destroy();
  }
}
