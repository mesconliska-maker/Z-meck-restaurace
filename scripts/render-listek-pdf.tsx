// Vyrenderuje PDF stálého jídelního lístku (výchozí obsah) bez spouštění webu – pro ladění šablony.
//   npx tsx --tsconfig scripts/tsconfig.json scripts/render-listek-pdf.tsx [výstupní-složka]
import { renderToFile } from "@react-pdf/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StandingMenuPdfDocument, standingPdfFileName } from "../src/app/admin/pdf/StandingMenuPdf";
import { registerPdfFonts } from "../src/app/admin/pdf/fonts";
import { DEFAULT_STANDING_MENU } from "../src/app/lib/standingMenu";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outDir = path.resolve(process.argv[2] ?? root);

registerPdfFonts(publicDir);
for (const german of [true, false]) {
  const file = path.join(outDir, standingPdfFileName(german));
  await renderToFile(<StandingMenuPdfDocument menu={DEFAULT_STANDING_MENU} german={german} assetBase={publicDir} />, file);
  console.log(file);
}
