import { z } from "zod";
import type { SectionKey, ThemePresetName, Weekday } from "@/config/types";
import { httpsUrl, imageUrl, optionalText, text } from "../fields";

export const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  marquee: "Scrolling text strip",
  about: "About",
  services: "Services",
  process: "How it works",
  gallery: "Recent work",
  team: "Team",
  packages: "Packages",
  testimonials: "Testimonials",
  offers: "Offer banner",
  booking: "Booking form",
  faq: "FAQ",
};

export const THEMES: ThemePresetName[] = ["blush", "noir-gold", "sage", "lavender"];

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a time.");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.");

const day = z
  .object({ open: z.boolean(), from: time, to: time })
  .refine((d) => !d.open || d.to > d.from, { path: ["to"], message: "Closing must be after opening." });

/** Google Maps "Embed a map" link only, since it's loaded in a frame on the site. */
const mapsEmbed = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https:\/\/(www\.)?google\.[a-z.]+\/maps[^\s<>"']*$/.test(v), "Paste the link from Google Maps → Share → Embed a map (the part inside src=\"…\").");

export const settingsSchema = z.object({
  business_name: text("the business name", 80),
  short_name: text("the short name", 40),
  tagline: optionalText("the tagline", 120),
  description: optionalText("the description", 300),

  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9 ()-]{8,20}$/.test(v), "Enter the phone number, e.g. +91 98765 43210."),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/[\s+()-]/g, ""))
    .pipe(z.string().regex(/^([0-9]{8,15})?$/, "Country code + number, digits only, e.g. 919876543210.")),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address."),
  address: z.object({
    line1: optionalText("the address", 120),
    line2: optionalText("the address", 120),
    city: optionalText("the city", 60),
    region: optionalText("the state", 60),
    postalCode: optionalText("the PIN code", 12),
    country: optionalText("the country code", 2),
  }),
  maps_link: httpsUrl,
  maps_embed_url: mapsEmbed,
  instagram_url: httpsUrl,
  facebook_url: httpsUrl,
  youtube_url: httpsUrl,

  hours: z.object({ mon: day, tue: day, wed: day, thu: day, fri: day, sat: day, sun: day }),
  breaks: z
    .array(z.object({ start: time, end: time, label: optionalText("the label", 30) }).refine((b) => b.end > b.start, { path: ["end"], message: "Must end after it starts." }))
    .max(5, "Up to 5 breaks."),
  holidays: z.array(z.object({ value: date })).max(100, "Up to 100 closed days."),

  theme: z.enum(THEMES as [ThemePresetName, ...ThemePresetName[]]),
  logo_url: imageUrl,

  hero: z.object({
    eyebrow: optionalText("the small line", 60),
    headline: text("the headline", 90).refine((v) => v.split("\n").filter((l) => l.trim()).length <= 4, "Up to 4 lines."),
    subheading: optionalText("the subheading", 220),
    primaryCta: text("the main button text", 30),
    secondaryCta: optionalText("the second button text", 30),
  }),

  seo_title: optionalText("the Google title", 70),
  seo_description: optionalText("the Google description", 170),

  sections: z.object(Object.fromEntries(Object.keys(SECTION_LABELS).map((k) => [k, z.boolean()])) as Record<SectionKey, z.ZodBoolean>),
});

export type SettingsValues = z.input<typeof settingsSchema>;
export type SettingsData = z.output<typeof settingsSchema>;
