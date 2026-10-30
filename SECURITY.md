# Security

How the admin panel and the public site keep the salon's data safe, and a checklist to run before
handing a site over.

## The model in one paragraph

The browser only ever has the **anon (publishable) key**. Postgres **Row Level Security** decides
what that key can do: read published content, nothing else. Writing anything requires a signed-in
user who is listed in `public.admins`, a table only the SQL editor can change. The **service-role
key** is server-only and used by exactly one thing: the booking API calling `create_booking()` /
`booked_counts()`. Every admin page and server action re-checks the session and admin membership
on the server, and the proxy (`src/proxy.ts`) turns away anyone without a session before a page
even renders. UI checks are convenience; the database is the lock.

## Row Level Security policies

RLS is enabled on **every** table in `public` (verified: none without it).

| Table | Visitors (anon) & signed-in non-admins | Admins |
|---|---|---|
| `site_settings` | read the single row | read, insert, update (delete revoked) |
| `service_categories` | read | read, insert, update, delete |
| `services`, `packages`, `gallery_items`, `testimonials`, `team_members`, `faqs` | read rows where `is_published` | read all, insert, update, delete |
| `offers` | read rows where `is_active` | read all, insert, update, delete |
| `bookings` | **nothing** (no read, no write) | read, update, delete. New bookings only via `create_booking()` |
| `admins` | nothing (a user may read only their own row) | read own row. Changes only in the SQL editor |
| `storage.objects` (`site-media`) | read public files by URL | upload, update, delete, list |

Policies by name (from `pg_policies`):

```
public.<content table>   SELECT  anon, authenticated   public: read published
public.<content table>   SELECT  authenticated         admins: read all
public.<content table>   INSERT  authenticated         admins: insert
public.<content table>   UPDATE  authenticated         admins: update
public.<content table>   DELETE  authenticated         admins: delete        (not on site_settings)
public.bookings          SELECT / UPDATE / DELETE  authenticated   admins: … bookings
public.admins            SELECT  authenticated         admins: read own row
storage.objects          INSERT / UPDATE / DELETE / SELECT  authenticated   site-media: admins …
```

Every "admins:" policy is `using (public.is_admin())`. `is_admin()` is `SECURITY DEFINER` with a
fixed `search_path`, so it can check `admins` without exposing it.

### Functions

| Function | Who can call it | Notes |
|---|---|---|
| `create_booking(…)` | service role only | advisory lock per slot + unique `(date, time, seat)` index: a slot can never exceed `maxBookingsPerSlot` |
| `booked_counts(date)` | service role only | returns counts only, never names or phones |
| `admin_reorder(table, ids)` | admins (checked inside; table whitelist) | `SECURITY INVOKER`, so RLS also applies |
| `admin_set_booking_status(id, status, max)` | admins (checked inside) | re-opening a cancelled booking takes a free seat under the slot lock, or refuses |
| `is_admin()` | anyone | returns true/false for the caller only |

## Verified behaviour

Tested against the real migrations in Postgres (PGlite) for each role, with every write rolled back:

| | logged-out visitor | signed-in non-admin | admin |
|---|---|---|---|
| Read published content | ✅ | ✅ | ✅ |
| Read hidden / inactive rows | ❌ 0 rows | ❌ 0 rows | ✅ |
| Insert / update / delete any content | ❌ | ❌ (denied or 0 rows) | ✅ |
| Read bookings (names, phones) | ❌ permission denied | ❌ 0 rows | ✅ |
| Write bookings directly | ❌ | ❌ | update / delete only |
| Call `create_booking` / `booked_counts` | ❌ | ❌ | ❌ (server key only) |
| Call `admin_reorder` / `admin_set_booking_status` | ❌ | ❌ | ✅ |
| Upload to `site-media` | ❌ | ❌ | ✅ |
| Change who is an admin | ❌ | ❌ | ❌ (SQL editor only) |

And over HTTP: logged-out requests to `/admin/*` (pages, CSV export, server-action POSTs) redirect
to `/admin/login`. A signed-in non-admin is signed out and sent to the login page (no redirect
loop). Direct REST calls with the anon key to `bookings` or writes to `faqs` return `42501
permission denied`.

## Application safeguards

- **Login:** one generic error for every failure; 5 attempts per 15 minutes per IP; idle timeout
  (`admin.sessionTimeoutMinutes`); non-admin accounts are signed out immediately; optional magic
  link never creates users (`shouldCreateUser: false`).
- **Server actions:** Next.js checks the request origin (CSRF protection). Each action re-checks
  the session and admin membership, then validates input with the same Zod schema as the form.
- **Input:** text is stored as plain text with control characters stripped and rendered through
  React (escaped), so typed HTML or `<script>` never runs. Links are limited to `https://`, `#section`
  or `/page`. Map embeds are limited to Google Maps. Image URLs must come from the project's own
  bucket or `/images`.
- **Uploads:** images only (type-checked), under 5 MB, re-encoded in the browser to WebP ≤1600 px;
  the bucket itself also enforces type and size.
- **CSV export:** cells that start with `= + - @` are prefixed with `'` (no spreadsheet formula
  injection). The export is never prefetched and is `no-store`.
- **Bookings API:** rate limited, honeypot, prices and durations taken from the server's service
  list (never from the browser), slot re-checked on the server.
- **Privacy:** `/admin` sends `X-Robots-Tag: noindex` plus a noindex meta tag, is disallowed in
  `robots.txt`, absent from the sitemap and never linked from the site.
- **Fail-safe content:** the public site reads with the anon key only; if a table can't be read it
  falls back to the config files for that part alone.

## Hand-over checklist

- [ ] Supabase: **Allow new users to sign up = OFF** (Authentication → Sign In / Providers → Email)
- [ ] Only the right people are in `public.admins` (`select * from public.admins;`)
- [ ] Each person has their own login (no shared passwords), with 12+ character passwords
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set only in the host's environment variables. It doesn't start
      with `NEXT_PUBLIC_` and isn't in any committed file
- [ ] `.env` / `.env.local` are not in git (`git status` shows nothing)
- [ ] Both migration files were run on this project (re-running is safe after updates)
- [ ] Visiting `/admin` in a private window redirects to the login page
- [ ] A test account that is **not** in `admins` can't sign in
- [ ] `https://your-domain/robots.txt` shows `Disallow: /admin`
- [ ] Site URL and redirect URLs set in Supabase (only if magic-link sign-in is on)
- [ ] Supabase project owned by (or transferred to) the client's account

## Reporting a problem

If you find a security issue in this template, email the template author (see LICENSE.txt) rather
than opening a public issue.
