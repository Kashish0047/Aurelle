# Client Customisation Checklist

Copy this file for each client, e.g. `clients/salon-name.md`, and tick items as you go.
Details for every step are in [README.md](README.md).

**Client:** ______________________ **Domain:** ______________________ **Go-live date:** __________

---

## 1. Gather from the client

- [ ] Salon name, plus the short name for the logo/wordmark
- [ ] Tagline and a 1–2 sentence description
- [ ] Logo file (SVG or PNG), or "use the text wordmark"
- [ ] Preferred colours or mood: pick a theme (blush / noir-gold / sage / lavender) or a custom palette
- [ ] Phone number and WhatsApp number (with country code)
- [ ] Email address
- [ ] Full address, Google Maps link and Maps "Embed a map" link
- [ ] Opening hours per weekday, lunch/breaks, upcoming holidays
- [ ] How many clients can start at the same time (chairs/staff)
- [ ] Full service menu: name, category, short description, duration, price ("from" or fixed)
- [ ] Packages (bridal/spa): name, price, what's included
- [ ] Team: names, roles, specialities, portrait photos
- [ ] 6–12 gallery photos (+ one before/after pair if available)
- [ ] 3–6 real testimonials (with permission to publish), and the Google review link
- [ ] FAQ answers (booking, cancellation, products, payment…)
- [ ] Current offer (optional): title, details, code, end date
- [ ] Instagram / Facebook / YouTube / Pinterest links
- [ ] How they want to receive bookings (WhatsApp / email / Google Sheet / Supabase / their own system)

## 2. Configure (`src/config/`)

- [ ] `site.config.ts`: `name`, `fullName`, `tagline`, `description`, `url`, `logo`
- [ ] `site.config.ts`: `theme`, `heroVariant`, `features` (preloader, cursor, grain, WhatsApp button, mobile 3D)
- [ ] `site.config.ts`: `heroScene`: products and order, primary/accent/pearl colours, category tints, mouse range, lights, environment
- [ ] `site.config.ts`: `sections`, turn off any section the client doesn't need
- [ ] `site.config.ts`: `nav` labels
- [ ] `site.config.ts`: `contact`: phone, WhatsApp, WhatsApp message, email, address, maps embed, maps link, geo
- [ ] `site.config.ts`: `socials`, `rating` (or `null`)
- [ ] `site.config.ts`: `seo`: title, title template, keywords, share image, price range
- [ ] `site.config.ts`: `locale` and `currency` (if not India / INR)
- [ ] `site.config.ts`: `credit` (yours, or `show: false`)
- [ ] `content.config.ts`: hero lines, eyebrow, subheading, CTAs
- [ ] `content.config.ts`: marquee keywords
- [ ] `content.config.ts`: about story, stats, section titles and intros
- [ ] `content.config.ts`: offer (or turn off `sections.offers`)
- [ ] `content.config.ts`: WhatsApp message templates mention the right salon name
- [ ] `content.config.ts`: footer headline, preloader caption
- [ ] `services.config.ts`: categories and services with real prices and durations
- [ ] `packages.config.ts`: exactly one `highlighted: true`
- [ ] `team.config.ts`, `gallery.config.ts`, `testimonials.config.ts` (+ `googleReviewsUrl`), `faq.config.ts`
- [ ] `booking.config.ts`: timezone, weekly hours, breaks, holidays, slot length, seats per slot, window, cutoff
- [ ] `booking.config.ts`: `provider` and `confirmationMode` ("instant" only with google-sheets / supabase)

## 3. Photos (`public/images/`)

- [ ] `about.jpg` (portrait 3:4)
- [ ] `hero.jpg` (landscape, used by the image hero)
- [ ] `hero-product.jpg` (portrait 3:4, shown instead of the 3D on phones and for reduced motion)
- [ ] `services/*.jpg`, one per service id
- [ ] `team/*.jpg`, one per team member
- [ ] `gallery/*.jpg` (+ before/after pair)
- [ ] `og.jpg`, 1200 × 630 share image (logo or best interior shot)
- [ ] Every `alt` text updated to describe the real photo
- [ ] Every photo is the client's own or properly licensed, recorded in `IMAGE-CREDITS.md`
- [ ] `npm run clear-image-cache` run after replacing files

## 4. Booking provider

- [ ] Provider set up (see README → Booking) and environment variables added
- [ ] Test booking made end to end; arrives where the client expects
- [ ] Full-slot behaviour checked (google-sheets / supabase)
- [ ] Client shown how to cancel / manage bookings

## 4b. Admin panel (if the client gets one)

- [ ] Supabase project created in the client's own account; migrations + `seed.sql` run
      (run `npm run seed:generate` first if `src/config/` was customised)
- [ ] Sign-ups OFF; owner (and each staff member) added as a user and to `public.admins`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `SUPABASE_SERVICE_ROLE_KEY`
      + `BOOKING_PROVIDER=supabase` for stored bookings) set on the host, then redeployed
- [ ] Edited one item in `/admin` and saw it on the live site
- [ ] [SECURITY.md](SECURITY.md) hand-over checklist done
- [ ] Owner given [ADMIN-USER-GUIDE.md](ADMIN-USER-GUIDE.md) and a 10-minute walkthrough

## 5. Quality check

- [ ] `npm run build` succeeds (no type errors)
- [ ] Checked on a phone (360–430 px), a tablet and a desktop
- [ ] Every nav link scrolls to the right section
- [ ] WhatsApp button and links open the right number with the right message
- [ ] Phone and email links work; map shows the right place
- [ ] Booking form: services, dates, times, validation, success screen, "Add to calendar"
- [ ] Theme colours still pass contrast if customised
- [ ] Reduced-motion check (OS setting on): content is readable, nothing breaks
- [ ] No placeholder text left anywhere (search for: Aurelle, example.com, 98765, Mumbai, Ananya)

## 6. Launch

- [ ] Deployed on Vercel / Netlify with all environment variables
- [ ] Custom domain connected, HTTPS working
- [ ] `NEXT_PUBLIC_SITE_URL` set to the final domain
- [ ] PageSpeed Insights run on the live site
- [ ] Google Rich Results Test passes (BeautySalon, FAQ)
- [ ] Site added to Google Search Console, sitemap submitted
- [ ] Google Business Profile links to the website
- [ ] Client handed over: how to change prices/hours (config files), how bookings arrive
