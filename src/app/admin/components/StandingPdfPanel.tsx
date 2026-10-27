import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StandingMenu } from "../../lib/standingMenu";
import { standingPdfFileName, type ListekLang } from "../pdf/StandingMenuPdf";
import { errorText } from "../../lib/staleChunk";

const LANGS: { id: ListekLang; label: string }[] = [
  { id: "cs-de", label: "Česky + německy" },
  { id: "cs", label: "Jen česky" },
  { id: "de", label: "Jen německy" },
];

/** Náhled PDF jídelního lístku (A4, více stran), překresluje se při úpravách. */
export function StandingPdfPanel({ menu }: { menu: StandingMenu }) {
  const [lang, setLang] = useState<ListekLang>("cs-de");
  const missingDe = menu.categories.reduce((n, c) => n + c.items.filter((i) => i.name.trim() && !i.nameDe.trim()).length, 0);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const timer = window.setTimeout(async () => {
      try {
        // react-pdf je velký – načte se až s otevřením této záložky
        const { renderStandingMenuPdf } = await import("../pdf/renderStandingPdf");
        const blob = await renderStandingMenuPdf(menu, lang);
        if (cancelled) return;
        const next = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = next;
        setUrl(next);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(errorText(e));
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [menu, lang]);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5" role="radiogroup" aria-label="Jazyk">
          {LANGS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={lang === o.id}
              onClick={() => setLang(o.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                lang === o.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <a
            href={url ?? undefined}
            download={standingPdfFileName(lang)}
            aria-disabled={!url}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-orange-700 px-3 py-2 text-sm font-medium text-white hover:bg-orange-800 ${
              url ? "" : "pointer-events-none opacity-50"
            }`}
          >
            <Download size={16} /> Stáhnout PDF
          </a>
          <a
            href={url ?? undefined}
            target="_blank"
            rel="noopener"
            aria-disabled={!url}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 ${
              url ? "" : "pointer-events-none opacity-50"
            }`}
            title="Otevře PDF v nové záložce – odtud ho vytisknete (Ctrl/Cmd + P)"
          >
            <ExternalLink size={16} /> Otevřít a tisknout
          </a>
        </div>
      </div>
      <p className="mb-2 text-xs text-stone-500">
        A4 na výšku, více stran. Kategorie se mezi stranami nedělí – když se nevejde, začne na další straně.
      </p>
      {lang === "de" && missingDe > 0 && (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {missingDe} {missingDe === 1 ? "jídlo nemá" : missingDe < 5 ? "jídla nemají" : "jídel nemá"} německý název – v PDF
          zůstane česky.
        </p>
      )}

      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
        {url && (
          <iframe key={url} title="Náhled PDF" src={`${url}#toolbar=0&navpanes=0&view=FitH`} className="absolute inset-0 h-full w-full" />
        )}
        {busy && (
          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-stone-600 shadow">
            <Loader2 size={14} className="animate-spin" /> Připravuji PDF…
          </div>
        )}
        {error && (
          <div className="absolute inset-x-3 bottom-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            PDF se nepodařilo vytvořit: {error}
          </div>
        )}
      </div>
    </div>
  );
}
