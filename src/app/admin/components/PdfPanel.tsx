import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PdfFormat } from "../pdf/MenuPdf";
import { pdfFileName } from "../pdf/fileName";
import { cleanWeek } from "../lib/menu";
import type { WeekMenu } from "../lib/types";

const FORMATS: { id: PdfFormat; label: string; hint: string }[] = [
  { id: "a4", label: "A4 – vývěska", hint: "jedna A4 na výšku" },
  { id: "a5x2", label: "2× A5 – na stoly", hint: "A4 na šířku, po rozstřižení dvě A5" },
];

/** Náhled PDF, který se sám překresluje při úpravách (s krátkým zpožděním). */
export function PdfPanel({ week }: { week: WeekMenu }) {
  const [format, setFormat] = useState<PdfFormat>("a4");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const timer = window.setTimeout(async () => {
      try {
        // react-pdf je velký – načte se až s prvním náhledem, ne s přihlášením
        const { renderMenuPdf } = await import("../pdf/renderPdf");
        const blob = await renderMenuPdf(cleanWeek(week), format);
        if (cancelled) return;
        const next = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = next;
        setUrl(next);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [week, format]);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5" role="radiogroup" aria-label="Formát PDF">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={format === f.id}
              title={f.hint}
              onClick={() => setFormat(f.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                format === f.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <a
            href={url ?? undefined}
            download={pdfFileName(week, format)}
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

      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
        {url && (
          <iframe
            key={url}
            title="Náhled PDF"
            src={`${url}#toolbar=0&navpanes=0&view=Fit`}
            className="absolute inset-0 h-full w-full"
          />
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
