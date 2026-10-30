import { z } from "zod";
import { bookingConfig } from "@/config/booking.config";
import { contentConfig } from "@/config/content.config";
import { fill } from "@/lib/template";

const { errors } = contentConfig.booking;

/**
 * Indian mobile: optional +91 / 91 / 0 prefix, then 10 digits starting 6–9.
 * Spaces, dashes and brackets are ignored. For another country, change this and normalizePhone.
 */
const PHONE_RE = /^(?:\+?91|0)?[6-9]\d{9}$/;
const stripPhone = (value: string) => value.replace(/[\s\-()]/g, "");

/** "+91 98765-43210" → "+919876543210" */
export function normalizePhone(value: string): string {
  return `+91${stripPhone(value).slice(-10)}`;
}

/** "+91 98765 43210" for display. */
export function formatPhoneDisplay(value: string): string {
  const digits = stripPhone(value).slice(-10);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/**
 * One schema for both sides: the form validates with it (instant, friendly errors)
 * and /api/book re-validates the same rules server-side.
 */
export const bookingSchema = z.object({
  serviceIds: z
    .array(z.string())
    .min(1, errors.services)
    .max(bookingConfig.maxServicesPerBooking, fill(errors.tooManyServices, { max: String(bookingConfig.maxServicesPerBooking) })),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, errors.date),
  time: z.string().regex(/^\d{2}:\d{2}$/, errors.time),
  name: z.string().trim().min(2, errors.name).max(80, errors.name),
  phone: z.string().refine((v) => PHONE_RE.test(stripPhone(v)), errors.phone),
  notes: z.string().max(500, errors.notes),
  /** Honeypot: hidden from people, bots fill it in. Must stay empty. */
  website: z.string(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
