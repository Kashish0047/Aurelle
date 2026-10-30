# Admin Panel Setup

The admin panel at `/admin` lets the salon owner manage services, offers, photos, team,
testimonials, FAQ, bookings and settings without touching code. It runs on **Supabase**
(database + login + image storage). Use **one Supabase project per client**.

> The owner's guide is [ADMIN-USER-GUIDE.md](ADMIN-USER-GUIDE.md); policies and the hand-over
> checklist are in [SECURITY.md](SECURITY.md).

---

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) — ideally with the **client's own account**, so
   they own their data. Free plan: 2 active projects per account.
2. **New project** → name (e.g. `salon-name`), a strong database password (store it safely),
   region closest to the salon (India: *Mumbai / ap-south-1*).

## 2. Create the database

In **SQL Editor → New query**, run these three files **in this order** (paste the whole file, click **Run**):

1. [`supabase/migrations/20261030000001_bookings.sql`](supabase/migrations/20261030000001_bookings.sql) — bookings table and the safe "no double-booking" functions
2. [`supabase/migrations/20261030000002_admin.sql`](supabase/migrations/20261030000002_admin.sql) — content tables, admin list, security rules (RLS), the `site-media` image bucket
3. [`supabase/seed.sql`](supabase/seed.sql) — fills the tables with the content currently in `src/config/`, so the site looks the same on day one

Each file is safe to run again. If you change `src/config/*` for a client **before** handing over,
run `npm run seed:generate` first to rebuild `seed.sql` from the new content.

Check: **Table Editor** shows `services` (12 rows), `faqs`, `offers` and the other tables;
**Storage** shows a `site-media` bucket marked *Public*.

## 3. Turn off public sign-ups

**Authentication → Sign In / Providers → Email**:
- **Allow new users to sign up → OFF.** Admins are only ever created by you (step 4).
- Keep **Confirm email** on.

Even if sign-ups were left on, a new account could do nothing: every write needs the user to be in
the `admins` table, which only the SQL editor can change. Turning sign-ups off is still essential hygiene.

## 4. Create the first admin

1. **Authentication → Users → Add user → Create new user**: the owner's email and a strong
   password (12+ characters). Tick **Auto Confirm User**.
2. **SQL Editor**, replacing the email:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'owner@salon.com'
   on conflict do nothing;
   ```
3. To remove someone's admin access later:
   ```sql
   delete from public.admins where user_id = (select id from auth.users where email = 'old@salon.com');
   ```

## 5. Add the environment variables

**Project Settings → API Keys**:

| Variable | Where to find it | Safe in browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, `https://xxxx.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_…`) or legacy `anon` key | Yes — security rules limit it to reading published content |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (`sb_secret_…`) or legacy `service_role` key | **No — server only.** Never prefix with `NEXT_PUBLIC_`, never commit it |

- **Locally:** put them in `.env.local` (copy `.env.example`), restart `npm run dev`.
- **Vercel:** *Project → Settings → Environment Variables* (Production + Preview), then **Redeploy**.
  `NEXT_PUBLIC_` values are built into the site, so a redeploy is required after changing them.
- **Netlify:** *Site configuration → Environment variables*, then trigger a new deploy.

To also store website bookings in Supabase, set `BOOKING_PROVIDER=supabase` (see README → Booking).
**The Bookings page only lists bookings stored this way**; with another provider it shows a notice
explaining this.

## 6. Email links (only if using magic-link login)

`site.config.ts` → `admin.magicLink: true` adds "Sign in with an email link". Then in
**Authentication → URL Configuration**:
- **Site URL:** the live domain, e.g. `https://salonname.com`
- **Redirect URLs:** add `https://salonname.com/admin/auth/callback` (and
  `http://localhost:3000/admin/auth/callback` for testing)

## 7. Log in

Open `https://your-domain/admin` → you're sent to `/admin/login` → sign in with the owner's
email and password.

---

## 8. Check the website reads the database

Change something small in the admin (e.g. a FAQ answer), press Save, then refresh the website: the
change is there within seconds. Nothing to configure. See *How the website uses the admin content*
below.

---

## How the website uses the admin content

`site.config.ts` → `contentSource`:

| Value | Website shows |
|---|---|
| `"supabase"` (default) | What the owner edits in `/admin`. While Supabase isn't connected (no env variables), or if a table can't be read, that part falls back to `src/config/*` automatically, so the site never breaks |
| `"config"` | Only `src/config/*`; the database is never read |

- **Edited in the admin:** services & categories, packages, offers, gallery, testimonials, team,
  FAQ, and from Settings the business details, socials, opening hours / breaks / closed days (the
  booking form uses them too), theme, logo, hero text, section toggles, Google title & description.
- **Still in `src/config/`:** all other wording (section headings, About, Process, marquee, labels),
  the 3D hero, fonts, booking rules such as slot length, seats per slot and booking window.
- **Updates:** saving in the admin refreshes the website immediately. Pages also refresh every
  5 minutes on their own, which is how offers switch on/off by their dates.
- **The offer banner** shows the first *Active* offer (in the admin's order) whose dates include
  now, and hides itself when there is none.
- **Empty sections hide themselves** (e.g. every team member hidden → no Team section, no menu link).
- **Photos** uploaded in the admin are served from Supabase Storage; `next.config.ts` allows that
  host automatically from `NEXT_PUBLIC_SUPABASE_URL`.
- Code: `src/lib/content/` (`server.ts` loads and maps, `context.tsx` shares it with sections).

## Admin panel settings (`site.config.ts` → `admin`)

| Setting | Default | Meaning |
|---|---|---|
| `enabled` | `true` | `false` removes `/admin` entirely (404). Use when selling/delivering without the panel. |
| `magicLink` | `false` | Offer "email me a sign-in link" on the login page. |
| `sessionTimeoutMinutes` | `60` | Sign the admin out after this long without opening an admin page. |

## How it is secured

- **Database rules (RLS) are the real lock.** Visitors can only read published content; writing
  anything requires a logged-in user listed in `admins`. Bookings are never visible to visitors.
- **Three checks on every admin request:** the proxy (`src/proxy.ts`) redirects anyone without a
  session; every admin page and action re-checks session + admin membership on the server
  (`src/lib/admin/auth.ts`); the database enforces RLS regardless.
- **Login:** one generic error for every failure, 5 attempts per 15 minutes per IP, idle timeout,
  non-admin accounts are signed straight back out.
- `/admin` is `noindex` (header + meta tag), disallowed in `robots.txt`, absent from the sitemap and navigation.

## Bookings

- Filter by Upcoming / Today / This week / Past / All, by status, by date range, or search by
  name, phone or reference. **Download CSV** exports exactly what the filters show (up to 5,000 rows;
  opens correctly in Excel and Google Sheets, including Hindi and accented names).
- Statuses: *Waiting for you* (pending), *Confirmed*, *Completed*, *No-show*, *Cancelled*.
  Pending and confirmed bookings hold their seat; **cancelling frees the seat** for other clients.
- Re-opening a cancelled booking is only allowed if the time still has a free seat (checked in the
  database under the same lock as new bookings, so a slot can never be overbooked).
- **WhatsApp** opens a chat with the client and a ready message that fits the status
  (confirmation, cancellation or thank-you). Nothing is sent until the owner presses send.

## Settings

One page for business details, opening hours and breaks, closed days, theme (with a live preview),
logo, hero text, which home-page sections are shown, and the Google title/description (with a
search-result preview). If `seed.sql` was never run, the form starts from `src/config/*` and the
first save creates the settings row.

## Images

- Photos are checked and shrunk **in the browser** before upload (JPG/PNG/WebP/AVIF, under 5 MB,
  resized to max 1600 px, saved as WebP), then stored in the `site-media` bucket.
- Replacing or removing a photo and saving deletes the old file from Storage; deleting an item
  deletes its photos too.
- **Recent Work** takes up to 20 photos at once (drag them onto the box or click *Choose photos*);
  they're added as square tiles, and each can then be edited for caption, category, shape or a
  "before" photo (which turns it into a before/after slider).
- **Offer dates** are entered in the salon's timezone (`booking.config.ts` → `timezone`), whatever
  the admin's phone or laptop is set to. An offer shows on the site only while it's *Active* and
  between its start and end.
- If a photo is uploaded but the form is then cancelled, that file stays in Storage unused. It's
  harmless; you can tidy up under **Storage → site-media** now and then.

## Troubleshooting

| Problem | Fix |
|---|---|
| Login page says "isn't connected yet" | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing — add them and restart / redeploy |
| "That email and password don't match an admin account" with the right password | The user isn't in `public.admins` (step 4), or the email isn't confirmed (tick *Auto Confirm User*) |
| "Too many attempts" | Wait 15 minutes (it resets on server restart) |
| Dashboard says "The database isn't ready yet" | Run the two migration files and `seed.sql` (step 2) |
| Signed out unexpectedly | Idle timeout — raise `admin.sessionTimeoutMinutes` |
| Email sign-in link goes to the wrong site | Fix *Site URL* / *Redirect URLs* (step 6) |
| `/admin` shows 404 | `admin.enabled` is `false` in `site.config.ts` |
| Admin changes don't show on the website | Check `contentSource` is `"supabase"`, the item is published/active, and refresh. The server log line `[content] … using config (…)` names the table it couldn't read and why |
| Website shows the old config content | Supabase env variables missing on the host (add them and **redeploy**), or the migrations/seed weren't run |
| Uploaded photos don't load on the website | Redeploy after setting `NEXT_PUBLIC_SUPABASE_URL` (the image host is read at build time) |
| Bookings page empty | Website bookings are stored here only with `BOOKING_PROVIDER=supabase` + `SUPABASE_SERVICE_ROLE_KEY` |
| "This item is still in use" when deleting a category | Move its services to another category (or delete them) first |
| Photo upload fails | Check the file is a photo under 5 MB, that the `site-media` bucket exists (step 2) and that you're signed in as an admin |
