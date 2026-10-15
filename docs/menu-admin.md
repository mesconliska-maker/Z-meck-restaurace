# Administrace poledních menu

Klient si na `/admin` zadává týdenní polední menu (Po–Pá: polévka, jídla, ceny,
alergeny, poznámky typu svátek) a stahuje/tiskne z něj PDF.

## Jak to funguje

| Část | Kde běží |
| --- | --- |
| Stránka `/admin` | součást tohoto webu (React), líně načítaná – veřejné stránky nezatěžuje |
| Data | Supabase (Postgres, region Frankfurt), tabulka `weekly_menus`, 1 řádek = 1 týden |
| Přihlášení | Supabase Auth – e-mail + heslo, jen účty z tabulky `menu_editors` |
| PDF | generuje se přímo v prohlížeči (`@react-pdf/renderer`), žádný server |
| Přepnutí týdne | view `current_week_menu` – v pondělí 00:01 Europe/Prague podle hodin databáze |

Web na Vercelu **nepotřebuje žádnou novou proměnnou prostředí ani funkci**:
URL Supabase a veřejný (publishable/anon) klíč se zapíší do
`src/app/admin/lib/config.ts`. Klíč je veřejný údaj, data chrání RLS pravidla
v `supabase/schema.sql`.

Dokud je konfigurace prázdná, `/admin` běží v **demo režimu** (ukládá do
localStorage prohlížeče) – dá se tak vyzkoušet bez databáze.

## Aktuální nasazení

- Supabase organizace **ComvioApp**, projekt `rrzhyynllgbtyorvrnbg` (Frankfurt, eu-central-1),
  dashboard: <https://supabase.com/dashboard/project/rrzhyynllgbtyorvrnbg>
- `supabase/schema.sql` je spuštěné, URL a publishable klíč jsou v `src/app/admin/lib/config.ts`.

### Zbývá ručně (vyžaduje roli Owner/Admin v dashboardu)

1. Authentication → Sign In / Providers → Email: vypnout **Allow new users to sign up**.
2. Authentication → Users → Add user → e-mail + heslo klienta, zaškrtnout *Auto Confirm User*.
3. SQL Editor: `insert into public.menu_editors (email) values ('email@klienta.cz');` (malými písmeny).
   Bez tohoto řádku se klient přihlásí, ale administrace ukáže „Účet nemá oprávnění upravovat menu“.

### Nový projekt od nuly

Založit projekt (Frankfurt) → spustit `supabase/schema.sql` → body 1–3 výše →
*Project URL* a *publishable key* do `FALLBACK_SUPABASE_URL` / `FALLBACK_SUPABASE_ANON_KEY`
v `src/app/admin/lib/config.ts`.

Pozn.: Free projekt Supabase se po 7 dnech **bez jakéhokoli provozu** uspí. Po
napojení veřejného webu (dotaz při každé návštěvě) k tomu prakticky nedojde;
do té doby stačí, že klient administraci používá každý týden.

## Jídelní lístek (stránka /menu)

Administrace → **Jídelní lístek** (`/admin/jidelni-listek`): kategorie, jídla
(název, německý název, cena, štítek *Oblíbené*), pořadí a poznámka pod
lístkem. Vpravo živý náhled stránky. *Uložit a zveřejnit* zapíše celý lístek
najednou a stránka /menu ho ukáže hned.

| Část | Kde |
| --- | --- |
| Data | Supabase, tabulka `standing_menu` (jediný řádek `id = 1`, kategorie a poznámky jako JSON) |
| Práva | číst smí kdokoli, zapisovat jen editoři (`is_menu_editor()`) – `supabase/schema.sql` |
| Veřejná stránka | `src/app/pages/Menu.tsx` → `fetchStandingMenu()`; když databáze neodpoví do 5 s, ukáže `DEFAULT_STANDING_MENU` z `src/app/lib/standingMenu.ts` |
| Vzhled | `src/app/components/StandingMenuView.tsx` – sdílí ho web i náhled v administraci |

Výchozí obsah (stav webu k 15. 10. 2026) je v `supabase/standing_menu_seed.sql`.

## Sdílení na Facebook

V administraci záložka **Facebook**: obrázek menu 1080 × 1350 px (stejná sazba
jako PDF, formát `social` 4:5 – Facebook ho ve feedu ukáže celý), text příspěvku
s celým menu, tlačítka *Stáhnout obrázek*, *Kopírovat text* a *Sdílet na
Facebook* (hned, nebo naplánovaně 10 min – 29 dní dopředu).

| Část | Kde |
| --- | --- |
| Obrázek | v prohlížeči: react-pdf → pdf.js → JPEG (`src/app/admin/facebook/renderImage.ts`) |
| Publikování | Supabase Edge Function `facebook-share` (`supabase/functions/facebook-share`) |
| Kdo smí sdílet | jen editor menu – funkce volá `is_menu_editor()` s JWT přihlášeného uživatele |
| Token stránky | jen v Supabase → Edge Functions → Secrets: `FB_PAGE_ID`, `FB_PAGE_TOKEN` |

Meta aplikace **Zamecka menu** (App ID 1990221341656223) je ve vývojářském účtu
Jirky Vágnera, režim *Development* (stačí, protože token patří uživateli s rolí
v aplikaci). Jirkův Facebook účet má ke stránce Zámecká restaurace
(ID 584935721544743, vlastník firemní portfolio klienta) částečný přístup *Obsah*.

### Obnova tokenu (když administrace hlásí, že propojení přestalo platit)

Token stránky nevyprší sám, jen při změně hesla k Facebooku nebo odebrání
přístupu ke stránce. Obnova:

1. developers.facebook.com → Tools → **Graph API Explorer**, Meta App *Zamecka menu*,
   oprávnění `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`,
   `business_management` → **Generate Access Token** (vybrat stránku Zámecká restaurace).
2. ⓘ u tokenu → **Open in Access Token Tool** → **Extend Access Token** → zkopírovat nový token.
3. Graph API Explorer s prodlouženým tokenem: `me/accounts?fields=name,id,access_token`
   → `access_token` u Zámecké restaurace (v Access Token Debuggeru: *Type Page, Expires Never*).
4. Supabase → Edge Functions → Secrets → přepsat `FB_PAGE_TOKEN`.

### Nasazení funkce

```bash
supabase functions deploy facebook-share --project-ref rrzhyynllgbtyorvrnbg --no-verify-jwt
```

`--no-verify-jwt`: projekt používá nové API klíče (`sb_publishable_…`), JWT
proto ověřujeme ve funkci sami přes `is_menu_editor()`.

## Přepnutí veřejného webu (až po otestování)

Kód je připravený, stačí v `src/app/admin/lib/config.ts` nastavit
`PUBLIC_SITE_CONNECTED = true` a mergnout.

Sekce „Menu tohoto týdne“ pak nejdřív zkusí zveřejněné menu aktuálního týdne
z administrace; když žádné není nebo databáze neodpovídá, použije jako dosud
`/api/menu` (menicka.cz) a nakonec pevný fallback. Dokud je přepínač `false`,
web se na databázi vůbec neptá.

## Vývoj

```bash
npm run dev                     # /admin v demo režimu
npx tsx --tsconfig scripts/tsconfig.json scripts/render-menu-pdf.mts /tmp   # ukázková PDF bez prohlížeče
npx tsx scripts/week.test.mts   # kontrola přepínání týdne a svátků
```

Lokálně proti skutečné databázi: `.env.local` s `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY`.
