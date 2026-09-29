// Úložiště týdenních menu. Dvě implementace se stejným rozhraním:
//  - SupabaseStore: ostrý provoz (Postgres + přihlášení e-mailem a heslem)
//  - DemoStore: localStorage v prohlížeči, dokud databáze není napojená

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import { cleanWeek, normalizeWeek } from "./menu";
import type { WeekMenu, WeekSummary } from "./types";

export interface AdminUser {
  email: string;
}

export interface MenuStore {
  mode: "supabase" | "demo";
  getUser(): Promise<AdminUser | null>;
  onAuthChange(cb: (user: AdminUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  /** Ověří, že přihlášený účet smí menu upravovat (je v tabulce menu_editors). */
  isEditor(): Promise<boolean>;
  loadWeek(weekStart: string): Promise<WeekMenu | null>;
  saveWeek(week: WeekMenu): Promise<WeekMenu>;
  listWeeks(from: string, to: string): Promise<WeekSummary[]>;
}

// --- Supabase ---------------------------------------------------------------

interface WeekRow {
  week_start: string;
  days: WeekMenu["days"];
  serving_hours: string;
  footer_note: string;
  published: boolean;
  updated_at: string;
  updated_by: string | null;
}

function rowToWeek(row: WeekRow): WeekMenu {
  return normalizeWeek({
    weekStart: row.week_start,
    days: row.days,
    servingHours: row.serving_hours,
    footerNote: row.footer_note,
    published: row.published,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by ?? undefined,
  });
}

function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Nesprávný e-mail nebo heslo.";
  if (/email not confirmed/i.test(message)) return "E-mail účtu ještě není potvrzený.";
  if (/rate limit|too many/i.test(message)) return "Příliš mnoho pokusů, zkuste to za chvíli.";
  return message;
}

class SupabaseStore implements MenuStore {
  mode = "supabase" as const;
  private sb: SupabaseClient;

  constructor() {
    this.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "zamecka-menu-admin" },
    });
  }

  async getUser() {
    const { data } = await this.sb.auth.getSession();
    const email = data.session?.user.email;
    return email ? { email } : null;
  }

  onAuthChange(cb: (user: AdminUser | null) => void) {
    const { data } = this.sb.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email;
      cb(email ? { email } : null);
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn(email: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(translateAuthError(error.message));
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async isEditor() {
    const { data, error } = await this.sb.rpc("is_menu_editor");
    if (error) throw new Error(error.message);
    return data === true;
  }

  async loadWeek(weekStart: string) {
    const { data, error } = await this.sb
      .from("weekly_menus")
      .select("*")
      .eq("week_start", weekStart)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToWeek(data as WeekRow) : null;
  }

  async saveWeek(week: WeekMenu) {
    const clean = cleanWeek(week);
    const user = await this.getUser();
    const { data, error } = await this.sb
      .from("weekly_menus")
      .upsert({
        week_start: clean.weekStart,
        days: clean.days,
        serving_hours: clean.servingHours,
        footer_note: clean.footerNote,
        published: clean.published,
        updated_by: user?.email ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return rowToWeek(data as WeekRow);
  }

  async listWeeks(from: string, to: string) {
    const { data, error } = await this.sb
      .from("weekly_menus")
      .select("week_start, published, updated_at")
      .gte("week_start", from)
      .lte("week_start", to);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      weekStart: r.week_start as string,
      published: r.published as boolean,
      updatedAt: r.updated_at as string,
    }));
  }
}

// --- Demo (localStorage) ----------------------------------------------------

const DEMO_KEY = "zamecka-menu-demo-v1";
const DEMO_USER: AdminUser = { email: "demo@zamecka-htyn.cz" };

class DemoStore implements MenuStore {
  mode = "demo" as const;

  private readAll(): Record<string, WeekMenu> {
    try {
      return JSON.parse(localStorage.getItem(DEMO_KEY) || "{}");
    } catch {
      return {};
    }
  }

  private writeAll(all: Record<string, WeekMenu>) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(all));
  }

  async getUser() {
    return DEMO_USER;
  }
  onAuthChange() {
    return () => {};
  }
  async signIn() {}
  async signOut() {}
  async isEditor() {
    return true;
  }

  async loadWeek(weekStart: string) {
    const found = this.readAll()[weekStart];
    return found ? normalizeWeek(found) : null;
  }

  async saveWeek(week: WeekMenu) {
    const saved: WeekMenu = {
      ...cleanWeek(week),
      updatedAt: new Date().toISOString(),
      updatedBy: DEMO_USER.email,
    };
    const all = this.readAll();
    all[week.weekStart] = saved;
    this.writeAll(all);
    return normalizeWeek(saved);
  }

  async listWeeks(from: string, to: string) {
    return Object.values(this.readAll())
      .filter((w) => w.weekStart >= from && w.weekStart <= to)
      .map((w) => ({ weekStart: w.weekStart, published: w.published, updatedAt: w.updatedAt }));
  }
}

let instance: MenuStore | null = null;

export function getMenuStore(): MenuStore {
  if (!instance) instance = isSupabaseConfigured ? new SupabaseStore() : new DemoStore();
  return instance;
}
