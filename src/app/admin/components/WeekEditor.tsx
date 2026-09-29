import { AlertTriangle, ChevronLeft, ChevronRight, DownloadCloud, Eye, EyeOff, FileText, Globe, Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PUBLIC_SITE_CONNECTED } from "../lib/config";
import { cleanWeek, emptyWeek, weekWarnings } from "../lib/menu";
import { fetchMenickaDays } from "../lib/menickaImport";
import { getMenuStore } from "../lib/store";
import type { DayEntry, WeekMenu, WeekSummary } from "../lib/types";
import { activeWeekStart, addDays, formatShort, formatWeekRange, pragueDate, weekdayIndex } from "../lib/week";
import { DayCard } from "./DayCard";
import { PdfPanel } from "./PdfPanel";
import { WebPreview } from "./WebPreview";

const snapshot = (w: WeekMenu) => {
  const { updatedAt: _u, updatedBy: _b, ...rest } = cleanWeek(w);
  return JSON.stringify(rest);
};

function hasContent(d: DayEntry) {
  return Boolean(d.soup.name.trim() || d.meals.some((m) => m.name.trim()));
}

function defaultWeek(): string {
  const current = activeWeekStart();
  // O víkendu se typicky chystá menu na další týden
  return weekdayIndex(pragueDate()) >= 5 ? addDays(current, 7) : current;
}

export function WeekEditor() {
  const store = getMenuStore();
  const current = activeWeekStart();
  const today = pragueDate();

  const [weekStart, setWeekStart] = useState(defaultWeek);
  const [week, setWeek] = useState<WeekMenu>(() => emptyWeek(weekStart));
  const [saved, setSaved] = useState<string>(() => snapshot(emptyWeek(weekStart)));
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [summaries, setSummaries] = useState<WeekSummary[]>([]);
  const [previewTab, setPreviewTab] = useState<"pdf" | "web">("pdf");

  const dirty = snapshot(week) !== saved;
  const warnings = useMemo(() => weekWarnings(week), [week]);

  const refreshSummaries = useCallback(() => {
    store
      .listWeeks(addDays(current, -7), addDays(current, 21))
      .then(setSummaries)
      .catch(() => {});
  }, [store, current]);

  useEffect(refreshSummaries, [refreshSummaries]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    store
      .loadWeek(weekStart)
      .then((found) => {
        if (cancelled) return;
        const w = found ?? emptyWeek(weekStart);
        setWeek(w);
        setSaved(snapshot(w));
        setExists(Boolean(found));
      })
      .catch((e) => toast.error(`Týden se nepodařilo načíst: ${e.message}`))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [store, weekStart]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(
    async (published: boolean) => {
      setSaving(true);
      try {
        const result = await store.saveWeek({ ...week, published });
        setWeek(result);
        setSaved(snapshot(result));
        setExists(true);
        refreshSummaries();
        toast.success(
          published
            ? PUBLIC_SITE_CONNECTED
              ? "Uloženo a zveřejněno na webu."
              : "Uloženo a označeno ke zveřejnění."
            : "Uloženo jako koncept.",
        );
      } catch (e) {
        toast.error(`Uložení se nezdařilo: ${e instanceof Error ? e.message : e}`);
      } finally {
        setSaving(false);
      }
    },
    [store, week, refreshSummaries],
  );

  // Ctrl/Cmd + S uloží beze změny stavu zveřejnění
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) save(week.published);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, saving, week.published]);

  function goTo(next: string) {
    if (next === weekStart) return;
    if (dirty && !window.confirm("Máte neuložené změny. Opravdu přejít na jiný týden a změny zahodit?")) return;
    setWeekStart(next);
  }

  async function importMenicka() {
    setImporting(true);
    try {
      const found = await fetchMenickaDays();
      const matches = week.days.filter((d) => found.has(d.date));
      if (matches.length === 0) {
        toast.info("Na menicka.cz pro tento týden nic není.");
        return;
      }
      const overwriting = matches.filter(hasContent).length;
      if (overwriting && !window.confirm(`Přepsat ${overwriting} již vyplněné dny údaji z menicka.cz?`)) return;
      setWeek((w) => ({ ...w, days: w.days.map((d) => found.get(d.date) ?? d) }));
      toast.success(`Předvyplněno ${matches.length} ${matches.length === 1 ? "den" : matches.length < 5 ? "dny" : "dní"} z menicka.cz – zkontrolujte a uložte.`);
    } catch (e) {
      toast.error(`Import z menicka.cz selhal: ${e instanceof Error ? e.message : e}`);
    } finally {
      setImporting(false);
    }
  }

  const setDay = (i: number, next: DayEntry) =>
    setWeek((w) => ({ ...w, days: w.days.map((d, j) => (j === i ? next : d)) }));

  const summaryOf = (ws: string) => summaries.find((s) => s.weekStart === ws);
  const chips = [
    { ws: addDays(current, -7), label: "Minulý týden" },
    { ws: current, label: "Tento týden" },
    { ws: addDays(current, 7), label: "Příští týden" },
    { ws: addDays(current, 14), label: "Za 2 týdny" },
  ];

  let status: { text: string; tone: string };
  if (!exists && !dirty) status = { text: "Zatím nevyplněno", tone: "bg-stone-100 text-stone-600" };
  else if (week.published) {
    status =
      weekStart === current
        ? { text: "Zveřejněno · právě platí", tone: "bg-emerald-100 text-emerald-800" }
        : weekStart > current
          ? { text: `Zveřejněno · platí od po ${formatShort(weekStart)} 00:01`, tone: "bg-emerald-100 text-emerald-800" }
          : { text: "Zveřejněno · proběhlý týden", tone: "bg-stone-100 text-stone-600" };
  } else status = { text: "Koncept · na webu se nezobrazí", tone: "bg-amber-100 text-amber-900" };

  const canImport = weekStart === current || weekStart === addDays(current, 7);

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-32 pt-5 sm:px-6">
      {!PUBLIC_SITE_CONNECTED && store.mode === "supabase" && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-900">
          Testovací provoz: veřejný web zatím dál zobrazuje menu z menicka.cz. Zdejší menu se na web propíše až po
          přepnutí. PDF k tisku už můžete používat naostro.
        </div>
      )}

      {/* Výběr týdne */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goTo(addDays(weekStart, -7))}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-200"
            aria-label="Předchozí týden"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="min-w-[13ch] text-center text-2xl font-semibold sm:text-3xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            {formatWeekRange(weekStart)}
          </h1>
          <button
            type="button"
            onClick={() => goTo(addDays(weekStart, 7))}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-200"
            aria-label="Další týden"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>{status.text}</span>
        {loading && <Loader2 size={18} className="animate-spin text-stone-400" />}

        <div className="flex w-full flex-wrap gap-1.5 lg:ml-auto lg:w-auto">
          {chips.map((c) => {
            const s = summaryOf(c.ws);
            return (
              <button
                key={c.ws}
                type="button"
                onClick={() => goTo(c.ws)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                  c.ws === weekStart
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${s ? (s.published ? "bg-emerald-500" : "bg-amber-400") : "bg-stone-300"}`}
                  aria-hidden
                />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
        {/* Editor */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-3">
            <p className="mr-auto text-sm text-stone-600">
              Vyplňte polévku a jídla pro každý den. Prázdné řádky se neukládají.
            </p>
            {canImport && (
              <button
                type="button"
                onClick={importMenicka}
                disabled={importing || loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                title="Načte menu, které je teď zadané na menicka.cz"
              >
                {importing ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                Převzít z menicka.cz
              </button>
            )}
          </div>

          {week.days.map((d, i) => (
            <DayCard key={d.date} day={d} isToday={d.date === today} onChange={(next) => setDay(i, next)} />
          ))}

          <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
            <h3 className="mb-3 text-xl font-medium" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Společné údaje
            </h3>
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">Výdej menu</span>
                <input
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                  value={week.servingHours}
                  onChange={(e) => setWeek({ ...week, servingHours: e.target.value })}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
                  Poznámka pod menu (nepovinné)
                </span>
                <input
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                  value={week.footerNote}
                  placeholder="Např. Polévka je v ceně menu"
                  onChange={(e) => setWeek({ ...week, footerNote: e.target.value })}
                />
              </label>
            </div>
          </section>
        </div>

        {/* Náhledy */}
        <aside className="lg:sticky lg:top-[88px] lg:h-[calc(100vh-190px)]">
          <div className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-3">
            <div className="mb-3 flex gap-1 border-b border-stone-100 pb-3">
              {(
                [
                  { id: "pdf", label: "PDF k tisku", icon: FileText },
                  { id: "web", label: "Náhled na webu", icon: Globe },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPreviewTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                    previewTab === t.id ? "bg-orange-50 text-orange-800" : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {previewTab === "pdf" ? <PdfPanel week={week} /> : <WebPreview week={week} today={today} />}
            </div>
          </div>
        </aside>
      </div>

      {/* Spodní lišta s uložením */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="mr-auto min-w-0 text-sm">
            {dirty ? (
              <span className="font-medium text-amber-700">● Neuložené změny</span>
            ) : week.updatedAt ? (
              <span className="text-stone-500">
                Uloženo {new Date(week.updatedAt).toLocaleString("cs-CZ", { timeZone: "Europe/Prague", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}
                {week.updatedBy ? ` · ${week.updatedBy}` : ""}
              </span>
            ) : (
              <span className="text-stone-400">Zatím neuloženo</span>
            )}
            {warnings.length > 0 && (
              <details className="mt-0.5 text-amber-800">
                <summary className="cursor-pointer list-none">
                  <AlertTriangle size={14} className="mr-1 inline" />
                  {warnings.length} upozornění – zobrazit
                </summary>
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
          {week.published ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => save(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              <EyeOff size={16} /> Stáhnout z webu
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || !dirty}
              onClick={() => save(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              <Save size={16} /> Uložit koncept
            </button>
          )}
          <button
            type="button"
            disabled={saving || (week.published && !dirty)}
            onClick={() => save(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-800 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
            {week.published ? "Uložit změny" : "Uložit a zveřejnit"}
          </button>
        </div>
      </div>
    </div>
  );
}
