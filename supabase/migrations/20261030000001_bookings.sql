-- ════════════════════════════════════════════════════════════════════
--  Salon template · Migration 1 of 2 — bookings
--  Run in Supabase → SQL Editor → New query → paste → Run (or `supabase db push`).
--  Safe to re-run: every statement is idempotent.
--  Then run 20261030000002_admin.sql for the admin panel (optional without it).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Table ──────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id             uuid        primary key default gen_random_uuid(),
  reference      text        not null unique,                 -- e.g. "AUR-7K3F9Q"
  created_at     timestamptz not null default now(),
  booking_date   date        not null,                        -- salon-local date
  booking_time   time        not null,                        -- salon-local start time
  seat           smallint    not null check (seat >= 1),      -- 1 … maxBookingsPerSlot
  -- pending = request awaiting the owner (manual confirmation mode); it still holds its seat.
  status         text        not null default 'pending'
                 check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  customer_name  text        not null check (char_length(customer_name) between 2 and 80),
  phone          text        not null check (phone ~ '^\+[0-9]{8,15}$'),
  services       jsonb       not null,                        -- [{id, name, price, durationMinutes}]
  total_minutes  integer     not null check (total_minutes > 0),
  total_price    integer     not null check (total_price >= 0),
  notes          text        not null default '' check (char_length(notes) <= 500),
  summary        text        not null default ''              -- human-readable text, handy in exports
);

-- Upgrade path for databases created before 'pending' existed.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show'));
alter table public.bookings alter column status set default 'pending';

-- Capacity guarantee at the database level: among non-cancelled bookings, each
-- (date, time, seat) can exist only once. Seats run 1…maxBookingsPerSlot, so a slot can
-- never hold more active bookings than seats — even under concurrent requests.
-- Cancelling a booking (status = 'cancelled') frees its seat automatically.
create unique index if not exists bookings_active_seat_uidx
  on public.bookings (booking_date, booking_time, seat)
  where status <> 'cancelled';

create index if not exists bookings_date_idx on public.bookings (booking_date, booking_time);

-- ── 2. Row-level security ────────────────────────────────────────────
-- RLS on, and deliberately NO policies: the public "anon" and "authenticated" roles can
-- neither read nor write bookings (customer phone numbers stay private).
-- The website's server talks to the table only through the two functions below,
-- using the secret service-role key that never reaches the browser.
alter table public.bookings enable row level security;
revoke all on table public.bookings from anon, authenticated;

-- ── 3. Count active bookings per time slot for one day ───────────────
create or replace function public.booked_counts(p_date date)
returns table (slot_time text, booked integer)
language sql
stable
security definer
set search_path = public
as $$
  select to_char(b.booking_time, 'HH24:MI') as slot_time, count(*)::integer as booked
  from public.bookings b
  where b.booking_date = p_date
    and b.status <> 'cancelled'
  group by b.booking_time;
$$;

-- ── 4. Create a booking atomically ───────────────────────────────────
-- Returns {"ok": true, "seat": n} or {"ok": false, "error": "slot_full" | "duplicate_reference"}.
-- p_status: 'pending' (owner confirms by hand) or 'confirmed' (instant confirmation mode).
-- Pending and confirmed bookings both hold a seat; only 'cancelled' frees it.
drop function if exists public.create_booking(text, date, time, integer, text, text, jsonb, integer, integer, text, text);
create or replace function public.create_booking(
  p_reference     text,
  p_date          date,
  p_time          time,
  p_max_per_slot  integer,
  p_name          text,
  p_phone         text,
  p_services      jsonb,
  p_total_minutes integer,
  p_total_price   integer,
  p_notes         text default '',
  p_summary       text default '',
  p_status        text default 'pending'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_taken      integer;
  v_seat       integer;
  v_constraint text;
begin
  if p_max_per_slot is null or p_max_per_slot < 1 then
    raise exception 'p_max_per_slot must be at least 1';
  end if;
  if p_status not in ('pending', 'confirmed') then
    raise exception 'p_status must be pending or confirmed';
  end if;

  -- Requests for the same date+time queue up here, one at a time, until this
  -- transaction ends. Other slots are unaffected.
  perform pg_advisory_xact_lock(hashtextextended('booking:' || p_date::text || ' ' || p_time::text, 0));

  select count(*) into v_taken
  from public.bookings
  where booking_date = p_date and booking_time = p_time and status <> 'cancelled';

  if v_taken >= p_max_per_slot then
    return jsonb_build_object('ok', false, 'error', 'slot_full');
  end if;

  -- Lowest free seat number (fills gaps left by cancellations).
  select s into v_seat
  from generate_series(1, p_max_per_slot) as s
  where not exists (
    select 1 from public.bookings b
    where b.booking_date = p_date and b.booking_time = p_time
      and b.seat = s and b.status <> 'cancelled'
  )
  order by s
  limit 1;

  if v_seat is null then
    return jsonb_build_object('ok', false, 'error', 'slot_full');
  end if;

  insert into public.bookings (
    reference, booking_date, booking_time, seat, status, customer_name, phone,
    services, total_minutes, total_price, notes, summary
  ) values (
    p_reference, p_date, p_time, v_seat, p_status, p_name, p_phone,
    p_services, p_total_minutes, p_total_price, coalesce(p_notes, ''), coalesce(p_summary, '')
  );

  return jsonb_build_object('ok', true, 'seat', v_seat);
exception
  when unique_violation then
    -- Last line of defence: the unique seat index (or reference) refused the row.
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'bookings_reference_key' then
      return jsonb_build_object('ok', false, 'error', 'duplicate_reference');
    end if;
    return jsonb_build_object('ok', false, 'error', 'slot_full');
end;
$$;

-- ── 5. Only the server (service role) may call the functions ─────────
-- Supabase grants EXECUTE on new functions to anon/authenticated by default; take it back.
revoke execute on function public.booked_counts(date) from public, anon, authenticated;
revoke execute on function public.create_booking(text, date, time, integer, text, text, jsonb, integer, integer, text, text, text)
  from public, anon, authenticated;
grant execute on function public.booked_counts(date) to service_role;
grant execute on function public.create_booking(text, date, time, integer, text, text, jsonb, integer, integer, text, text, text)
  to service_role;
