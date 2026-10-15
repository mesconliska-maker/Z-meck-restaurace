// Editor stálého jídelního lístku (stránka /menu) – /admin/jidelni-listek.
//
// Celý lístek je jeden záznam: načte se, upravuje se lokálně a "Uložit
// a zveřejnit" ho najednou zapíše – na webu se projeví hned.

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ExternalLink,
  Eye,
  Loader2,
  Plus,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { StandingMenuView } from "../../components/StandingMenuView";
import {
  DEFAULT_STANDING_MENU,
  cleanStandingMenu,
  newId,
  type StandingMenu,
  type StandingMenuCategory,
  type StandingMenuItem,
} from "../../lib/standingMenu";
import { getMenuStore } from "../lib/store";
import { useLeaveGuard } from "../lib/useLeaveGuard";
import { AutoGrowText } from "./DayCard";

const field =
  "rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20";

const snapshot = (m: StandingMenu) => {
  const { updatedAt: _u, updatedBy: _b, ...rest } = cleanStandingMenu(m);
  return JSON.stringify(rest);
};

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function emptyItem(): StandingMenuItem {
  return { id: newId(), name: "", nameDe: "", price: "", popular: false };
}

function warningsOf(menu: StandingMenu): string[] {
  const out: string[] = [];
  for (const c of menu.categories) {
    const label = c.name.trim() || "Kategorie bez názvu";
    if (!c.name.trim()) out.push(`${label}: chybí název kategorie.`);
    const filled = c.items.filter((i) => i.name.trim());
    if (filled.length === 0) out.push(`${label}: nemá žádné jídlo (na webu se nezobrazí jako prázdná).`);
    for (const i of filled) if (!i.price.trim()) out.push(`${label}: „${i.name.trim()}“ nemá cenu.`);
  }
  return out;
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-1.5 disabled:opacity-25 ${
        danger ? "text-stone-400 hover:bg-red-50 hover:text-red-700" : "text-stone-400 hover:bg-stone-100 hover:text-stone-800"
      }`}
    >
      {children}
    </button>
  );
}

function ItemRow({
  item,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  item: StandingMenuItem;
  index: number;
  count: number;
  onChange: (next: StandingMenuItem) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group flex gap-2 border-b border-stone-100 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <AutoGrowText
          className={`${field} w-full resize-none overflow-hidden px-3 py-2 text-[15px] leading-snug`}
          value={item.name}
          placeholder="Název jídla, např. 200 g Vepřové medailonky s hříbkovou omáčkou"
          aria-label="Název jídla"
          onChange={(name) => onChange({ ...item, name })}
        />
        <input
          className={`${field} mt-1.5 w-full px-3 py-1.5 text-sm italic text-stone-600`}
          value={item.nameDe}
          placeholder="Německy (nepovinné)"
          aria-label="Název německy"
          onChange={(e) => onChange({ ...item, nameDe: e.target.value })}
        />
      </div>
      <div className="flex w-24 flex-none flex-col gap-1.5 sm:w-32">
        <input
          className={`${field} w-full px-3 py-2 text-right text-[15px] font-medium text-orange-800`}
          value={item.price}
          inputMode="decimal"
          placeholder="Cena"
          aria-label="Cena"
          onChange={(e) => onChange({ ...item, price: e.target.value })}
        />
        <button
          type="button"
          onClick={() => onChange({ ...item, popular: !item.popular })}
          aria-pressed={item.popular}
          title="Štítek OBLÍBENÉ u jídla na webu"
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
            item.popular
              ? "border-orange-600 bg-orange-600 text-white"
              : "border-stone-200 text-stone-500 hover:border-orange-300 hover:text-orange-700"
          }`}
        >
          <Star size={12} className={item.popular ? "fill-current" : ""} /> Oblíbené
        </button>
      </div>
      <div className="flex flex-none flex-col items-center">
        <IconButton label="Posunout výš" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp size={15} />
        </IconButton>
        <IconButton label="Posunout níž" disabled={index === count - 1} onClick={() => onMove(1)}>
          <ArrowDown size={15} />
        </IconButton>
        <IconButton label="Odebrat jídlo" danger onClick={onRemove}>
          <Trash2 size={15} />
        </IconButton>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  category: StandingMenuCategory;
  index: number;
  count: number;
  onChange: (next: StandingMenuCategory) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const setItems = (items: StandingMenuItem[]) => onChange({ ...category, items });
  const filled = category.items.filter((i) => i.name.trim()).length;

  return (
    <section id={`edit-${category.id}`} className="scroll-mt-28 rounded-xl border border-stone-200 bg-white">
      <div className="flex items-center gap-1 border-b border-stone-100 p-2 sm:gap-2 sm:p-3 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Sbalit kategorii" : "Rozbalit kategorii"}
          className="rounded-md p-1 text-stone-500 hover:bg-stone-100"
        >
          <ChevronDown size={18} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
        <input
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xl font-semibold sm:text-2xl text-stone-900 placeholder:text-stone-300 hover:border-stone-200 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
          style={{ fontFamily: "Cormorant Garamond, serif" }}
          value={category.name}
          placeholder="Název kategorie, např. Polévky / Suppen"
          aria-label="Název kategorie"
          onChange={(e) => onChange({ ...category, name: e.target.value })}
        />
        <span className="hidden flex-none rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 sm:inline">
          {filled} {filled === 1 ? "jídlo" : filled >= 2 && filled <= 4 ? "jídla" : "jídel"}
        </span>
        <IconButton label="Posunout kategorii výš" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp size={16} />
        </IconButton>
        <IconButton label="Posunout kategorii níž" disabled={index === count - 1} onClick={() => onMove(1)}>
          <ArrowDown size={16} />
        </IconButton>
        <IconButton
          label="Smazat kategorii"
          danger
          onClick={() => {
            if (filled === 0 || window.confirm(`Smazat kategorii „${category.name || "bez názvu"}“ včetně ${filled} jídel?`)) onRemove();
          }}
        >
          <Trash2 size={16} />
        </IconButton>
      </div>

      {open && (
        <div className="px-3 pb-3 sm:px-4">
          {category.items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              index={i}
              count={category.items.length}
              onChange={(next) => setItems(category.items.map((x, j) => (j === i ? next : x)))}
              onMove={(delta) => setItems(move(category.items, i, delta))}
              onRemove={() => setItems(category.items.filter((_, j) => j !== i))}
            />
          ))}
          <button
            type="button"
            onClick={() => setItems([...category.items, emptyItem()])}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-50"
          >
            <Plus size={16} /> Přidat jídlo
          </button>
        </div>
      )}
    </section>
  );
}

export function StandingMenuEditor() {
  const store = getMenuStore();
  const [menu, setMenu] = useState<StandingMenu>(DEFAULT_STANDING_MENU);
  const [savedMenu, setSavedMenu] = useState<StandingMenu>(DEFAULT_STANDING_MENU);
  const saved = useMemo(() => snapshot(savedMenu), [savedMenu]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existsInDb, setExistsInDb] = useState(false);

  const dirty = snapshot(menu) !== saved;
  const warnings = useMemo(() => warningsOf(menu), [menu]);
  useLeaveGuard(dirty);

  useEffect(() => {
    let cancelled = false;
    store
      .loadStandingMenu()
      .then((found) => {
        if (cancelled) return;
        const m = found ?? DEFAULT_STANDING_MENU;
        setMenu(m);
        setSavedMenu(m);
        setExistsInDb(Boolean(found));
      })
      .catch((e) => toast.error(`Lístek se nepodařilo načíst: ${e.message}`))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [store]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const result = await store.saveStandingMenu(menu);
      setMenu(result);
      setSavedMenu(result);
      setExistsInDb(true);
      toast.success("Jídelní lístek je uložený a na webu.");
    } catch (e) {
      toast.error(`Uložení se nezdařilo: ${e instanceof Error ? e.message : e}`);
    } finally {
      setSaving(false);
    }
  }, [store, menu]);

  // Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving && dirty) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, saving, dirty]);

  const setCategories = (categories: StandingMenuCategory[]) => setMenu((m) => ({ ...m, categories }));
  const preview = useMemo(() => cleanStandingMenu(menu), [menu]);

  function discard() {
    if (!window.confirm("Zahodit všechny neuložené změny?")) return;
    setMenu(savedMenu);
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-32 pt-5 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
          Jídelní lístek
        </h1>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          Na webu · stránka Menu
        </span>
        {loading && <Loader2 size={18} className="animate-spin text-stone-400" />}
        <a
          href="/menu"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-sm text-stone-600 underline hover:text-stone-900 lg:ml-auto"
        >
          <ExternalLink size={14} /> Otevřít stránku Menu
        </a>
      </div>

      {/* Rychlý skok na kategorii */}
      <nav className="mb-5 flex flex-wrap gap-1.5" aria-label="Kategorie">
        {menu.categories.map((c) => (
          <a
            key={c.id}
            href={`#edit-${c.id}`}
            className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-700 hover:bg-stone-100"
          >
            {c.name.split("/")[0].trim() || "Bez názvu"}
          </a>
        ))}
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)]">
        <div className="space-y-4">
          <p className="rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-600">
            Upravte názvy, ceny a pořadí jídel. Cenu stačí napsat číslem (např. 175) – „Kč“ se doplní samo. Prázdné
            řádky se neukládají. Změny se na webu projeví po kliknutí na <strong>Uložit a zveřejnit</strong>.
          </p>

          {menu.categories.map((c, i) => (
            <CategoryCard
              key={c.id}
              category={c}
              index={i}
              count={menu.categories.length}
              onChange={(next) => setCategories(menu.categories.map((x, j) => (j === i ? next : x)))}
              onMove={(delta) => setCategories(move(menu.categories, i, delta))}
              onRemove={() => setCategories(menu.categories.filter((_, j) => j !== i))}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              const id = newId();
              setCategories([...menu.categories, { id, name: "", items: [emptyItem()] }]);
              window.setTimeout(() => document.getElementById(`edit-${id}`)?.scrollIntoView({ behavior: "smooth" }), 50);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 py-4 text-sm font-medium text-stone-600 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-800"
          >
            <Plus size={18} /> Přidat kategorii
          </button>

          <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
            <h3 className="mb-1 text-xl font-medium" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Poznámka pod lístkem
            </h3>
            <p className="mb-3 text-sm text-stone-500">Každý řádek zvlášť – poslední se zobrazí menším písmem.</p>
            <div className="space-y-2">
              {menu.notes.map((note, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={`${field} min-w-0 flex-1 px-3 py-2 text-[15px]`}
                    value={note}
                    aria-label={`Řádek poznámky ${i + 1}`}
                    onChange={(e) => setMenu((m) => ({ ...m, notes: m.notes.map((n, j) => (j === i ? e.target.value : n)) }))}
                  />
                  <IconButton label="Odebrat řádek" danger onClick={() => setMenu((m) => ({ ...m, notes: m.notes.filter((_, j) => j !== i) }))}>
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMenu((m) => ({ ...m, notes: [...m.notes, ""] }))}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-50"
            >
              <Plus size={16} /> Přidat řádek
            </button>
          </section>
        </div>

        {/* Náhled stránky /menu */}
        <aside className="hidden lg:sticky lg:top-[88px] lg:block lg:h-[calc(100vh-190px)]">
          <div className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-3">
            <p className="mb-3 flex items-center gap-1.5 border-b border-stone-100 px-1 pb-3 text-sm font-medium text-stone-700">
              <Eye size={16} /> Náhled na webu
            </p>
            <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-gray-50">
              <div className="p-6" style={{ zoom: 0.62 }}>
                <StandingMenuView menu={preview} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Spodní lišta s uložením */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="mr-auto min-w-0 text-sm">
            {dirty ? (
              <span className="font-medium text-amber-700">● Neuložené změny – web zatím ukazuje původní lístek</span>
            ) : existsInDb && menu.updatedAt ? (
              <span className="text-stone-500">
                Uloženo{" "}
                {new Date(menu.updatedAt).toLocaleString("cs-CZ", {
                  timeZone: "Europe/Prague",
                  day: "numeric",
                  month: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {menu.updatedBy ? ` · ${menu.updatedBy}` : ""}
              </span>
            ) : (
              <span className="text-stone-400">Bez změn</span>
            )}
            {warnings.length > 0 && (
              <details className="mt-0.5 text-amber-800">
                <summary className="cursor-pointer list-none">
                  <AlertTriangle size={14} className="mr-1 inline" />
                  {warnings.length} upozornění – zobrazit
                </summary>
                <ul className="mt-1 max-h-40 list-disc overflow-auto pl-5 text-xs">
                  {warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={discard}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            <RotateCcw size={16} /> Zahodit změny
          </button>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-800 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
            Uložit a zveřejnit
          </button>
        </div>
      </div>
    </div>
  );
}
