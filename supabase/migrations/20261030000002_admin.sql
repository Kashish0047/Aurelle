-- ════════════════════════════════════════════════════════════════════
--  Salon template · Migration 2 of 2 — admin panel content
--  Run AFTER 20261030000001_bookings.sql. Then run supabase/seed.sql once.
--  Safe to re-run: every statement is idempotent.
--
--  Security model (enforced here, in the database — not only in the UI):
--   • Visitors (anon) can only READ published content. They can never write anything.
--   • A logged-in user can WRITE only if their auth user id is listed in public.admins.
--     Being logged in is not enough: a non-admin account can do nothing.
--   • Bookings are never readable by visitors. They are created only through the website's
--     server (booking API → create_booking(), service role) and managed by admins.
-- ════════════════════════════════════════════════════════════════════

-- ── 0. Helpers ────────────────────────────────────────────────────────

-- Keeps updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. Admins ─────────────────────────────────────────────────────────
-- Rows are added by hand in the SQL editor (see ADMIN-SETUP.md). No API can insert here.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- True when the current request comes from a logged-in admin.
-- SECURITY DEFINER so RLS policies on other tables can call it without exposing public.admins.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- An admin may see their own admin row (used by the panel to confirm access). Nothing else.
drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());
revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;

-- ── 2. Site settings (single row, id = 1) ─────────────────────────────
create table if not exists public.site_settings (
  id               smallint primary key default 1 check (id = 1),
  business_name    text not null default '',
  short_name       text not null default '',
  tagline          text not null default '',
  description      text not null default '',
  phone            text not null default '',
  whatsapp         text not null default '' check (whatsapp ~ '^[0-9]{0,15}$'),
  email            text not null default '',
  address          jsonb not null default '{}'::jsonb,   -- {line1, line2, city, region, postalCode, country}
  maps_embed_url   text not null default '',
  maps_link        text not null default '',
  instagram_url    text not null default '',
  facebook_url     text not null default '',
  youtube_url      text not null default '',
  opening_hours    jsonb not null default '{}'::jsonb,   -- {mon: {open, close} | null, …}
  breaks           jsonb not null default '[]'::jsonb,   -- [{start, end, label}]
  holidays         date[] not null default '{}',
  theme            text not null default 'blush'
                   check (theme in ('blush', 'noir-gold', 'sage', 'lavender')),
  logo_url         text,
  hero             jsonb not null default '{}'::jsonb,   -- {eyebrow, headlineLines[], subheading, primaryCta, secondaryCta}
  seo_title        text not null default '',
  seo_description  text not null default '',
  sections         jsonb not null default '{}'::jsonb,   -- {about: true, offers: false, …}
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 3. Content tables ─────────────────────────────────────────────────
create table if not exists public.service_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  name        text not null check (char_length(name) between 1 and 60),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.services (
  id            uuid primary key default gen_random_uuid(),
  -- Stable public id used by the booking form and "Book this" buttons (e.g. "balayage").
  slug          text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  category_id   uuid not null references public.service_categories (id) on delete restrict,
  name          text not null check (char_length(name) between 1 and 80),
  description   text not null default '' check (char_length(description) <= 400),
  price         integer not null check (price >= 0),
  price_from    boolean not null default false,
  duration_min  integer not null check (duration_min between 5 and 720),
  image_url     text,
  image_alt     text not null default '',
  is_popular    boolean not null default false,
  is_published  boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.packages (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 80),
  tagline         text not null default '',
  description     text not null default '' check (char_length(description) <= 600),
  price           integer not null check (price >= 0),
  price_from      boolean not null default false,
  price_note      text not null default '',
  features        text[] not null default '{}',
  is_highlighted  boolean not null default false,
  cta_label       text not null default 'Enquire',
  image_url       text,
  is_published    boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.offers (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 120),
  subtitle        text not null default '',
  discount_text   text not null default '',
  code            text not null default '',
  image_url       text,
  cta_label       text not null default '',
  cta_link        text not null default '',
  start_date      timestamptz not null default now(),
  end_date        timestamptz not null,
  is_active       boolean not null default true,
  show_countdown  boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_date > start_date)
);

create table if not exists public.gallery_items (
  id                uuid primary key default gen_random_uuid(),
  title             text not null default '',
  category          text not null default '',
  image_url         text not null,
  image_alt         text not null default '',
  before_image_url  text,            -- set = before/after slider (image_url is the "after")
  size              text not null default 'square' check (size in ('tall', 'square', 'wide')),
  is_published      boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 80),
  location      text not null default '',
  service       text not null default '',
  text          text not null check (char_length(text) between 1 and 800),
  rating        smallint not null default 5 check (rating between 1 and 5),
  photo_url     text,
  is_published  boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.team_members (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 1 and 80),
  role           text not null default '',
  specialty      text not null default '',
  photo_url      text,
  photo_alt      text not null default '',
  instagram_url  text not null default '',
  is_published   boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.faqs (
  id            uuid primary key default gen_random_uuid(),
  question      text not null check (char_length(question) between 1 and 200),
  answer        text not null check (char_length(answer) between 1 and 1500),
  is_published  boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Bookings (created in migration 1) get an updated_at column for the admin panel.
alter table public.bookings add column if not exists updated_at timestamptz not null default now();

-- ── 4. Indexes ────────────────────────────────────────────────────────
create index if not exists services_category_idx     on public.services (category_id);
create index if not exists services_public_idx       on public.services (is_published, sort_order);
create index if not exists categories_sort_idx       on public.service_categories (sort_order);
create index if not exists packages_public_idx       on public.packages (is_published, sort_order);
create index if not exists offers_active_idx         on public.offers (is_active, start_date, end_date);
create index if not exists gallery_public_idx        on public.gallery_items (is_published, sort_order);
create index if not exists testimonials_public_idx   on public.testimonials (is_published, sort_order);
create index if not exists team_public_idx           on public.team_members (is_published, sort_order);
create index if not exists faqs_public_idx           on public.faqs (is_published, sort_order);
create index if not exists bookings_status_idx       on public.bookings (status, booking_date);
create index if not exists bookings_created_idx      on public.bookings (created_at desc);

-- ── 5. updated_at triggers ────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['site_settings', 'service_categories', 'services', 'packages', 'offers',
                           'gallery_items', 'testimonials', 'team_members', 'faqs', 'bookings']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ── 6. Row-level security ─────────────────────────────────────────────
-- Content tables: visitors read published rows; admins read everything and write.
-- `public_filter` is what a visitor may see on each table.
do $$
declare
  rec record;
begin
  for rec in
    select * from (values
      ('site_settings',      'true'),
      ('service_categories', 'true'),
      ('services',           'is_published'),
      ('packages',           'is_published'),
      ('offers',             'is_active'),
      ('gallery_items',      'is_published'),
      ('testimonials',       'is_published'),
      ('team_members',       'is_published'),
      ('faqs',               'is_published')
    ) as v(tbl, public_filter)
  loop
    execute format('alter table public.%I enable row level security', rec.tbl);

    execute format('drop policy if exists "public: read published" on public.%I', rec.tbl);
    execute format('create policy "public: read published" on public.%I
                    for select to anon, authenticated using (%s)', rec.tbl, rec.public_filter);

    execute format('drop policy if exists "admins: read all" on public.%I', rec.tbl);
    execute format('create policy "admins: read all" on public.%I
                    for select to authenticated using (public.is_admin())', rec.tbl);

    execute format('drop policy if exists "admins: insert" on public.%I', rec.tbl);
    execute format('create policy "admins: insert" on public.%I
                    for insert to authenticated with check (public.is_admin())', rec.tbl);

    execute format('drop policy if exists "admins: update" on public.%I', rec.tbl);
    execute format('create policy "admins: update" on public.%I
                    for update to authenticated using (public.is_admin()) with check (public.is_admin())', rec.tbl);

    execute format('drop policy if exists "admins: delete" on public.%I', rec.tbl);
    execute format('create policy "admins: delete" on public.%I
                    for delete to authenticated using (public.is_admin())', rec.tbl);

    -- Table privileges: visitors can only ever SELECT; RLS above narrows every action further.
    execute format('revoke all on table public.%I from anon, authenticated', rec.tbl);
    execute format('grant select on table public.%I to anon', rec.tbl);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', rec.tbl);
  end loop;
end;
$$;

-- The single settings row can't be deleted (it would blank the site).
drop policy if exists "admins: delete" on public.site_settings;
revoke delete on table public.site_settings from authenticated;

-- Bookings: no visitor access at all (RLS was enabled in migration 1 with no public policy).
-- Admins can read, update (status, notes) and delete. New bookings arrive only through
-- create_booking(), called by the website server with the service-role key.
drop policy if exists "admins: read bookings" on public.bookings;
create policy "admins: read bookings" on public.bookings
  for select to authenticated using (public.is_admin());
drop policy if exists "admins: update bookings" on public.bookings;
create policy "admins: update bookings" on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins: delete bookings" on public.bookings;
create policy "admins: delete bookings" on public.bookings
  for delete to authenticated using (public.is_admin());
revoke all on table public.bookings from anon, authenticated;
grant select, update, delete on table public.bookings to authenticated;

-- ── 7. Storage: site-media bucket ─────────────────────────────────────
-- Public read (images are shown on the website); only admins can upload/replace/delete.
-- Max 5 MB, images only (the panel also compresses to WebP ≤ 1600px before upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880,
        array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site-media: admins upload" on storage.objects;
create policy "site-media: admins upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "site-media: admins update" on storage.objects;
create policy "site-media: admins update" on storage.objects
  for update to authenticated using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "site-media: admins delete" on storage.objects;
create policy "site-media: admins delete" on storage.objects
  for delete to authenticated using (bucket_id = 'site-media' and public.is_admin());
-- (No SELECT policy needed: public buckets serve files by URL. Listing stays admin-only below.)
drop policy if exists "site-media: admins list" on storage.objects;
create policy "site-media: admins list" on storage.objects
  for select to authenticated using (bucket_id = 'site-media' and public.is_admin());

-- ── 8. Reordering ─────────────────────────────────────────────────────
-- Saves a drag-and-drop order in one call: p_ids[1] gets sort_order 0, p_ids[2] gets 1, …
-- SECURITY INVOKER: runs with the caller's rights, so RLS applies as well as the checks below.
create or replace function public.admin_reorder(p_table text, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  i integer;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_table not in ('service_categories', 'services', 'packages', 'offers', 'gallery_items',
                     'testimonials', 'team_members', 'faqs') then
    raise exception 'table % cannot be reordered', p_table;
  end if;
  for i in 1 .. coalesce(array_length(p_ids, 1), 0) loop
    execute format('update public.%I set sort_order = $1 where id = $2', p_table) using i - 1, p_ids[i];
  end loop;
end;
$$;
revoke execute on function public.admin_reorder(text, uuid[]) from public, anon;
grant execute on function public.admin_reorder(text, uuid[]) to authenticated;

-- ── 9. Booking status changes ─────────────────────────────────────────
-- Changing a status is a plain update, except re-opening a CANCELLED booking: its seat may have
-- been taken since, so it needs a free seat again. This does that under the same slot lock as
-- create_booking(), so re-opening can never push a slot past p_max_per_slot.
-- Returns {"ok": true} or {"ok": false, "error": "slot_full" | "not_found"}.
create or replace function public.admin_set_booking_status(p_id uuid, p_status text, p_max_per_slot integer)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  b       public.bookings%rowtype;
  v_taken integer;
  v_seat  integer;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_status not in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show') then
    raise exception 'unknown status %', p_status using errcode = '23514';
  end if;

  select * into b from public.bookings where id = p_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if b.status = 'cancelled' and p_status <> 'cancelled' then
    perform pg_advisory_xact_lock(hashtextextended('booking:' || b.booking_date::text || ' ' || b.booking_time::text, 0));
    select count(*) into v_taken from public.bookings
    where booking_date = b.booking_date and booking_time = b.booking_time and status <> 'cancelled';
    if v_taken >= greatest(p_max_per_slot, 1) then
      return jsonb_build_object('ok', false, 'error', 'slot_full');
    end if;
    select s into v_seat from generate_series(1, greatest(p_max_per_slot, 1)) as s
    where not exists (
      select 1 from public.bookings x
      where x.booking_date = b.booking_date and x.booking_time = b.booking_time and x.seat = s and x.status <> 'cancelled'
    )
    order by s limit 1;
    update public.bookings set status = p_status, seat = v_seat, updated_at = now() where id = p_id;
  else
    update public.bookings set status = p_status, updated_at = now() where id = p_id;
  end if;

  return jsonb_build_object('ok', true);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'slot_full');
end;
$$;
revoke execute on function public.admin_set_booking_status(uuid, text, integer) from public, anon;
grant execute on function public.admin_set_booking_status(uuid, text, integer) to authenticated;
