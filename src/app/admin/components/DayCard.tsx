import { Minus, Plus, Soup } from "lucide-react";
import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";
import { emptyItem, NOTE_SUGGESTIONS } from "../lib/menu";
import type { DayEntry, MenuItem } from "../lib/types";
import { czechHoliday, dayName, formatShort } from "../lib/week";

const field =
  "rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20";
const inputBase = `${field} w-full px-3 py-2 text-[15px]`;
const smallInput = `${field} px-2.5 py-1.5 text-sm`;

/** Víceřádkové pole, které roste s textem – dlouhé názvy jídel jsou vidět celé i na mobilu. */
function AutoGrowText({
  value,
  onChange,
  ...rest
}: { value: string; onChange: (v: string) => void } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      // Název je jeden řádek textu – Enter ani vložené zalomení nechceme
      onChange={(e) => onChange(e.target.value.replace(/\s*\n\s*/g, " "))}
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      {...rest}
    />
  );
}

function ItemFields({
  item,
  onChange,
  placeholder,
  label,
}: {
  item: MenuItem;
  onChange: (next: MenuItem) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <AutoGrowText
        className={`${inputBase} resize-none overflow-hidden leading-snug`}
        value={item.name}
        placeholder={placeholder}
        aria-label={label}
        onChange={(name) => onChange({ ...item, name })}
      />
      <div className="mt-1.5 flex gap-2">
        <input
          className={`${smallInput} w-28 flex-none`}
          value={item.price}
          inputMode="decimal"
          placeholder="Cena (Kč)"
          aria-label={`${label} – cena`}
          onChange={(e) => onChange({ ...item, price: e.target.value })}
        />
        <input
          className={`${smallInput} min-w-0 flex-1`}
          value={item.allergens}
          placeholder="Alergeny, např. 1, 3, 7"
          aria-label={`${label} – alergeny`}
          onChange={(e) => onChange({ ...item, allergens: e.target.value })}
        />
      </div>
    </div>
  );
}

export function DayCard({
  day,
  isToday,
  onChange,
}: {
  day: DayEntry;
  isToday: boolean;
  onChange: (next: DayEntry) => void;
}) {
  const holiday = czechHoliday(day.date);
  const listId = `notes-${day.date}`;

  const setMeal = (i: number, next: MenuItem) =>
    onChange({ ...day, meals: day.meals.map((m, j) => (j === i ? next : m)) });

  return (
    <section
      className={`rounded-xl border bg-white p-4 sm:p-5 shadow-sm ${
        isToday ? "border-orange-600 ring-2 ring-orange-100" : "border-stone-200"
      }`}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <h3 className="text-2xl font-medium text-stone-900" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            {dayName(day.date)} <span className="text-lg text-stone-500">{formatShort(day.date)}</span>
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {isToday && (
              <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[11px] font-medium text-white">DNES</span>
            )}
            {holiday && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                Státní svátek: {holiday}
              </span>
            )}
          </div>
        </div>
        <label className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
          <input
            type="checkbox"
            className="size-4 accent-orange-600"
            checked={day.closed}
            onChange={(e) =>
              onChange({
                ...day,
                closed: e.target.checked,
                note: e.target.checked && !day.note && holiday ? `${holiday} – zavřeno` : day.note,
              })
            }
          />
          Bez poledního menu
        </label>
      </header>

      {!day.closed && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-2 flex size-7 flex-none items-center justify-center text-orange-700" title="Polévka">
              <Soup size={20} />
            </div>
            <ItemFields
              item={day.soup}
              label={`${dayName(day.date)} – polévka`}
              placeholder="Polévka"
              onChange={(soup) => onChange({ ...day, soup })}
            />
          </div>

          {day.meals.map((meal, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 flex size-7 flex-none items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-orange-700 text-sm font-medium text-white">
                {i + 1}
              </div>
              <ItemFields
                item={meal}
                label={`${dayName(day.date)} – jídlo ${i + 1}`}
                placeholder={`Hlavní jídlo ${i + 1}`}
                onChange={(next) => setMeal(i, next)}
              />
              <button
                type="button"
                className="mt-1.5 flex size-8 flex-none items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600"
                title="Odebrat jídlo"
                aria-label={`Odebrat jídlo ${i + 1}`}
                onClick={() => onChange({ ...day, meals: day.meals.filter((_, j) => j !== i) })}
              >
                <Minus size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="ml-10 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-orange-700 hover:bg-orange-50"
            onClick={() => onChange({ ...day, meals: [...day.meals, emptyItem()] })}
          >
            <Plus size={16} /> Přidat jídlo
          </button>
        </div>
      )}

      <div className={day.closed ? "" : "mt-4 border-t border-stone-100 pt-4"}>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500" htmlFor={`note-${day.date}`}>
          {day.closed ? "Co zobrazit místo menu" : "Poznámka ke dni (nepovinné)"}
        </label>
        <input
          id={`note-${day.date}`}
          className={inputBase}
          list={listId}
          value={day.note}
          placeholder={day.closed ? "Např. Státní svátek – zavřeno" : "Např. Svátek, otevřeno"}
          onChange={(e) => onChange({ ...day, note: e.target.value })}
        />
        <datalist id={listId}>
          {NOTE_SUGGESTIONS.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>
    </section>
  );
}
