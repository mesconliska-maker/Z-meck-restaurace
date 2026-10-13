// Stav propojení s Facebookem a sdílení menu daného týdne.
//
// Stav se nikam neukládá – bere se přímo z Facebooku (zveřejněné i naplánované
// příspěvky stránky), takže pozná i příspěvek přidaný ručně v Meta Business
// Suite, pokud obsahuje slovo "menu" a datum týdne.

import { useCallback, useEffect, useState } from "react";
import { getMenuStore } from "../lib/store";
import { addDays, formatWeekRangeLong } from "../lib/week";

export const FACEBOOK_FUNCTION = "facebook-share";

export interface FacebookPost {
  id: string;
  message: string;
  createdAt: string | null;
  /** unix sekundy, jen u naplánovaných příspěvků */
  scheduledAt: number | null;
  url: string;
}

export type FacebookConnection =
  | { state: "checking" }
  | { state: "ok"; pageName: string; pageLink: string }
  | { state: "error"; message: string };

export type WeekShareState =
  | { kind: "unknown" }
  | { kind: "none" }
  | { kind: "published"; post: FacebookPost }
  | { kind: "scheduled"; post: FacebookPost };

const normalize = (text: string) => text.replace(/\s+/g, " ").toLowerCase();

function datePattern(iso: string): RegExp {
  const [, m, d] = iso.split("-").map(Number);
  return new RegExp(`(^|\\D)${d}\\.\\s?${m}\\.`);
}

/** Je příspěvek menu pro týden začínající `weekStart`? */
export function isWeekMenuPost(message: string, weekStart: string): boolean {
  const text = normalize(message);
  if (!text.includes("menu")) return false;
  if (text.includes(normalize(formatWeekRangeLong(weekStart)))) return true;
  return datePattern(weekStart).test(text) || datePattern(addDays(weekStart, 4)).test(text);
}

export function weekShareState(posts: FacebookPost[] | null, weekStart: string): WeekShareState {
  if (!posts) return { kind: "unknown" };
  const matching = posts.filter((p) => isWeekMenuPost(p.message, weekStart));
  const published = matching.filter((p) => !p.scheduledAt).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  if (published.length) return { kind: "published", post: published[0] };
  const scheduled = matching.filter((p) => p.scheduledAt).sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0));
  if (scheduled.length) return { kind: "scheduled", post: scheduled[0] };
  return { kind: "none" };
}

export function formatPostTime(post: FacebookPost): string {
  const date = post.scheduledAt ? new Date(post.scheduledAt * 1000) : new Date(post.createdAt ?? "");
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("cs-CZ", {
    timeZone: "Europe/Prague",
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Propojení + příspěvky stránky od týdne před `weekStart`; `refresh` po sdílení. */
export function useFacebookStatus(weekStart: string) {
  const store = getMenuStore();
  const [connection, setConnection] = useState<FacebookConnection>({ state: "checking" });
  const [posts, setPosts] = useState<FacebookPost[] | null>(null);

  const refresh = useCallback(async () => {
    if (store.mode !== "supabase") {
      setConnection({ state: "error", message: "V demo režimu není sdílení dostupné." });
      setPosts(null);
      return;
    }
    setConnection((c) => (c.state === "ok" ? c : { state: "checking" }));
    try {
      const since = Math.floor(new Date(`${addDays(weekStart, -7)}T00:00:00`).getTime() / 1000);
      const r = await store.invoke<{ pageName: string; pageLink: string; posts?: FacebookPost[] }>(
        FACEBOOK_FUNCTION,
        { action: "status", since },
      );
      setConnection({ state: "ok", pageName: r.pageName, pageLink: r.pageLink });
      setPosts(r.posts ?? null);
    } catch (e) {
      setConnection({ state: "error", message: e instanceof Error ? e.message : String(e) });
      setPosts(null);
    }
  }, [store, weekStart]);

  useEffect(() => {
    setPosts(null);
    refresh();
  }, [refresh]);

  return { connection, share: weekShareState(posts, weekStart), refresh };
}
