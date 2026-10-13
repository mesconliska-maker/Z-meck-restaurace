// Supabase Edge Function: sdílení týdenního menu na Facebook stránku restaurace.
//
// Volá ji administrace (/admin) jako přihlášený editor. Token stránky leží jen
// tady v tajných proměnných (FB_PAGE_ID, FB_PAGE_TOKEN) – do prohlížeče se
// nikdy nedostane. Kdo smí sdílet, rozhoduje stejná funkce is_menu_editor()
// jako u ukládání menu.
//
// Akce:
//   POST JSON {action: "status", since?}    → ověří token, vrátí název stránky a příspěvky
//        od `since` (unix sekundy) – zveřejněné i naplánované; administrace z nich
//        pozná, jestli už menu daného týdne na Facebooku je
//   POST multipart action=publish            → nahraje obrázek s textem jako příspěvek
//        image (JPEG), message, scheduledAt? (unix sekundy – naplánovaný příspěvek)
//
// Nasazení: supabase functions deploy facebook-share --project-ref rrzhyynllgbtyorvrnbg --no-verify-jwt
// (JWT ověřujeme sami přes is_menu_editor(), viz docs/menu-admin.md)

import { createClient } from "npm:@supabase/supabase-js@2";

const GRAPH = "https://graph.facebook.com/v26.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MIN_SCHEDULE_S = 10 * 60; // Facebook vyžaduje aspoň 10 minut dopředu
const MAX_SCHEDULE_S = 29 * 24 * 60 * 60;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

class GraphError extends Error {
  constructor(message: string, readonly code?: number) {
    super(message);
  }
}

/** Srozumitelná čeština pro nejčastější chyby Graph API. */
function explain(e: GraphError): string {
  if (e.code === 190) {
    return "Propojení s Facebookem přestalo platit (změna hesla nebo odebraný přístup ke stránce). Správce webu musí vygenerovat nový token.";
  }
  // 10 a 200–299 = chybějící oprávnění
  if (e.code === 10 || (e.code !== undefined && e.code >= 200 && e.code < 300)) {
    return "Facebook odmítl oprávnění k publikování na stránku. Správce webu musí token vygenerovat znovu s oprávněním pages_manage_posts.";
  }
  if (e.code === 4 || e.code === 17 || e.code === 32 || e.code === 613) {
    return "Facebook dočasně omezil počet požadavků. Zkuste to prosím za pár minut.";
  }
  return `Facebook vrátil chybu: ${e.message}`;
}

async function graph(path: string, init?: RequestInit) {
  const res = await fetch(`${GRAPH}/${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    throw new GraphError(data?.error?.message ?? `HTTP ${res.status}`, data?.error?.code);
  }
  return data;
}

interface PostInfo {
  id: string;
  message: string;
  createdAt: string | null;
  scheduledAt: number | null;
  url: string;
}

/** Zveřejněné příspěvky od `since` + všechny naplánované. Chyba u naplánovaných nevadí. */
async function recentPosts(pageId: string, auth: string, since: number): Promise<PostInfo[]> {
  const published = await graph(
    `${pageId}/published_posts?fields=id,message,created_time,permalink_url&since=${since}&limit=50&${auth}`,
  );
  const posts: PostInfo[] = (published.data ?? []).map((p: Record<string, string>) => ({
    id: p.id,
    message: p.message ?? "",
    createdAt: p.created_time ?? null,
    scheduledAt: null,
    url: p.permalink_url ?? `https://www.facebook.com/${p.id}`,
  }));
  try {
    const scheduled = await graph(
      `${pageId}/scheduled_posts?fields=id,message,created_time,scheduled_publish_time&limit=50&${auth}`,
    );
    for (const p of scheduled.data ?? []) {
      posts.push({
        id: p.id,
        message: p.message ?? "",
        createdAt: p.created_time ?? null,
        scheduledAt: Number(p.scheduled_publish_time) || null,
        // naplánované nemají veřejný odkaz – spravují se v Meta Business Suite
        url: "https://business.facebook.com/",
      });
    }
  } catch (e) {
    console.error("scheduled_posts", e instanceof Error ? e.message : e);
  }
  return posts;
}

async function isEditor(req: Request): Promise<boolean> {
  const authorization = req.headers.get("Authorization");
  if (!authorization) return false;
  const url = Deno.env.get("SUPABASE_URL");
  const key = req.headers.get("apikey") ?? Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) return false;
  const sb = createClient(url, key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.rpc("is_menu_editor");
  return !error && data === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Povolený je jen POST." }, 405);

  const pageId = Deno.env.get("FB_PAGE_ID");
  const token = Deno.env.get("FB_PAGE_TOKEN");
  if (!pageId || !token) {
    return json({ error: "Sdílení na Facebook není nastavené (chybí FB_PAGE_ID nebo FB_PAGE_TOKEN v Supabase)." }, 503);
  }

  if (!(await isEditor(req))) {
    return json({ error: "Nejste přihlášeni jako editor menu." }, 403);
  }

  try {
    const isMultipart = (req.headers.get("content-type") ?? "").includes("multipart/form-data");

    if (!isMultipart) {
      const body = await req.json().catch(() => ({}));
      if (body?.action !== "status") return json({ error: "Neznámá akce." }, 400);
      const auth = `access_token=${encodeURIComponent(token)}`;
      const page = await graph(`${pageId}?fields=name,link&${auth}`);
      const since = Number(body.since) || Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;
      return json({
        ok: true,
        pageName: page.name,
        pageLink: page.link ?? `https://www.facebook.com/${pageId}`,
        posts: await recentPosts(pageId, auth, since),
      });
    }

    const form = await req.formData();
    if (form.get("action") !== "publish") return json({ error: "Neznámá akce." }, 400);

    const image = form.get("image");
    const message = String(form.get("message") ?? "").trim();
    if (!(image instanceof File) || image.size === 0) return json({ error: "Chybí obrázek menu." }, 400);
    if (image.size > MAX_IMAGE_BYTES) return json({ error: "Obrázek je příliš velký." }, 400);
    if (!message) return json({ error: "Chybí text příspěvku." }, 400);

    const fb = new FormData();
    fb.append("source", image, image.name || "menu.jpg");
    fb.append("message", message);
    fb.append("access_token", token);

    const scheduledRaw = form.get("scheduledAt");
    let scheduledAt: number | null = null;
    if (scheduledRaw) {
      scheduledAt = Number(scheduledRaw);
      const delta = scheduledAt - Math.floor(Date.now() / 1000);
      if (!Number.isFinite(scheduledAt) || delta < MIN_SCHEDULE_S || delta > MAX_SCHEDULE_S) {
        return json({ error: "Naplánovat jde nejdřív za 10 minut a nejpozději za 29 dní." }, 400);
      }
      fb.append("published", "false");
      fb.append("scheduled_publish_time", String(scheduledAt));
    }

    const result = await graph(`${pageId}/photos`, { method: "POST", body: fb });
    const postId: string | undefined = result.post_id;
    return json({
      ok: true,
      id: result.id,
      postId,
      scheduledAt,
      url: postId ? `https://www.facebook.com/${postId}` : `https://www.facebook.com/${pageId}`,
    });
  } catch (e) {
    if (e instanceof GraphError) {
      console.error("Graph API", e.code, e.message);
      return json({ error: explain(e), code: e.code }, 502);
    }
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Neznámá chyba." }, 500);
  }
});
