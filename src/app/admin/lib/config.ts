// Napojení administrace na databázi (Supabase).
//
// URL projektu a "publishable/anon" klíč jsou veřejné údaje – jsou v každém
// prohlížeči, který web otevře, a data chrání pravidla RLS v databázi
// (supabase/schema.sql). Proto je lze mít přímo tady v repu a web na Vercelu
// nepotřebuje žádné nové proměnné prostředí. Proměnné VITE_* mají přednost
// (lokální vývoj, případné testovací prostředí).
//
// Dokud jsou hodnoty prázdné, administrace běží v DEMO režimu: data se ukládají
// jen do localStorage tohoto prohlížeče.

const FALLBACK_SUPABASE_URL = "";
const FALLBACK_SUPABASE_ANON_KEY = "";

export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;

export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Čte už veřejná sekce „Menu tohoto týdne“ z této databáze?
 * Dokud je false, administrace upozorňuje, že web pořád ukazuje menicka.cz.
 * Přepnout na true spolu s napojením WeeklyMenu.tsx (viz lib/weeklyMenuSource.ts).
 */
export const PUBLIC_SITE_CONNECTED = false;
