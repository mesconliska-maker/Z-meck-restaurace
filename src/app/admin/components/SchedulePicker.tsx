import { cs } from "date-fns/locale";
import { CalendarClock, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

// Výběr data a času naplánovaného příspěvku. Vlastní vzhled místo
// <input type="datetime-local">, jehož podoba se liší podle prohlížeče.
// Facebook bere naplánování nejdřív za 10 minut a nejpozději za ~30 dní.

const MIN_LEAD_MS = 10 * 60 * 1000;
const MAX_DAYS = 29;
const TIMES = Array.from({ length: 32 }, (_, i) => {
  const minutes = 6 * 60 + i * 30; // 6:00 – 21:30
  return { h: Math.floor(minutes / 60), m: minutes % 60 };
});

const pad = (n: number) => String(n).padStart(2, "0");

function at(day: Date, h: number, m: number): Date {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

function startOfDay(d: Date): Date {
  return at(d, 0, 0);
}

export function isSchedulable(when: Date): boolean {
  const delta = when.getTime() - Date.now();
  return delta >= MIN_LEAD_MS && delta <= MAX_DAYS * 24 * 60 * 60 * 1000;
}

export function formatSchedule(when: Date): string {
  return when.toLocaleString("cs-CZ", { weekday: "long", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Rychlé volby: neděle večer před týdnem, pondělí ráno, zítra ráno. */
function presets(weekStart: string): { label: string; when: Date }[] {
  const monday = new Date(`${weekStart}T00:00`);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() - 1);
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const list = [
    { label: "Ne 18:00", when: at(sunday, 18, 0) },
    { label: "Po 7:00", when: at(monday, 7, 0) },
    { label: "Zítra 7:00", when: at(tomorrow, 7, 0) },
  ];
  const seen = new Set<number>();
  return list.filter((p) => isSchedulable(p.when) && !seen.has(p.when.getTime()) && seen.add(p.when.getTime()));
}

export function SchedulePicker({
  value,
  onChange,
  weekStart,
}: {
  value: Date;
  onChange: (next: Date) => void;
  weekStart: string;
}) {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + MAX_DAYS);
  const valid = isSchedulable(value);
  const quick = presets(weekStart);

  function pickDay(day: Date | undefined) {
    if (!day) return;
    let next = at(day, value.getHours(), value.getMinutes());
    // Dnešek s časem, který už minul → první volný půlhodinový čas
    if (!isSchedulable(next)) {
      const first = TIMES.map((t) => at(day, t.h, t.m)).find(isSchedulable);
      if (first) next = first;
    }
    onChange(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`mb-3 flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-left hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-600/20 ${
            valid ? "border-stone-300" : "border-red-400"
          }`}
        >
          <CalendarClock size={18} className="shrink-0 text-orange-700" />
          <span className="flex-1 first-letter:uppercase">{formatSchedule(value)}</span>
          <ChevronDown size={16} className="text-stone-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl border-stone-200 bg-white p-0 shadow-lg">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            locale={cs}
            weekStartsOn={1}
            selected={value}
            onSelect={pickDay}
            defaultMonth={value}
            fromDate={today}
            toDate={lastDay}
            className="p-3"
            classNames={{
              caption_label: "text-sm font-semibold capitalize text-stone-900",
              head_cell: "w-9 text-[0.75rem] font-medium uppercase text-stone-400",
              day: "size-9 rounded-lg text-sm text-stone-800 hover:bg-orange-50 aria-selected:opacity-100",
              day_selected: "!bg-orange-700 !text-white hover:!bg-orange-800",
              day_today: "font-semibold text-orange-800 ring-1 ring-inset ring-orange-200",
              day_disabled: "!text-stone-300 hover:!bg-transparent cursor-default",
              day_outside: "!text-stone-300",
              cell: "p-0.5 text-center",
            }}
          />
          <div className="border-t border-stone-100 p-3 sm:w-[188px] sm:border-l sm:border-t-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">Čas</p>
            <div className="grid max-h-[236px] grid-cols-3 gap-1 overflow-y-auto pr-1">
              {TIMES.map((t) => {
                const when = at(value, t.h, t.m);
                const selected = value.getHours() === t.h && value.getMinutes() === t.m;
                const disabled = !isSchedulable(when);
                return (
                  <button
                    key={`${t.h}:${t.m}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(when)}
                    className={`rounded-md py-1.5 text-sm tabular-nums ${
                      selected
                        ? "bg-orange-700 font-medium text-white"
                        : disabled
                          ? "text-stone-300"
                          : "text-stone-700 hover:bg-orange-50"
                    }`}
                  >
                    {t.h}:{pad(t.m)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 px-3 py-2.5">
          {quick.length > 0 && <span className="mr-1 text-xs text-stone-400">Rychle:</span>}
          {quick.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onChange(p.when);
                  setOpen(false);
                }}
                className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-700 hover:border-orange-300 hover:bg-orange-50"
              >
                {p.label}
              </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-auto rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white hover:bg-stone-800"
          >
            Hotovo
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Výchozí čas: pondělí daného týdne 7:00, a když už minul, nejbližší volný půlhodinový čas. */
export function defaultScheduleDate(weekStart: string): Date {
  const monday = at(new Date(`${weekStart}T00:00`), 7, 0);
  if (isSchedulable(monday)) return monday;
  const soon = new Date(Date.now() + MIN_LEAD_MS + 60 * 1000);
  soon.setMinutes(Math.ceil(soon.getMinutes() / 30) * 30, 0, 0);
  return soon;
}
