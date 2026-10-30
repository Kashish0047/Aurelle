import { bookingConfig } from "@/config/booking.config";
import { normalizeSupabaseUrl } from "@/lib/supabase/config";
import { BookingError, type BookingProvider } from "../types";
import { formatBookingText } from "../summary";

/** How long a day's booking counts are reused before asking the database again. */
const CACHE_MS = 10_000;

interface DayCounts {
  at: number;
  counts: Record<string, number>;
}

/**
 * Supabase (Postgres) back-end, via its REST API — no SDK dependency.
 * Run supabase/migrations/*_bookings.sql first. Env:
 *   NEXT_PUBLIC_SUPABASE_URL   https://<project-ref>.supabase.co (SUPABASE_URL also accepted)
 *   SUPABASE_SERVICE_ROLE_KEY  the secret key ("sb_secret_…" or the legacy service_role JWT) — server-only
 *
 * Reads bookings back, so capacity is enforced and confirmationMode "instant" is allowed:
 *  - getBookedCount → rpc/booked_counts (one call per day, cached briefly, served per slot)
 *  - createBooking  → rpc/create_booking, which locks the slot, checks maxBookingsPerSlot and
 *    inserts in one transaction; a unique (date, time, seat) index backs it up.
 */
export function createSupabaseProvider(): BookingProvider {
  const baseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) || undefined;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cache = new Map<string, DayCounts>();

  async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    if (!baseUrl || !key) {
      throw new BookingError("misconfigured", "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }
    const res = await fetch(`${baseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        // Legacy JWT keys also go in Authorization; new "sb_secret_" keys only need `apikey`.
        ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new BookingError("provider_error", `Supabase ${fn} responded ${res.status}: ${detail.slice(0, 300)}`);
    }
    return (await res.json()) as T;
  }

  async function countsFor(date: string): Promise<Record<string, number>> {
    const hit = cache.get(date);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.counts;
    const rows = await rpc<{ slot_time: string; booked: number }[]>("booked_counts", { p_date: date });
    const counts = Object.fromEntries(rows.map((r) => [r.slot_time, r.booked]));
    cache.set(date, { at: Date.now(), counts });
    return counts;
  }

  return {
    async createBooking(booking, salon) {
      const result = await rpc<{ ok: boolean; error?: string }>("create_booking", {
        p_reference: booking.id,
        p_date: booking.date,
        p_time: booking.time,
        p_max_per_slot: bookingConfig.maxBookingsPerSlot,
        p_name: booking.name,
        p_phone: booking.phone,
        p_services: booking.services,
        p_total_minutes: booking.totalMinutes,
        p_total_price: booking.totalPrice,
        p_notes: booking.notes,
        p_summary: formatBookingText(booking, salon?.name),
        // Manual mode: a request the owner confirms in the admin panel (it still holds the seat).
        p_status: bookingConfig.confirmationMode === "instant" ? "confirmed" : "pending",
      });
      cache.delete(booking.date);
      if (!result.ok && result.error === "slot_full") throw new BookingError("slot_full");
      if (!result.ok) throw new BookingError("provider_error", `Supabase create_booking: ${result.error ?? "unknown"}`);
      return { status: "confirmed" };
    },

    async getBookedCount(date, time) {
      const counts = await countsFor(date);
      return counts[time] ?? 0;
    },
  };
}
