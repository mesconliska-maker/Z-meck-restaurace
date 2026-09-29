import { Font } from "@react-pdf/renderer";

let registeredBase: string | null = null;

/**
 * Zaregistruje fonty webu (Cormorant Garamond + Inter) pro PDF.
 * Statické TTF leží v /public/fonts/pdf – react-pdf neumí variabilní fonty
 * ani woff2 subsety z Google Fonts a potřebujeme plnou českou diakritiku.
 */
export function registerPdfFonts(assetBase: string) {
  if (registeredBase === assetBase) return;
  registeredBase = assetBase;
  const f = (file: string) => `${assetBase}/fonts/pdf/${file}`;

  Font.register({
    family: "Cormorant",
    fonts: [
      { src: f("CormorantGaramond-Medium.ttf"), fontWeight: 500 },
      { src: f("CormorantGaramond-SemiBold.ttf"), fontWeight: 600 },
      { src: f("CormorantGaramond-MediumItalic.ttf"), fontWeight: 500, fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "Inter",
    fonts: [
      { src: f("Inter-Regular.ttf"), fontWeight: 400 },
      { src: f("Inter-Medium.ttf"), fontWeight: 500 },
      { src: f("Inter-SemiBold.ttf"), fontWeight: 600 },
    ],
  });
  // Výchozí dělení slov je anglické a češtinu láme nesmyslně – vypínáme.
  Font.registerHyphenationCallback((word) => [word]);
}
