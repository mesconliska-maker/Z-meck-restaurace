-- Zámecká restaurace – databáze týdenních poledních menu (Supabase / Postgres)
--
-- Spuštění: Supabase Dashboard → SQL Editor → vložit celý soubor → Run.
-- Skript je idempotentní, lze ho pustit opakovaně.
--
-- Bezpečnost:
--   * Číst lze jen zveřejněná menu (published = true) – to potřebuje veřejný web.
--   * Zapisovat smí jen přihlášený účet, jehož e-mail je v tabulce menu_editors.
--   * V Authentication → Providers → Email VYPNOUT "Allow new users to sign up",
--     účty klientů zakládá COMVIO ručně (Authentication → Users → Add user).

create table if not exists public.weekly_menus (
  week_start    date primary key check (extract(isodow from week_start) = 1),
  days          jsonb not null default '[]'::jsonb,
  serving_hours text not null default '11:00–14:00',
  footer_note   text not null default '',
  published     boolean not null default false,
  updated_at    timestamptz not null default now(),
  updated_by    text
);

create table if not exists public.menu_editors (
  email text primary key check (email = lower(email))
);

-- Je přihlášený uživatel editor? (security definer, aby šla použít v RLS
-- i bez práva číst tabulku menu_editors)
create or replace function public.is_menu_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.menu_editors
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_menu_editor() from public;
grant execute on function public.is_menu_editor() to anon, authenticated;

-- updated_at se nastavuje v databázi, ne v prohlížeči
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists weekly_menus_touch on public.weekly_menus;
create trigger weekly_menus_touch
  before insert or update on public.weekly_menus
  for each row execute function public.touch_updated_at();

alter table public.weekly_menus enable row level security;
alter table public.menu_editors enable row level security;

drop policy if exists "public reads published menus" on public.weekly_menus;
create policy "public reads published menus" on public.weekly_menus
  for select to anon, authenticated
  using (published or (select public.is_menu_editor()));

drop policy if exists "editors insert" on public.weekly_menus;
create policy "editors insert" on public.weekly_menus
  for insert to authenticated
  with check ((select public.is_menu_editor()));

drop policy if exists "editors update" on public.weekly_menus;
create policy "editors update" on public.weekly_menus
  for update to authenticated
  using ((select public.is_menu_editor()))
  with check ((select public.is_menu_editor()));

drop policy if exists "editors delete" on public.weekly_menus;
create policy "editors delete" on public.weekly_menus
  for delete to authenticated
  using ((select public.is_menu_editor()));

-- menu_editors: žádné politiky = nikdo přes API nečte ani nemění,
-- spravuje se jen v dashboardu / SQL editoru.

-- Menu, které má být právě na webu. Přepíná se v pondělí v 00:01 českého
-- času (stejná logika jako activeWeekStart() v src/app/admin/lib/week.ts).
-- Čas bere databáze, ne prohlížeč návštěvníka.
create or replace view public.current_week_menu
with (security_invoker = true) as
  select *
  from public.weekly_menus
  where published
    and week_start = date_trunc(
      'week', (now() at time zone 'Europe/Prague') - interval '1 minute'
    )::date;

grant select on public.current_week_menu to anon, authenticated;

-- Editoři (e-maily malými písmeny). Upravte podle skutečných účtů:
-- insert into public.menu_editors (email) values ('provozni@example.cz') on conflict do nothing;
