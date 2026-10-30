import "server-only";
import { bookingConfig } from "@/config/booking.config";
import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import type { SectionKey, Weekday } from "@/config/types";
import { SECTION_LABELS, WEEKDAYS, type SettingsData, type SettingsValues } from "./schemas/settings";

/** The site_settings row as stored (jsonb columns typed loosely; anything missing falls back to config). */
export interface SettingsRow {
  business_name: string;
  short_name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: Partial<Record<keyof SettingsValues["address"], string>>;
  maps_embed_url: string;
  maps_link: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  opening_hours: Partial<Record<Weekday, { open: string; close: string } | null>>;
  breaks: { start: string; end: string; label?: string }[];
  holidays: string[];
  theme: SettingsValues["theme"];
  logo_url: string | null;
  hero: { eyebrow?: string; headlineLines?: string[]; subheading?: string; primaryCta?: string; secondaryCta?: string };
  seo_title: string;
  seo_description: string;
  sections: Partial<Record<SectionKey, boolean>>;
}

const social = (platform: string) => siteConfig.socials.find((s) => s.platform === platform)?.url;

/** Form values from the database row, or from the config files when the row doesn't exist yet. */
export function settingsToForm(row: Partial<SettingsRow> | null): SettingsValues {
  const r = row ?? {};
  const a = siteConfig.contact.address;
  const hoursSource = r.opening_hours && Object.keys(r.opening_hours).length ? r.opening_hours : bookingConfig.weeklyHours;
  const hero = r.hero && Object.keys(r.hero).length ? r.hero : contentConfig.hero;
  return {
    business_name: r.business_name || siteConfig.fullName,
    short_name: r.short_name || siteConfig.name,
    tagline: r.tagline ?? siteConfig.tagline,
    description: r.description ?? siteConfig.description,
    phone: r.phone ?? siteConfig.contact.phone,
    whatsapp: r.whatsapp ?? siteConfig.contact.whatsapp,
    email: r.email ?? siteConfig.contact.email,
    address: {
      line1: r.address?.line1 ?? a.line1,
      line2: r.address?.line2 ?? a.line2 ?? "",
      city: r.address?.city ?? a.city,
      region: r.address?.region ?? a.region,
      postalCode: r.address?.postalCode ?? a.postalCode,
      country: r.address?.country ?? a.country,
    },
    maps_link: r.maps_link ?? siteConfig.contact.mapsLink ?? "",
    maps_embed_url: r.maps_embed_url ?? siteConfig.contact.mapsEmbedUrl ?? "",
    instagram_url: r.instagram_url ?? social("instagram") ?? "",
    facebook_url: r.facebook_url ?? social("facebook") ?? "",
    youtube_url: r.youtube_url ?? social("youtube") ?? "",
    hours: Object.fromEntries(
      WEEKDAYS.map(({ key }) => {
        const h = hoursSource[key];
        return [key, h ? { open: true, from: h.open, to: h.close } : { open: false, from: "10:00", to: "19:00" }];
      }),
    ) as SettingsValues["hours"],
    breaks: (r.breaks ?? bookingConfig.breaks).map((b) => ({ start: b.start, end: b.end, label: b.label ?? "" })),
    holidays: (r.holidays ?? bookingConfig.holidays).map((value) => ({ value })),
    theme: r.theme ?? siteConfig.theme,
    logo_url: r.logo_url ?? "",
    hero: {
      eyebrow: hero.eyebrow ?? "",
      headline: (hero.headlineLines ?? []).join("\n"),
      subheading: hero.subheading ?? "",
      primaryCta: hero.primaryCta || siteConfig.bookCtaLabel,
      secondaryCta: hero.secondaryCta ?? "",
    },
    seo_title: r.seo_title ?? siteConfig.seo.defaultTitle,
    seo_description: r.seo_description ?? siteConfig.description,
    sections: Object.fromEntries(
      (Object.keys(SECTION_LABELS) as SectionKey[]).map((k) => [k, r.sections?.[k] ?? siteConfig.sections[k]]),
    ) as SettingsValues["sections"],
  };
}

/** Validated form values → database columns. */
export function formToRow(d: SettingsData): SettingsRow & { id: 1 } {
  return {
    id: 1,
    business_name: d.business_name,
    short_name: d.short_name,
    tagline: d.tagline,
    description: d.description,
    phone: d.phone,
    whatsapp: d.whatsapp,
    email: d.email,
    address: d.address,
    maps_link: d.maps_link,
    maps_embed_url: d.maps_embed_url,
    instagram_url: d.instagram_url,
    facebook_url: d.facebook_url,
    youtube_url: d.youtube_url,
    opening_hours: Object.fromEntries(
      WEEKDAYS.map(({ key }) => [key, d.hours[key].open ? { open: d.hours[key].from, close: d.hours[key].to } : null]),
    ),
    breaks: d.breaks.map((b) => (b.label ? b : { start: b.start, end: b.end })),
    holidays: [...new Set(d.holidays.map((h) => h.value))].sort(),
    theme: d.theme,
    logo_url: d.logo_url,
    hero: {
      eyebrow: d.hero.eyebrow,
      headlineLines: d.hero.headline.split("\n").map((l) => l.trim()).filter(Boolean),
      subheading: d.hero.subheading,
      primaryCta: d.hero.primaryCta,
      secondaryCta: d.hero.secondaryCta,
    },
    seo_title: d.seo_title,
    seo_description: d.seo_description,
    sections: d.sections,
  };
}
