# Salon Website Template

A cinematic, scroll-driven website for beauty salons, spas and bridal studios: a 3D hero,
pinned scroll scenes and online booking. **Every word, price, photo, colour and setting
lives in `src/config/`**, so re-branding for a new client takes about 30 minutes and no
component code.

Built with Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger ·
Lenis · Framer Motion · Three.js (React Three Fiber) · React Hook Form + Zod.

---

## Contents

1. [Features](#features)
2. [Quick start](#quick-start)
3. [Project structure](#project-structure)
4. [Customise for a client in 10 steps](#customise-for-a-client-in-10-steps)
5. [Themes, colours and fonts](#themes-colours-and-fonts)
6. [Content, sections and the hero](#content-sections-and-the-hero)
7. [Images](#images)
8. [Booking](#booking)
9. [Admin panel (optional)](#admin-panel-optional)
10. [Deploy](#deploy)
11. [SEO](#seo)
12. [Performance and accessibility](#performance-and-accessibility)
13. [Removing the "Website by" credit](#removing-the-website-by-credit)
14. [FAQ and troubleshooting](#faq-and-troubleshooting)
15. [License](#license)

---

## Features

- **3D hero.** Procedural beauty products built only in code (no model files): a gold lipstick,
  a compact mirror, a makeup brush and a serum bottle, in front of a slowly morphing liquid pearl.
  The product turns toward the pointer and the pearl drifts after it. Low-end computers get a
  lighter version; phones get a static image by default. Image and video hero variants are included.
- **Scroll-driven sections, each with its own motion:**
  - a story section that pins in place while its statement reveals word by word,
  - a horizontal services track where the 3D product travels behind the cards, morphing from
    lipstick → compact → brush → serum and taking each service category's colour,
  - a line that draws itself through the process steps,
  - package cards that fan into place,
  - gallery columns moving at different speeds,
  - team portraits revealed like a curtain,
  - a draggable testimonial carousel.
- **Online booking.** Services → date → time → details → confirm. Time slots come from the opening
  hours, breaks and holidays you configure. Five ways to receive bookings: WhatsApp link (zero
  setup), email, webhook, Google Sheets and Supabase. Customers can add the appointment to their
  calendar (.ics download).
- **Gallery** with a fullscreen lightbox (keyboard + swipe) and a **before/after slider**.
- **4 colour themes**, switchable with one setting.
- **SEO built in.** Page metadata, Open Graph share cards, `BeautySalon` and `FAQPage` structured
  data for Google, a sitemap, robots.txt, a generated favicon and a web manifest.
- **Accessible.** Keyboard navigable, visible focus, WCAG AA colour contrast in every theme,
  reduced-motion support, screen-reader labels throughout.
- **Fast.** Scored 82–96 on Lighthouse mobile in testing (see [Performance](#performance-and-accessibility)).

---

## Quick start

Requirements: **Node.js 20.9 or newer** and npm.

```bash
npm install
cp .env.example .env.local      # optional — the site works without it
npm run dev                     # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |
| `npm run placeholders` | Create placeholder images for any image path in the config that has no file yet |
| `npm run clear-image-cache` | Clear Next.js's resized-image cache after replacing a photo that keeps the same file name |

---

## Project structure

```
src/
  config/                 ← everything you customise per client
    site.config.ts        name, contact, theme, hero variant, section switches, SEO, credit
    content.config.ts     all headings, texts, button labels, booking texts
    services.config.ts    categories, services, prices, durations, images
    packages.config.ts    bridal / spa packages
    team.config.ts        artists
    gallery.config.ts     lookbook images and before/after pairs
    testimonials.config.ts
    faq.config.ts
    booking.config.ts     opening hours, slots, holidays, provider, confirmation mode
    theme.presets.ts      blush · noir-gold · sage · lavender
    fonts.ts              the two Google Fonts
    types.ts              types for all of the above (catches config mistakes)
  components/
    sections/             one component per page section
    booking/              booking form steps, summary, success screen
    three/                3D scene
    ui/                   buttons, cursor, lightbox, slider, carousel pieces…
  lib/                    scroll engine, hooks, booking logic + providers, SEO helpers
  app/                    layout, page, API routes, sitemap, robots, icons
public/images/            photos (placeholders until replaced)
docs/                     Google Apps Script, Supabase SQL
```

> The template's one rule: **components never contain business text, prices, phone numbers,
> colours or image paths.** If you're editing a component to change content, look in
> `src/config/` instead.

---

## Customise for a client in 10 steps

Use [`CUSTOMIZE-CHECKLIST.md`](CUSTOMIZE-CHECKLIST.md) to tick these off for each client.

1. **Brand.** In `site.config.ts`, set `name`, `fullName`, `tagline`, `description`, `url`, and optionally `logo`.
2. **Theme.** In `site.config.ts`, set `theme` to `"blush"`, `"noir-gold"`, `"sage"` or `"lavender"`.
3. **Contact.** In `site.config.ts` → `contact`, set the phone, WhatsApp number (digits only, with
   country code, e.g. `919876543210`), email, address, Google Maps embed and link, and coordinates.
4. **Socials and rating.** In `site.config.ts`, set `socials` and `rating` (use `null` to hide the rating).
5. **Texts.** In `content.config.ts`, set the hero headline lines, about story, section titles,
   offer and footer.
6. **Services and prices.** In `services.config.ts`, set the services and their categories. Prices
   are plain numbers in the site currency (`currency: "INR"` in `site.config.ts`).
7. **Packages, team, gallery, testimonials, FAQ.** Each has its own config file.
8. **Hours and booking.** In `booking.config.ts`, set weekly hours, breaks, holidays, slot length,
   seats per slot and provider. See [Booking](#booking).
9. **Photos.** Replace the files in `public/images/` using the same names, or change the paths in
   the config. See [Images](#images).
10. **SEO and launch.** In `site.config.ts` → `seo`, set the titles, keywords and share image. Then
    set `NEXT_PUBLIC_SITE_URL`, deploy, and remove or change the credit.

---

## Themes, colours and fonts

**Switch theme.** Change `theme` in `site.config.ts`. Colours, buttons, the favicon and the browser
theme colour all follow it. The 3D scene has its own colours in `heroScene` (see below).

**Make a client-specific theme:**
1. In `theme.presets.ts`, copy an existing preset and rename it (e.g. `"rose-gold"`).
2. Add the new name to `ThemePresetName` in `types.ts`.
3. Change the hex values.

All four built-in presets pass WCAG AA contrast. If you change `text`, `textMuted`, `accent` or
`gold`, re-check the contrast: text needs at least 4.5:1 on `bg`, `bgAlt` and `surface`, and
`accentContrast` needs at least 4.5:1 on `accent`.

**Fonts.** In `src/config/fonts.ts`, swap the two imports for any Google Font and keep the
`variable` names. Only the weights the design uses are loaded. If you add a class like
`font-semibold` anywhere, add that weight in `fonts.ts` too.

---

## Content, sections and the hero

**Turn sections on or off** in `site.config.ts` → `sections`. A disabled section disappears from
the page and from the navigation. The offer banner also hides itself automatically once
`offers.endsAt` has passed.

**Navigation links** are set in `site.config.ts` → `nav`: each link's label, and the section it
scrolls to.

**Hero variant** is set in `site.config.ts` → `heroVariant`:

| Value | Use when |
|---|---|
| `"3d-scene"` | Default. Procedural 3D products on desktop, `heroScene.fallbackImage` on phones. |
| `"image"` | Fastest. Uses `content.hero.image` in an arch frame. Good for slow connections or older PCs. |
| `"video"` | Uses `content.hero.video` (keep it under ~3 MB, muted). Visitors with reduced motion turned on see the still poster image. |

**3D on phones** is controlled by `features.mobile3d` (default `false`). With it off, phones show
`heroScene.fallbackImage` and never download the 3D engine, which keeps mobile scores high. Set it
to `true` to show the lighter 3D version on phones too.

**The 3D scene** is configured in `site.config.ts` → `heroScene`. No component changes needed:

| Setting | What it does |
|---|---|
| `objects` | Which products to show, in order: `"lipstick"`, `"compact"`, `"brush"`, `"serum"`. The hero shows the first; the services section morphs through all of them. |
| `primaryColor` | Lipstick bullet, pressed powder, brush handle, serum |
| `accentColor` | Gold casings, rims, brush ferrule, bottle collar |
| `blobColor` | The liquid pearl behind the product (also the brush bristles) |
| `categoryTints` | Services section: the product's colour for each service category id (missing ones use `primaryColor`) |
| `mouseRange` | How far the product turns toward the pointer, in degrees (default 15) |
| `blobFollow` | 0–1, how far the pearl drifts toward the pointer |
| `lightIntensity` | Brightness of all lights (1 = default) |
| `iridescence` | 0–1, rainbow sheen on metal and the pearl |
| `keyLightColor` / `rimLightColor` | Warm main light and soft outline light |
| `environment` | Reflections. `"procedural"` (default) is built in code with no download. Or a drei preset (`"studio"`, `"city"`, `"sunset"`, `"dawn"`, `"apartment"`, `"forest"`, `"lobby"`, `"night"`, `"park"`, `"warehouse"`): these download a 1–2 MB HDR photo from the pmndrs CDN on every visit. If it fails to load, the gradient placeholder stays and the page keeps working. |
| `fallbackImage` | Shown instead of the 3D on phones and for reduced motion (portrait 3:4, arch frame) |

The materials skip true glass refraction ("transmission") on purpose. It renders the scene twice,
and its shaders compile synchronously, which froze the page for seconds on Windows in testing.
The bottle uses translucency, clearcoat and iridescence instead.

**Other switches** in `features`:

| Switch | What it controls |
|---|---|
| `preloader` | The intro curtain, shown once per visit |
| `customCursor` | The custom cursor (desktop only) |
| `grain` | The film-grain texture |
| `smoothScroll` | Smooth scrolling (desktop only) |
| `whatsappButton` | The floating WhatsApp button |

---

## Images

All image paths live in the config files. The simplest way to replace a photo is to **drop your
file into `public/images/` with the same name** as the placeholder. Then run
`npm run clear-image-cache` and restart the server. Otherwise Next.js may keep serving its cached
copy of the old image.

| Image | File | Shape | Minimum size |
|---|---|---|---|
| About section | `images/about.jpg` | portrait 3:4, subject centred (arch-shaped frame) | 1200 × 1600 |
| Hero (image variant) | `images/hero.jpg` | landscape 3:2 | 1920 × 1280 |
| 3D fallback (phones, reduced motion) | `images/hero-product.jpg` | portrait 3:4, product centred (arch frame) | 900 × 1200 |
| Services | `images/services/<id>.jpg` | portrait 4:5 (arch-shaped frame) | 1000 × 1250 |
| Team | `images/team/<id>.jpg` | portrait 3:4 | 900 × 1200 |
| Gallery | `images/gallery/*.jpg` | tall 3:4, square 1:1 or wide 4:3 (set by `size` in the config) | 1200 px wide |
| Social share | `images/og.jpg` | exactly 1200 × 630 | 1200 × 630 |

Tips:
- Use JPG or WebP, ideally under 500 KB each. Next.js serves resized, modern formats automatically.
- Update each image's `alt` text in the config so it describes the real photo.
- **Only use photos you have the right to use**: the salon's own photos, or free-licence sites
  such as Unsplash or Pexels. Never use Pinterest or Google Images results. Record each source in
  [`IMAGE-CREDITS.md`](IMAGE-CREDITS.md).
- `npm run placeholders` creates soft gradient placeholders for any image path that has no file yet.

---

## Booking

The booking form sends every booking to `/api/book`, which passes it to one **provider**: the
service that receives and stores bookings. Choose it in `src/config/booking.config.ts` →
`provider`, or override it per deployment with the `BOOKING_PROVIDER` environment variable.

| Provider | Setup | Checks free seats? | Recommended `confirmationMode` |
|---|---|---|---|
| `whatsapp-link` | none (default) | no | `manual` |
| `email` | Resend account | no | `manual` |
| `webhook` | any URL (Zapier, Make, n8n…) | no | `manual` |
| `google-sheets` | Google Sheet + Apps Script | yes | `instant` or `manual` |
| `supabase` | free Supabase project | yes, enforced by the database | `instant` or `manual` |

**`confirmationMode`** in `booking.config.ts` controls what the customer sees after booking:

- **`"instant"`** shows **"You're booked!"**. It only takes effect with providers that can check
  free seats (`google-sheets`, `supabase`). With any other provider the site automatically falls
  back to manual.
- **`"manual"`** shows **"Request received — we'll confirm your appointment on WhatsApp shortly."**
  The salon confirms each booking by hand.

**Time slots** come from these settings in `booking.config.ts`:
- `weeklyHours` (use `null` for a closed day), `breaks` and `holidays`.
- `slotMinutes`, `sameDayCutoffMinutes` and `bookingWindowDays`.

A start time is only offered if the selected services can finish before closing time.
`maxBookingsPerSlot` is how many clients can start at the same time (chairs or staff). Only Google
Sheets and Supabase can enforce it.

**Spam protection:** a hidden honeypot field, plus a limit of 5 booking attempts per IP address
per 10 minutes. The limit is kept in server memory, so on serverless hosts like Vercel treat it as
a speed bump rather than a hard limit.

**Adding your own back-end.** Every provider implements the same two methods (in
`src/lib/booking/types.ts`), so you can add one without touching any component:

```ts
createBooking(booking): Promise<{ status: "confirmed" | "requested"; actionUrl?: string }>
getBookedCount(date, time): Promise<number | null>   // null = "can't read bookings"
```

1. Add the provider file in `src/lib/booking/providers/`.
2. Register it in `providers/index.ts`.
3. Add its name to `BookingProviderName` in `src/config/types.ts`.

### WhatsApp link (default, zero setup)

There's nothing to configure. After booking, the customer taps **Send on WhatsApp**, which sends
a pre-filled message to `contact.whatsapp`.

### Email (Resend)

1. Create a free account at [resend.com](https://resend.com) and an API key.
2. To send from the salon's own domain, verify that domain in Resend (it gives you DNS records to
   add). For testing, use `onboarding@resend.dev` as the sender.
3. Set:
   ```bash
   BOOKING_PROVIDER=email
   RESEND_API_KEY=re_xxxxxxxx
   BOOKING_EMAIL_TO=owner@salon.com        # comma-separate several addresses
   BOOKING_EMAIL_FROM="Salon Bookings <bookings@salon.com>"
   ```

### Webhook (Zapier, Make, n8n, a CRM…)

Set `BOOKING_PROVIDER=webhook` and `BOOKING_WEBHOOK_URL`. Each booking is POSTed as JSON:

```json
{ "event": "booking.created", "booking": { … }, "text": "readable summary" }
```

Optionally set `BOOKING_WEBHOOK_SECRET`. It's sent as the `X-Booking-Secret` header so the
receiver can check the request really came from the site.

### Google Sheets (free, checks free seats)

1. Create a Google Sheet, then open **Extensions → Apps Script**. Replace the sample code with the
   contents of [`docs/google-apps-script.gs`](docs/google-apps-script.gs).
2. In the script, change `SECRET` to a long random string.
3. Click **Deploy → New deployment → Web app**. Set *Execute as* to **Me** and *Who has access* to
   **Anyone**. Copy the web app URL.
4. Set:
   ```bash
   BOOKING_PROVIDER=google-sheets
   GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/…/exec
   GOOGLE_SHEETS_SECRET=the-same-long-random-string
   ```
5. Bookings appear in a `Bookings` tab. To cancel one, type `cancelled` in its Status cell.
6. If you edit the script later, publish the change: **Deploy → Manage deployments → Edit →
   Version: New**.

### Supabase (≈ 10 minutes, free tier)

Supabase gives you a real Postgres database, and it guarantees two people can never book the same
seat. The database locks the time slot while it checks capacity, and a unique rule on
`(date, time, seat)` rejects anything beyond `maxBookingsPerSlot`, even under heavy load. Customer
data stays private, because row-level security blocks all public access.

#### 1. Create the project

1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Choose a name (e.g. `salon-bookings`), set a strong database password (store it safely), and
   pick the **region closest to the salon** (for India: *Mumbai / ap-south-1*).
3. Wait about a minute for the project to start.

#### 2. Create the table, functions and security rules

1. In the project, open **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/migrations/20261030000001_bookings.sql`](supabase/migrations/20261030000001_bookings.sql) and click
   **Run**. You should see *"Success. No rows returned."* It's safe to run again later.
3. Open **Table Editor** and check that an empty `bookings` table now exists.

What the script creates:

| Object | Purpose |
|---|---|
| `bookings` table | One row per booking: reference, date, time, seat, customer, services, totals, status |
| unique index `bookings_active_seat_uidx` | Only one active booking per (date, time, seat). This is the hard capacity limit. |
| `create_booking()` function | Locks the slot, checks `maxBookingsPerSlot`, assigns the lowest free seat, inserts the booking |
| `booked_counts()` function | Returns how many active bookings each time slot has on a given day |
| Row-level security | Turned on with **no** policies, and access revoked from `anon` and `authenticated`, so only your server's secret key can use the table and functions |

#### 3. Copy your keys

Open **Project Settings → API Keys** (on older dashboards: **Project Settings → API**) and copy:

- **Project URL.** Looks like `https://abcdefghijklm.supabase.co`.
- **Secret key.** Starts with `sb_secret_…`. If your project only shows *Legacy API keys*, use the
  **`service_role`** key instead (a long string starting with `eyJ…`).

> ⚠️ The secret / service_role key bypasses all security rules. Use it **only** in server
> environment variables. Never put it in a `NEXT_PUBLIC_…` variable, in `src/config/`, or in Git.
> Do **not** use the `anon` / publishable key: it's deliberately blocked from the bookings table.

#### 4. Add the environment variables

**Locally:** create `.env.local` in the project root (copy `.env.example`):

```bash
BOOKING_PROVIDER=supabase
SUPABASE_URL=https://abcdefghijklm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxx
```

Restart `npm run dev` after editing it.

**On Vercel:** go to *Project → Settings → Environment Variables*, add the same three variables
for Production and Preview, then **Redeploy**.
**On Netlify:** go to *Site configuration → Environment variables*, add them, then trigger a new deploy.

#### 5. Choose the confirmation message

In `src/config/booking.config.ts`:

```ts
provider: "supabase",          // optional if BOOKING_PROVIDER is set
confirmationMode: "instant",   // "You're booked!" — or "manual" to confirm each booking yourself
maxBookingsPerSlot: 2,         // how many clients can start at the same time (chairs / staff)
```

#### 6. Test it

1. Open the site and book any service.
2. In Supabase → **Table Editor → bookings**, a new row appears with `status = confirmed` and `seat = 1`.
3. Book the same date and time again until it's full. That time then shows as unavailable in the form.

#### Day-to-day management

- **Cancel a booking.** In Table Editor → `bookings`, set `status` to `cancelled`. The seat frees
  up instantly and can be booked again.
- **Other statuses.** `completed` and `no_show` are for your own records; they still occupy the seat.
- **Today's appointments.** Run this in the SQL Editor:
  ```sql
  select booking_time, customer_name, phone, services->0->>'name' as first_service, status
  from bookings
  where booking_date = current_date and status <> 'cancelled'
  order by booking_time, seat;
  ```
- **Export.** In Table Editor → `bookings`, choose **Export → CSV**.

#### Troubleshooting

| Symptom (in the server log) | Fix |
|---|---|
| `SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required` | The environment variables are missing. Check the spelling, then restart the dev server or redeploy. |
| `responded 401: Invalid API key` | Wrong key, or you used the anon/publishable key. Use the secret / service_role key. |
| `responded 404` … `function … not found` | `schema.sql` wasn't run in this project. Run it in the SQL Editor. |
| `permission denied for function` | You're not using the secret / service_role key. |
| Bookings suddenly fail after a quiet week | Free-tier projects pause when inactive. Open the Supabase dashboard and **Restore** the project, or upgrade the plan for client sites. |

Visitors never see these technical errors. They see a friendly message with a WhatsApp link, and
the exact cause is printed in your server or Vercel function logs.

---

## Admin panel (optional)

`/admin` lets the salon owner edit services, packages, offers, photos, testimonials, team, FAQ,
business details, hours, theme and SEO, and manage bookings, all without code. It runs on a free
Supabase project (one per client).

- **Without Supabase** the site works exactly as configured in `src/config/` (the admin login page
  just says it isn't connected). Nothing to remove.
- **With Supabase** the website shows what the owner edits, and falls back to `src/config/`
  per section if anything can't be read. Switch with `site.config.ts` → `contentSource`.
- Setup (≈ 15 minutes): [ADMIN-SETUP.md](ADMIN-SETUP.md) · Owner's guide:
  [ADMIN-USER-GUIDE.md](ADMIN-USER-GUIDE.md) · Policies & hand-over checklist: [SECURITY.md](SECURITY.md)
- Don't need it? `site.config.ts` → `admin.enabled: false` makes `/admin` a 404.

## Deploy

### Vercel (recommended)

1. Push the project to a GitHub, GitLab or Bitbucket repository.
2. At [vercel.com](https://vercel.com), choose **Add New → Project** and import the repository.
   The framework is detected automatically.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SITE_URL` (e.g. `https://salonname.com`) and
   your booking provider's variables.
4. Click **Deploy**. Then add the client's domain under **Settings → Domains** and update
   `NEXT_PUBLIC_SITE_URL` to match.

### Netlify

1. Choose **Add new site → Import an existing project** and pick the repository. Netlify detects
   Next.js automatically (build command `npm run build`).
2. Under **Site configuration → Environment variables**, add the same variables as above, then redeploy.

On both hosts the booking API runs as serverless functions, so there's no server to manage.

---

## SEO

These are generated automatically from the config:

- **Page metadata.** Title, description, keywords, canonical URL, and Open Graph and Twitter share
  cards, all from `site.config.ts` → `seo`.
- **Structured data for Google.**
  - `BeautySalon`: name, address, coordinates, phone, opening hours, services with prices, and
    social profiles.
  - `FAQPage`: the questions from `faq.config.ts`.

  After deploying, check both with Google's [Rich Results Test](https://search.google.com/test/rich-results).
- **Site files.** `/sitemap.xml`, `/robots.txt` (which keeps the booking API out of search) and
  `/manifest.webmanifest`.
- **Icons.** The favicon and iPhone home-screen icon are generated from the brand's first letter
  and theme colour (`src/app/icon.tsx`). To use a designed logo instead, delete `icon.tsx` and
  `apple-icon.tsx`, and put `icon.png` and `apple-icon.png` in `src/app/`.

**After launch:**
1. Add the site to [Google Search Console](https://search.google.com/search-console) and submit the sitemap.
2. Make sure the salon's **Google Business Profile** links to the website.

Review stars in Google search results come from the Google Business Profile. Google doesn't show
ratings a business publishes about itself, so the template deliberately leaves the rating out of
the structured data.

---

## Performance and accessibility

Measured on the production build with Lighthouse 13, simulating a mobile phone:

| Category | Mobile |
|---|---|
| Performance | 82–96 across runs |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

How the site stays fast:
- The intro curtain and the hero's entrance animation are pure CSS, so they start on the very
  first paint.
- Phones never download the 3D engine, unless you turn on `features.mobile3d`.
- On desktop, the 3D loads only after the page has finished loading. Its shaders are prepared in
  the background, so the page never freezes while they compile.
- Sections further down the page arrive with the first HTML, but their interactive scripts only
  load when the visitor scrolls close to them.
- The scrolling keyword strip runs on the graphics card, and smooth scrolling is desktop-only.
- Fonts are self-hosted and only the weights in use are loaded. Images are resized and converted
  to modern formats automatically.

Desktop Lighthouse scores are lower, around 65–70, because the 3D scene does real graphics work
while it starts. A real visitor sees this as a short pause before the product fades in. For clients
who need top desktop scores, use `heroVariant: "image"`.

Scores vary between runs and machines, so always test the deployed site with
[PageSpeed Insights](https://pagespeed.web.dev/).

**Accessibility features:**
- A skip-to-content link, page landmarks, and headings in a logical order.
- Keyboard support everywhere: focus stays inside the mobile menu while it's open, the lightbox
  works with the arrow keys and Escape, and the accordion, carousel and before/after slider all
  work from the keyboard.
- Visible focus rings and screen-reader (ARIA) labels.
- WCAG AA colour contrast in all four themes.
- Full **reduced-motion** support: when a visitor turns it on, the 3D, parallax, pinned scenes and
  smooth scrolling switch off, and all content stays complete and readable.

---

## Removing the "Website by" credit

Set `credit.show` to `false` in `site.config.ts`. Or keep it, and change `prefix`, `name` and `url`
to your own studio.

---

## FAQ and troubleshooting

**I replaced a photo but the old one still shows.**
Run `npm run clear-image-cache`, restart the server, then hard-refresh the browser (Ctrl + Shift + R).

**TypeScript shows an error after I edited a config file.**
That's the safety net. The message names the field that's wrong, for example a typo in a theme
name, or a service `category` that isn't listed in `serviceCategories`. Fix the value and save.

**The booking form says "Something went wrong".**
Check your server or Vercel function logs. They show the exact cause: a missing environment
variable, a wrong key, or a script that wasn't deployed. Each provider section above lists the
variables it needs.

**Times I expect aren't offered.**
Check `weeklyHours`, `breaks`, `holidays` and `sameDayCutoffMinutes` in `booking.config.ts`. Long
services only show start times that finish before closing. Times are in the salon's `timezone`
from `booking.config.ts`, not the visitor's.

**The intro plays every time I reload.**
It plays once per browser session, and private windows always count as a new session. Turn it
off with `features.preloader: false`.

**The 3D hero isn't showing.**
That's expected in three cases. Phones and reduced motion show `heroScene.fallbackImage`; computers
without graphics acceleration keep the soft gradient:
- on phones, unless `features.mobile3d` is on,
- when the visitor has reduced motion turned on,
- on computers without hardware graphics acceleration.

**How do I add a new section?**
1. Create the component in `src/components/sections/`.
2. Add its key to `SectionKey` in `src/config/types.ts`.
3. Add it to `sections` in `site.config.ts`.
4. Add it to `SECTION_ORDER` in `src/lib/sections.ts`.
5. Add it to the section map in `src/app/page.tsx`. If the section has no pinned scroll scene,
   add it to `DeferredSections.tsx` instead.

---

## License

See [`LICENSE.txt`](LICENSE.txt). In short: one purchase covers one end product, either your own
site or one client's site. You may not resell or redistribute the template itself.
