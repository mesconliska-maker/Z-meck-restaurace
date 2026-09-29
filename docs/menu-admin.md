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

## Zprovoznění (jednorázově)

1. Založit projekt na <https://supabase.com> (Free tier, region *Central EU – Frankfurt*).
2. SQL Editor → vložit celý `supabase/schema.sql` → Run.
3. Authentication → Sign In / Providers → Email: vypnout **Allow new users to sign up**.
4. Authentication → Users → Add user → e-mail + heslo klienta (zaškrtnout *Auto Confirm*).
5. SQL Editor: `insert into public.menu_editors (email) values ('email@klienta.cz');` (malými písmeny)
6. Project Settings → API: zkopírovat *Project URL* a *publishable/anon key* do
   `FALLBACK_SUPABASE_URL` a `FALLBACK_SUPABASE_ANON_KEY` v `src/app/admin/lib/config.ts`.
7. Merge do `main` → Vercel nasadí, administrace je na `https://www.zamecka-htyn.cz/admin`.

Pozn.: Free projekt Supabase se po 7 dnech **bez jakéhokoli provozu** uspí. Po
napojení veřejného webu (dotaz při každé návštěvě) k tomu prakticky nedojde;
do té doby stačí, že klient administraci používá každý týden.

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
