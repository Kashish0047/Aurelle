import { NextResponse, type NextRequest } from "next/server";
import { bookingConfig } from "@/config/booking.config";
import { getSiteContent } from "@/lib/content/server";
import { getBookingProvider } from "@/lib/booking/providers";
import { clientIp, rateLimit } from "@/lib/booking/rateLimit";
import { bookingSchema, normalizePhone } from "@/lib/booking/schema";
import { getSlotsForDate } from "@/lib/booking/slots";
import { resolveServices, totals } from "@/lib/booking/summary";
import { BookingError, type BookingRecord, type BookingStatus, type BookResponse } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

let warnedFallback = false;

/**
 * Final status shown to the customer. "confirmed" requires BOTH confirmationMode "instant"
 * AND a provider that could count bookings for this slot (count !== null) and stored it.
 */
function resolveStatus(providerStatus: BookingStatus, providerCanCount: boolean): BookingStatus {
  if (bookingConfig.confirmationMode !== "instant") return "requested";
  if (!providerCanCount) {
    if (!warnedFallback) {
      console.warn('[booking] confirmationMode is "instant" but the provider cannot read bookings; using "manual".');
      warnedFallback = true;
    }
    return "requested";
  }
  return providerStatus;
}

const reply = (body: BookResponse, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** "AUR-7K3F9Q": brand prefix + 6 random base-36 characters. */
function makeReference(salonName: string): string {
  const prefix = salonName.normalize("NFD").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "BKG";
  const random = crypto.getRandomValues(new Uint32Array(2));
  const code = Array.from(random, (n) => n.toString(36)).join("").slice(-6).toUpperCase().padStart(6, "0");
  return `${prefix}-${code}`;
}

/**
 * POST /api/book
 * 1. Rate limit per IP, honeypot check (bots get a fake success and nothing is stored).
 * 2. Re-validate with the same Zod schema as the form, resolve services from config
 *    (the live service list, never client prices), and check the slot is still a real, open slot.
 * 3. Capacity: if the provider can count, refuse a full slot. If it returns null, skip.
 * 4. provider.createBooking, then the shown status follows bookingConfig.confirmationMode:
 *    "confirmed" only in "instant" mode with a provider that can count; otherwise "requested".
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(clientIp(req.headers))) return reply({ ok: false, error: "rate_limited" }, 429);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return reply({ ok: false, error: "validation" }, 400);
  }

  const parsed = bookingSchema.safeParse(json);
  if (!parsed.success) return reply({ ok: false, error: "validation" }, 400);
  const input = parsed.data;

  const { site, booking: rules, services: catalog } = await getSiteContent();
  const services = resolveServices(input.serviceIds, catalog);
  if (services.length !== input.serviceIds.length) return reply({ ok: false, error: "validation" }, 400);
  const { totalPrice, totalMinutes } = totals(services);

  if (!getSlotsForDate(input.date, totalMinutes, undefined, rules).includes(input.time)) {
    return reply({ ok: false, error: "slot_full" }, 409);
  }

  const booking: BookingRecord = {
    id: makeReference(site.name),
    createdAt: new Date().toISOString(),
    services,
    totalPrice,
    totalMinutes,
    date: input.date,
    time: input.time,
    name: input.name.trim(),
    phone: normalizePhone(input.phone),
    notes: input.notes.trim(),
  };

  // Honeypot filled → pretend it worked so bots don't learn anything.
  if (input.website) return reply({ ok: true, status: "requested", booking });

  const provider = getBookingProvider();
  try {
    const count = await provider.getBookedCount(booking.date, booking.time);
    if (count !== null && count >= rules.maxBookingsPerSlot) {
      return reply({ ok: false, error: "slot_full" }, 409);
    }
    const result = await provider.createBooking(booking, { name: site.name, whatsapp: site.contact.whatsapp });
    const status = resolveStatus(result.status, count !== null);
    return reply({ ok: true, status, booking, actionUrl: result.actionUrl });
  } catch (err) {
    if (err instanceof BookingError && err.code === "slot_full") return reply({ ok: false, error: "slot_full" }, 409);
    console.error("[booking] create failed:", err);
    return reply({ ok: false, error: "server_error" }, 500);
  }
}
