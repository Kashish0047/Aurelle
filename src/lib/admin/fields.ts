import { z } from "zod";
import { isAllowedImageUrl } from "./media";

/**
 * Shared field rules for every admin form, used by both the browser (instant messages)
 * and the server action (the real check).
 *
 * Text is stored as plain text: invisible control characters are stripped and the site always
 * renders content through React, which escapes it — so typed HTML can never run on the site.
 */
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

export const text = (label: string, max: number) =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().min(1, `Please enter ${label}.`).max(max, `Please keep ${label} under ${max} characters.`));

export const optionalText = (label: string, max: number) =>
  z.string().transform(clean).pipe(z.string().max(max, `Please keep ${label} under ${max} characters.`));

/** URL-friendly id, e.g. "hair-colour". */
export const slug = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Please enter a short link name.")
      .max(60, "Please keep it under 60 characters.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only (e.g. hair-colour)."),
  );

/** Whole rupees (or whichever currency the site uses). */
export const money = z
  .number({ error: "Please enter a price." })
  .int("Please enter a whole number.")
  .min(0, "The price can't be negative.")
  .max(10_000_000, "That price looks too high.");

export const minutes = z
  .number({ error: "Please enter how long it takes." })
  .int("Please enter whole minutes.")
  .min(5, "At least 5 minutes.")
  .max(720, "At most 12 hours.");

export const imageUrl = z
  .string()
  .refine((u) => u === "" || isAllowedImageUrl(u), "Please upload the image again.")
  .transform((u) => (u === "" ? null : u));

export const uuid = z.string().uuid();

/** Turns a name into a slug suggestion: "Hand-painted Balayage" → "hand-painted-balayage". */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Optional web link; must be a full https:// address (e.g. an Instagram profile). */
export const httpsUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https:\/\/[^\s<>"']+$/.test(v), "Please enter a full link starting with https://")
  .pipe(z.string().max(300, "That link is too long."));

/** Button link: a section on this page (#booking), a page on this site (/…) or a full https:// link. */
export const ctaLink = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^#[a-z0-9-]+$/.test(v) || /^\/[\w\-./?=&#%]*$/.test(v) || /^https:\/\/[^\s<>"']+$/.test(v),
    "Use #booking for a section, /page for a page on this site, or a full https:// link.",
  );

/** <input type="datetime-local"> value, e.g. "2026-12-31T23:59". */
export const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Please choose a date and time.");

/** An image that must be present. */
export const requiredImageUrl = imageUrl.refine((v) => v !== null, "Please upload a photo.");
