import { NextResponse, type NextRequest } from "next/server";
import { getSiteContent } from "@/lib/content/server";
import { getBookingProvider } from "@/lib/booking/providers";
import { getSlotsForDate } from "@/lib/booking/slots";
import type { AvailabilityResponse } from "@/lib/booking/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?date=YYYY-MM-DD&duration=90
 * Slots come from the booking rules (config + admin hours/closed days); occupancy comes from provider.getBookedCount.
 * If the provider can't count (returns null), every slot is open and mode is "request".
 */
export async function GET(req: NextRequest) {
  const { booking: rules } = await getSiteContent();
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const duration = Number(req.nextUrl.searchParams.get("duration")) || rules.slotMinutes;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  const times = getSlotsForDate(date, Math.min(duration, 24 * 60), undefined, rules);
  const provider = getBookingProvider();

  try {
    const counts = await Promise.all(times.map((t) => provider.getBookedCount(date, t)));
    const canCount = counts.every((c) => c !== null);
    const max = rules.maxBookingsPerSlot;

    const body: AvailabilityResponse = {
      date,
      mode: canCount ? "confirmed" : "request",
      slots: times.map((time, i) => {
        const count = counts[i];
        if (!canCount || count === null || count === undefined) return { time, available: true, remaining: null };
        const remaining = Math.max(0, max - count);
        return { time, available: remaining > 0, remaining };
      }),
    };
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[booking] availability failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 502 });
  }
}
