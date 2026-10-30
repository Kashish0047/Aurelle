import "server-only";
import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  BookingConfig,
  ContentConfig,
  GalleryItem,
  Package,
  Service,
  ServiceCategory,
  SiteConfig,
  SocialPlatform,
  TeamMember,
  Testimonial,
  TimeString,
  Weekday,
} from "@/config/types";
import type { SettingsRow } from "@/lib/admin/settings";
import { CONTENT_TAGS, type ContentTag } from "@/lib/content-tags";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { configContent } from "./defaults";
import type { SiteContent } from "./types";

/**
 * Public content data layer.
 *
 * - Reads with the anon key only: Row Level Security returns published rows and nothing else.
 * - Every request is a cached fetch tagged with CONTENT_TAGS; admin saves call updateTag(), so
 *   edits show up on the next page view. A 5-minute revalidate is the safety net (and lets offers
 *   switch on/off by their dates).
 * - Each part falls back to the config files on its own if it can't be read (not connected yet,
 *   migration not run, network error), so one broken table never takes the site down.
 */

const REVALIDATE_SECONDS = 300;
/** Shown when a service or team member has no photo. */
const PLACEHOLDER_IMAGE = "/images/hero.jpg";

function publicClient(tag: ContentTag): SupabaseClient {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { tags: [tag], revalidate: REVALIDATE_SECONDS } }),
    },
  });
}

/** Runs one query; null (= use config) on any error. */
async function read<T>(tag: ContentTag, label: string, query: (db: SupabaseClient) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await query(publicClient(tag));
    if (error) {
      console.warn(`[content] ${label}: using config (${(error as { message?: string }).message ?? "error"})`);
      return null;
    }
    return data as T;
  } catch (e) {
    console.warn(`[content] ${label}: using config (${e instanceof Error ? e.message : "error"})`);
    return null;
  }
}

/* ── Row types (only the columns we select) ─────────────────────────── */

interface CategoryRow { id: string; slug: string; name: string }
interface ServiceRow {
  slug: string; category_id: string; name: string; description: string; price: number; price_from: boolean;
  duration_min: number; image_url: string | null; image_alt: string; is_popular: boolean;
}
interface PackageRow {
  id: string; name: string; tagline: string; price: number; price_from: boolean; price_note: string;
  features: string[]; is_highlighted: boolean; cta_label: string;
}
interface OfferRow {
  title: string; subtitle: string; discount_text: string; code: string; cta_label: string; cta_link: string;
  start_date: string; end_date: string;
}
interface GalleryRow {
  id: string; title: string; image_url: string; image_alt: string; before_image_url: string | null; size: GalleryItem["size"];
}
interface TestimonialRow { id: string; name: string; location: string; service: string; text: string; rating: number }
interface TeamRow {
  id: string; name: string; role: string; specialty: string; photo_url: string | null; photo_alt: string; instagram_url: string;
}
interface FaqRow { question: string; answer: string }

/* ── Mapping database rows → config shapes ──────────────────────────── */

const mapServices = (rows: ServiceRow[], categories: CategoryRow[]): Service[] => {
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  return rows.map((s) => ({
    id: s.slug,
    category: slugById.get(s.category_id) ?? "",
    name: s.name,
    description: s.description,
    durationMinutes: s.duration_min,
    price: s.price,
    priceFrom: s.price_from,
    image: { src: s.image_url || PLACEHOLDER_IMAGE, alt: s.image_alt || s.name },
    popular: s.is_popular,
  }));
};

const mapPackages = (rows: PackageRow[]): Package[] =>
  rows.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    price: p.price,
    priceFrom: p.price_from,
    priceNote: p.price_note || undefined,
    features: p.features,
    highlighted: p.is_highlighted,
    ctaLabel: p.cta_label,
  }));

const mapGallery = (rows: GalleryRow[]): GalleryItem[] =>
  rows.map((g) =>
    g.before_image_url
      ? {
          type: "before-after",
          id: g.id,
          before: { src: g.before_image_url, alt: g.image_alt ? `${g.image_alt} (before)` : "Before" },
          after: { src: g.image_url, alt: g.image_alt ? `${g.image_alt} (after)` : "After" },
          caption: g.title,
          size: g.size,
        }
      : { type: "image", id: g.id, image: { src: g.image_url, alt: g.image_alt || g.title }, caption: g.title || undefined, size: g.size },
  );

const mapTestimonials = (rows: TestimonialRow[]): Testimonial[] =>
  rows.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location || undefined,
    service: t.service || undefined,
    quote: t.text,
    rating: Math.min(5, Math.max(1, Math.round(t.rating))) as Testimonial["rating"],
  }));

const mapTeam = (rows: TeamRow[]): TeamMember[] =>
  rows.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    specialty: m.specialty,
    image: { src: m.photo_url || PLACEHOLDER_IMAGE, alt: m.photo_alt || m.name },
    instagram: m.instagram_url || undefined,
  }));

/** The first active offer (in the owner's order) whose dates include now; null = no banner. */
function liveOffer(rows: OfferRow[], base: ContentConfig["offers"]): ContentConfig["offers"] | null {
  const now = Date.now();
  const o = rows.find((r) => new Date(r.start_date).getTime() <= now && new Date(r.end_date).getTime() > now);
  if (!o) return null;
  return {
    ...base,
    eyebrow: o.discount_text || base.eyebrow,
    title: o.title,
    description: o.subtitle,
    code: o.code || undefined,
    endsAt: o.end_date,
    ctaLabel: o.cta_label || base.ctaLabel,
    ctaHref: o.cta_link || undefined,
  };
}

const SOCIAL_COLUMNS: [SocialPlatform, keyof SettingsRow][] = [
  ["instagram", "instagram_url"],
  ["facebook", "facebook_url"],
  ["youtube", "youtube_url"],
];

/** Settings row on top of siteConfig / contentConfig / bookingConfig. Missing values keep the config's. */
function applySettings(base: SiteContent, s: Partial<SettingsRow>): Pick<SiteContent, "site" | "content" | "booking"> {
  const site = base.site;
  const a = s.address ?? {};
  const socials = site.socials.flatMap((social) => {
    const column = SOCIAL_COLUMNS.find(([p]) => p === social.platform)?.[1];
    if (!column || s[column] === undefined) return [social];
    const url = s[column] as string;
    return url ? [{ ...social, url }] : [];
  });
  // Platforms set in the panel that the config didn't list.
  SOCIAL_COLUMNS.forEach(([platform, column]) => {
    const url = s[column] as string | undefined;
    if (url && !socials.some((x) => x.platform === platform)) socials.push({ platform, url });
  });

  const nextSite: SiteConfig = {
    ...site,
    name: s.short_name || site.name,
    fullName: s.business_name || site.fullName,
    tagline: s.tagline ?? site.tagline,
    description: s.description || site.description,
    theme: s.theme ?? site.theme,
    // Logos are uploaded at a 3:1 frame; the wordmark sizes them by height.
    logo: s.logo_url ? { src: s.logo_url, alt: s.short_name || site.name, width: 240, height: 80 } : site.logo,
    sections: { ...site.sections, ...(s.sections ?? {}) },
    contact: {
      ...site.contact,
      phone: s.phone || site.contact.phone,
      whatsapp: s.whatsapp || site.contact.whatsapp,
      email: s.email ?? site.contact.email,
      address: {
        line1: a.line1 ?? site.contact.address.line1,
        line2: a.line2 ?? site.contact.address.line2,
        city: a.city ?? site.contact.address.city,
        region: a.region ?? site.contact.address.region,
        postalCode: a.postalCode ?? site.contact.address.postalCode,
        country: a.country || site.contact.address.country,
      },
      mapsLink: s.maps_link || site.contact.mapsLink,
      mapsEmbedUrl: s.maps_embed_url ?? site.contact.mapsEmbedUrl,
    },
    socials,
    seo: { ...site.seo, defaultTitle: s.seo_title || site.seo.defaultTitle },
  };
  if (s.seo_description) nextSite.description = s.seo_description;

  const h = s.hero ?? {};
  const content: ContentConfig = {
    ...base.content,
    hero: {
      ...base.content.hero,
      eyebrow: h.eyebrow ?? base.content.hero.eyebrow,
      headlineLines: h.headlineLines?.length ? h.headlineLines : base.content.hero.headlineLines,
      subheading: h.subheading ?? base.content.hero.subheading,
      primaryCta: h.primaryCta || base.content.hero.primaryCta,
      secondaryCta: h.secondaryCta ?? base.content.hero.secondaryCta,
    },
  };

  const hours = s.opening_hours && Object.keys(s.opening_hours).length ? s.opening_hours : null;
  const booking: BookingConfig = {
    ...base.booking,
    weeklyHours: hours
      ? (Object.fromEntries(
          (Object.keys(base.booking.weeklyHours) as Weekday[]).map((d) => [d, hours[d] ? { open: hours[d]!.open as TimeString, close: hours[d]!.close as TimeString } : null]),
        ) as BookingConfig["weeklyHours"])
      : base.booking.weeklyHours,
    breaks: s.breaks ? s.breaks.map((b) => ({ start: b.start as TimeString, end: b.end as TimeString, label: b.label })) : base.booking.breaks,
    holidays: s.holidays ?? base.booking.holidays,
  };

  return { site: nextSite, content, booking };
}

/* ── The loader ─────────────────────────────────────────────────────── */

async function load(): Promise<SiteContent> {
  const base = configContent();
  if (base.site.contentSource !== "supabase" || !isSupabaseConfigured) return base;

  const [settings, categories, services, packages, offers, gallery, testimonials, team, faqs] = await Promise.all([
    read<Partial<SettingsRow>[]>(CONTENT_TAGS.settings, "settings", (db) => db.from("site_settings").select("*").eq("id", 1).limit(1)),
    read<CategoryRow[]>(CONTENT_TAGS.services, "categories", (db) => db.from("service_categories").select("id, slug, name").order("sort_order")),
    read<ServiceRow[]>(CONTENT_TAGS.services, "services", (db) =>
      db
        .from("services")
        .select("slug, category_id, name, description, price, price_from, duration_min, image_url, image_alt, is_popular")
        .eq("is_published", true)
        .order("sort_order"),
    ),
    read<PackageRow[]>(CONTENT_TAGS.packages, "packages", (db) =>
      db
        .from("packages")
        .select("id, name, tagline, price, price_from, price_note, features, is_highlighted, cta_label")
        .eq("is_published", true)
        .order("sort_order"),
    ),
    // Dates are filtered here, not in the query, so the cached request stays the same all day.
    read<OfferRow[]>(CONTENT_TAGS.offers, "offers", (db) =>
      db
        .from("offers")
        .select("title, subtitle, discount_text, code, cta_label, cta_link, start_date, end_date")
        .eq("is_active", true)
        .order("sort_order"),
    ),
    read<GalleryRow[]>(CONTENT_TAGS.gallery, "gallery", (db) =>
      db.from("gallery_items").select("id, title, image_url, image_alt, before_image_url, size").eq("is_published", true).order("sort_order"),
    ),
    read<TestimonialRow[]>(CONTENT_TAGS.testimonials, "testimonials", (db) =>
      db.from("testimonials").select("id, name, location, service, text, rating").eq("is_published", true).order("sort_order"),
    ),
    read<TeamRow[]>(CONTENT_TAGS.team, "team", (db) =>
      db.from("team_members").select("id, name, role, specialty, photo_url, photo_alt, instagram_url").eq("is_published", true).order("sort_order"),
    ),
    read<FaqRow[]>(CONTENT_TAGS.faqs, "faq", (db) => db.from("faqs").select("question, answer").eq("is_published", true).order("sort_order")),
  ]);

  const out: SiteContent = { ...base, source: {} };
  const take = <K extends keyof SiteContent>(key: K, value: SiteContent[K] | null) => {
    out.source[key] = value === null ? "config" : "db";
    if (value !== null) out[key] = value;
  };

  const row = settings?.[0];
  if (row) {
    Object.assign(out, applySettings(base, row));
    out.source.settings = "db";
  } else {
    out.source.settings = "config";
  }

  const catalog = services && categories ? mapServices(services, categories) : null;
  take("services", catalog);
  take(
    "serviceCategories",
    categories ? categories.map<ServiceCategory>((c) => ({ id: c.slug, label: c.name })) : null,
  );
  take("packages", packages ? mapPackages(packages) : null);
  take("gallery", gallery ? mapGallery(gallery) : null);
  take("testimonials", testimonials ? mapTestimonials(testimonials) : null);
  take("team", team ? mapTeam(team) : null);
  take("faq", faqs);

  // Offers: one live banner, or none (the section then hides itself).
  let offersOn = out.site.sections.offers;
  if (offers) {
    const live = liveOffer(offers, out.content.offers);
    out.source.offers = "db";
    if (live) out.content = { ...out.content, offers: live };
    else offersOn = false;
  }

  // A section with nothing to show is switched off (its nav link disappears with it).
  out.site = {
    ...out.site,
    sections: {
      ...out.site.sections,
      offers: offersOn,
      services: out.site.sections.services && out.services.length > 0,
      packages: out.site.sections.packages && out.packages.length > 0,
      gallery: out.site.sections.gallery && out.gallery.length > 0,
      team: out.site.sections.team && out.team.length > 0,
      testimonials: out.site.sections.testimonials && out.testimonials.length > 0,
      faq: out.site.sections.faq && out.faq.length > 0,
    },
  };
  return out;
}

/** The website's content for this render (deduplicated per request; fetches are cached across requests). */
export const getSiteContent = cache(load);
