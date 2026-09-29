// Vyrenderuje ukázkové PDF menu (A4 i 2×A5) bez spouštění webu – pro ladění šablony.
//   npx tsx --tsconfig scripts/tsconfig.json scripts/render-menu-pdf.mts [výstupní-složka]
import { renderToFile } from "@react-pdf/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderMenuFitted } from "../src/app/admin/pdf/MenuPdf";
import { registerPdfFonts } from "../src/app/admin/pdf/fonts";
import { sampleFullWeek, sampleWeek } from "../src/app/admin/pdf/sample";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outDir = path.resolve(process.argv[2] ?? root);

registerPdfFonts(publicDir);
const samples = { ukazka: sampleWeek(), plny: sampleFullWeek() };
for (const [name, week] of Object.entries(samples)) {
  for (const format of ["a4", "a5x2"] as const) {
    const file = path.join(outDir, `menu-${name}-${format}.pdf`);
    await renderMenuFitted({ week, format, assetBase: publicDir }, (doc) => renderToFile(doc, file));
    console.log(file);
  }
}
