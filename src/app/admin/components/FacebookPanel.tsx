import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Copy, Download, ExternalLink, Loader2, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buildCaption } from "../facebook/caption";
import { imageFileName } from "../facebook/fileName";
import { FACEBOOK_FUNCTION, formatPostTime, type FacebookConnection, type WeekShareState } from "../facebook/status";
import { cleanWeek, weekWarnings } from "../lib/menu";
import { getMenuStore } from "../lib/store";
import type { WeekMenu } from "../lib/types";
import { formatWeekRange } from "../lib/week";
import { SchedulePicker, defaultScheduleDate, formatSchedule, isSchedulable } from "./SchedulePicker";
import { errorText } from "../../lib/staleChunk";

interface PublishResult {
  url: string;
  scheduledAt: number | null;
}

/** Výrazné upozornění, jestli menu tohoto týdne už na Facebooku je. */
export function ShareBanner({ share, weekStart }: { share: WeekShareState; weekStart: string }) {
  const range = formatWeekRange(weekStart);
  if (share.kind === "unknown") return null;
  if (share.kind === "none") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 text-sm text-amber-950">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Menu na {range} zatím na Facebooku není</p>
          <p className="text-amber-900/80">Nebylo zveřejněné ani naplánované.</p>
        </div>
      </div>
    );
  }
  const scheduled = share.kind === "scheduled";
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${
        scheduled ? "border-sky-300 bg-sky-50 text-sky-950" : "border-emerald-300 bg-emerald-50 text-emerald-950"
      }`}
    >
      {scheduled ? (
        <Clock size={18} className="mt-0.5 shrink-0 text-sky-600" />
      ) : (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
      )}
      <div className="min-w-0">
        <p className="font-semibold">
          {scheduled ? `Menu na ${range} je naplánované` : `Menu na ${range} už je na Facebooku`}
        </p>
        <p className="opacity-80">
          {scheduled ? "Vyjde " : "Zveřejněno "}
          {formatPostTime(share.post)} ·{" "}
          <a href={share.post.url} target="_blank" rel="noopener" className="underline">
            {scheduled ? "spravovat v Business Suite" : "otevřít příspěvek"}
          </a>
        </p>
      </div>
    </div>
  );
}

/** Obrázek + text menu pro Facebook a sdílení na stránku restaurace. */
export function FacebookPanel({
  week,
  dirty,
  connection,
  share,
  onShared,
}: {
  week: WeekMenu;
  dirty: boolean;
  connection: FacebookConnection;
  share: WeekShareState;
  /** Po sdílení – načte znovu stav z Facebooku. */
  onShared: () => void;
}) {
  const store = getMenuStore();
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [rendering, setRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [caption, setCaption] = useState(() => buildCaption(cleanWeek(week)));
  const [captionEdited, setCaptionEdited] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(() => defaultScheduleDate(week.weekStart));
  const [publishing, setPublishing] = useState(false);
  const [lastResult, setLastResult] = useState<PublishResult | null>(null);
  const urlRef = useRef<string | null>(null);

  const warnings = weekWarnings(week);

  // Obrázek se překresluje s krátkým zpožděním po úpravách (stejně jako PDF)
  useEffect(() => {
    let cancelled = false;
    setRendering(true);
    const timer = window.setTimeout(async () => {
      try {
        // pdf.js je velký – načte se až s otevřením této záložky
        const { renderMenuImage } = await import("../facebook/renderImage");
        const blob = await renderMenuImage(cleanWeek(week));
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setImage({ blob, url });
        setRenderError(null);
      } catch (e) {
        if (!cancelled) setRenderError(errorText(e));
      } finally {
        if (!cancelled) setRendering(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [week]);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  // Dokud text nikdo neupravil ručně, drží se aktuálního menu
  useEffect(() => {
    if (!captionEdited) setCaption(buildCaption(cleanWeek(week)));
  }, [week, captionEdited]);

  useEffect(() => {
    setScheduleValue(defaultScheduleDate(week.weekStart));
    setLastResult(null);
  }, [week.weekStart]);

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Text příspěvku je zkopírovaný.");
    } catch {
      toast.error("Kopírování se nepovedlo – text označte a zkopírujte ručně.");
    }
  }

  async function publish() {
    if (!image || connection.state !== "ok") return;
    let scheduledAt: number | null = null;
    if (schedule) {
      if (!isSchedulable(scheduleValue)) {
        toast.error("Naplánovat jde nejdřív za 10 minut a nejpozději za 29 dní.");
        return;
      }
      scheduledAt = Math.floor(scheduleValue.getTime() / 1000);
    }
    const whenText = scheduledAt ? `naplánovat na ${formatSchedule(scheduleValue)}` : "zveřejnit hned";
    const already =
      share.kind === "published"
        ? `POZOR: menu na tento týden už na Facebooku je (${formatPostTime(share.post)}).\n\n`
        : share.kind === "scheduled"
          ? `POZOR: menu na tento týden už je naplánované (${formatPostTime(share.post)}).\n\n`
          : "";
    if (!window.confirm(`${already}Opravdu ${whenText} příspěvek s menu na stránce „${connection.pageName}“?`)) return;

    setPublishing(true);
    try {
      const form = new FormData();
      form.append("action", "publish");
      form.append("image", new File([image.blob], "poledni-menu.jpg", { type: "image/jpeg" }));
      form.append("message", caption);
      if (scheduledAt) form.append("scheduledAt", String(scheduledAt));
      const r = await store.invoke<PublishResult>(FACEBOOK_FUNCTION, form);
      setLastResult(r);
      onShared();
      toast.success(r.scheduledAt ? "Příspěvek je naplánovaný." : "Příspěvek je na Facebooku.");
    } catch (e) {
      toast.error(`Sdílení se nepovedlo: ${e instanceof Error ? e.message : e}`);
    } finally {
      setPublishing(false);
    }
  }

  const canPublish = Boolean(image) && !rendering && connection.state === "ok" && !publishing && caption.trim().length > 0;

  return (
    <div className="space-y-4 pb-2">
      <ShareBanner share={share} weekStart={week.weekStart} />

      {/* Obrázek */}
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
        {image && <img src={image.url} alt="Obrázek menu pro Facebook" className="h-full w-full object-contain" />}
        {rendering && (
          <div className="absolute right-2 top-2 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-stone-600 shadow">
            <Loader2 size={14} className="animate-spin" /> Připravuji obrázek…
          </div>
        )}
        {renderError && (
          <div className="absolute inset-x-2 bottom-2 rounded-lg bg-red-50 p-2 text-xs text-red-800">
            Obrázek se nepodařilo vytvořit: {renderError}
          </div>
        )}
      </div>

      {/* Text příspěvku */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <label htmlFor="fb-caption" className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Text příspěvku
          </label>
          {captionEdited && (
            <button
              type="button"
              onClick={() => setCaptionEdited(false)}
              className="ml-auto inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
              title="Zahodí ruční úpravy a vytvoří text znovu z menu"
            >
              <RefreshCw size={12} /> Podle menu
            </button>
          )}
        </div>
        <textarea
          id="fb-caption"
          rows={9}
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
            setCaptionEdited(true);
          }}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm leading-snug focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={image?.url}
          download={imageFileName(week)}
          aria-disabled={!image}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 ${
            image ? "" : "pointer-events-none opacity-50"
          }`}
        >
          <Download size={16} /> Stáhnout obrázek
        </a>
        <button
          type="button"
          onClick={copyCaption}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          <Copy size={16} /> Kopírovat text
        </button>
      </div>

      {/* Sdílení */}
      <section className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm">
        <div className="mb-3 flex items-start gap-2">
          {connection.state === "checking" && (
            <>
              <Loader2 size={16} className="mt-0.5 animate-spin text-stone-500" />
              <span className="text-stone-600">Ověřuji propojení s Facebookem…</span>
            </>
          )}
          {connection.state === "ok" && (
            <>
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <span className="text-stone-700">
                Propojeno se stránkou{" "}
                <a href={connection.pageLink} target="_blank" rel="noopener" className="font-medium underline">
                  {connection.pageName}
                </a>
              </span>
            </>
          )}
          {connection.state === "error" && (
            <>
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <span className="text-amber-900">{connection.message}</span>
            </>
          )}
          {connection.state !== "checking" && (
            <button
              type="button"
              onClick={onShared}
              className="ml-auto shrink-0 text-xs text-stone-500 underline hover:text-stone-800"
            >
              Ověřit znovu
            </button>
          )}
        </div>

        {(dirty || warnings.length > 0) && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {dirty && "Menu má neuložené změny – na Facebook se pošle to, co vidíte tady, ale web ukazuje uložené menu. "}
            {warnings.length > 0 && `Menu není úplné (${warnings.length} upozornění).`}
          </p>
        )}

        <label className="mb-2 flex items-center gap-2 text-stone-700">
          <input type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} className="size-4 accent-orange-700" />
          Naplánovat na později
        </label>
        {schedule && <SchedulePicker value={scheduleValue} onChange={setScheduleValue} weekStart={week.weekStart} />}

        <button
          type="button"
          disabled={!canPublish}
          onClick={publish}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1877f2] px-4 py-2.5 font-medium text-white hover:bg-[#166fe5] disabled:opacity-50"
        >
          {publishing ? <Loader2 size={16} className="animate-spin" /> : schedule ? <CalendarClock size={16} /> : <Send size={16} />}
          {schedule ? "Naplánovat na Facebook" : "Sdílet na Facebook"}
        </button>

        {lastResult && (
          <a
            href={lastResult.url}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-1.5 text-emerald-800 underline"
          >
            <ExternalLink size={14} />
            {lastResult.scheduledAt ? "Naplánováno – zobrazit stránku" : "Zveřejněno – otevřít příspěvek"}
          </a>
        )}
      </section>
    </div>
  );
}
