import "server-only";
import { z } from "zod";
import { salonNow } from "@/lib/booking/slots";
import { addDays, weekdayOf } from "@/lib/booking/time";
import type { AdminSession } from "./auth";
import { BOOKING_STATUSES, type BookingStatus } from "./booking-status";

export const BOOKING_RANGES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
] as const;
type Range = (typeof BOOKING_RANGES)[number]["value"] | "custom";

export const PAGE_SIZE = 50;

export interface BookingRow {
  id: string;
  reference: string;
  created_at: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  customer_name: string;
  phone: string;
  services: { name: string; price?: number; durationMinutes?: number }[];
  total_minutes: number;
  total_price: number;
  notes: string;
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);

/** URL search params → safe filters. Anything unexpected falls back to a default instead of erroring. */
const filterSchema = z.object({
  range: z.enum(["upcoming", "today", "week", "past", "all", "custom"]).catch("upcoming"),
  from: isoDate.optional().catch(undefined),
  to: isoDate.optional().catch(undefined),
  status: z.enum([...BOOKING_STATUSES, "all"]).catch("all"),
  // Letters, digits, spaces, + and - only: safe inside a PostgREST filter.
  q: z
    .string()
    .catch("")
    .transform((s) => s.replace(/[^\p{L}\p{N} +-]/gu, "").trim().slice(0, 60)),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});
export type BookingFilters = z.output<typeof filterSchema> & { range: Range };

export function parseBookingFilters(sp: Record<string, string | string[] | undefined>): BookingFilters {
  const raw = Object.fromEntries(["range", "from", "to", "status", "q", "page"].map((k) => [k, first(sp[k]) || undefined]));
  const f = filterSchema.parse(raw);
  if (f.from || f.to) f.range = "custom";
  return f;
}

/** Date window (inclusive) and sort direction for a range, in the salon's calendar. */
export function rangeBounds(f: BookingFilters): { from?: string; to?: string; ascending: boolean } {
  const today = salonNow().date;
  switch (f.range) {
    case "today":
      return { from: today, to: today, ascending: true };
    case "week": {
      const offset = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].indexOf(weekdayOf(today));
      const start = addDays(today, -offset);
      return { from: start, to: addDays(start, 6), ascending: true };
    }
    case "past":
      return { to: addDays(today, -1), ascending: false };
    case "all":
      return { ascending: false };
    case "custom":
      return { from: f.from, to: f.to, ascending: true };
    default:
      return { from: today, ascending: true };
  }
}

/** Bookings matching the filters, read as the admin (RLS applies). */
export function queryBookings({ supabase }: AdminSession, f: BookingFilters, page: { offset: number; limit: number }) {
  const { from, to, ascending } = rangeBounds(f);
  let q = supabase
    .from("bookings")
    .select("id, reference, created_at, booking_date, booking_time, status, customer_name, phone, services, total_minutes, total_price, notes", {
      count: "exact",
    });
  if (from) q = q.gte("booking_date", from);
  if (to) q = q.lte("booking_date", to);
  if (f.status !== "all") q = q.eq("status", f.status);
  if (f.q) q = q.or(`customer_name.ilike.*${f.q}*,phone.ilike.*${f.q}*,reference.ilike.*${f.q}*`);
  return q
    .order("booking_date", { ascending })
    .order("booking_time", { ascending })
    .range(page.offset, page.offset + page.limit - 1);
}

/** Query string for links that keep the current filters (minus `page`, plus overrides). */
export function filterQuery(f: BookingFilters, overrides: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams();
  const base: Record<string, string | undefined> = {
    range: f.range === "custom" || f.range === "upcoming" ? undefined : f.range,
    from: f.from,
    to: f.to,
    status: f.status === "all" ? undefined : f.status,
    q: f.q || undefined,
    ...overrides,
  };
  Object.entries(base).forEach(([k, v]) => v && params.set(k, v));
  const s = params.toString();
  return s ? `?${s}` : "";
}
