import { bookingConfig } from "@/config/booking.config";
import { BookingError, type BookingProvider } from "../types";
import { formatBookingText } from "../summary";

/** How long a day's booking counts are reused before asking the sheet again. */
const CACHE_MS = 15_000;

interface DayCounts {
  at: number;
  counts: Record<string, number>;
}

/**
 * Google Sheets via a free Apps Script web app (script in docs/google-apps-script.gs).
 * Env: GOOGLE_SHEETS_WEBAPP_URL, GOOGLE_SHEETS_SECRET (same value as SECRET in the script).
 *
 * This provider CAN read bookings back, so capacity is enforced:
 *  - getBookedCount asks the script for all counts of that day once, then serves every slot
 *    of that day from a short in-memory cache (one request per day view, not one per slot);
 *  - createBooking sends maxBookingsPerSlot along, and the script re-checks the count under a
 *    lock before appending — so two people can't grab the last seat at the same moment.
 */
export function createGoogleSheetsProvider(): BookingProvider {
  const url = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET ?? "";
  const cache = new Map<string, DayCounts>();

  const requireUrl = () => {
    if (!url) throw new BookingError("misconfigured", "GOOGLE_SHEETS_WEBAPP_URL is required");
    return url;
  };

  async function countsFor(date: string): Promise<Record<string, number>> {
    const hit = cache.get(date);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.counts;
    const endpoint = new URL(requireUrl());
    endpoint.searchParams.set("action", "counts");
    endpoint.searchParams.set("date", date);
    endpoint.searchParams.set("secret", secret);
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) throw new BookingError("provider_error", `Sheets responded ${res.status}`);
    const data = (await res.json()) as { ok: boolean; counts?: Record<string, number> };
    if (!data.ok || !data.counts) throw new BookingError("provider_error", "Sheets returned an error");
    cache.set(date, { at: Date.now(), counts: data.counts });
    return data.counts;
  }

  return {
    async createBooking(booking, salon) {
      // Apps Script answers POSTs with a redirect; fetch follows it and returns the JSON.
      const res = await fetch(requireUrl(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "create",
          secret,
          maxPerSlot: bookingConfig.maxBookingsPerSlot,
          booking: {
            ...booking,
            services: booking.services.map((s) => s.name).join(", "),
            summary: formatBookingText(booking, salon?.name),
          },
        }),
      });
      if (!res.ok) throw new BookingError("provider_error", `Sheets responded ${res.status}`);
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok && data.error === "slot_full") throw new BookingError("slot_full");
      if (!data.ok) throw new BookingError("provider_error", data.error ?? "Sheets returned an error");
      cache.delete(booking.date);
      return { status: "confirmed" };
    },

    async getBookedCount(date, time) {
      const counts = await countsFor(date);
      return counts[time] ?? 0;
    },
  };
}
