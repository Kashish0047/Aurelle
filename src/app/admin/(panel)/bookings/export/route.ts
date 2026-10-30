import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { STATUS_LABEL, type BookingStatus } from "@/lib/admin/booking-status";
import { parseBookingFilters, queryBookings, type BookingRow } from "@/lib/admin/bookings";

export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

/**
 * One CSV cell. Quotes everything, doubles inner quotes, and defuses spreadsheet formulas
 * (a value starting with = + - @ would otherwise run as a formula in Excel / Sheets).
 */
function cell(value: string | number): string {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Downloads the bookings that match the current filters (same query string as the Bookings page). */
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const filters = parseBookingFilters(Object.fromEntries(request.nextUrl.searchParams));
  const { data, error } = await queryBookings(session, filters, { offset: 0, limit: MAX_ROWS });
  if (error) return NextResponse.json({ error: "Could not load bookings" }, { status: 500 });

  const header = ["Reference", "Date", "Time", "Status", "Name", "Phone", "Services", "Minutes", "Total", "Notes", "Booked at"];
  const lines = ((data ?? []) as BookingRow[]).map((b) =>
    [
      b.reference,
      b.booking_date,
      b.booking_time.slice(0, 5),
      STATUS_LABEL[b.status as BookingStatus] ?? b.status,
      b.customer_name,
      // Starts with +, so it gets the leading apostrophe too (otherwise Excel drops the + or reads a formula).
      b.phone,
      b.services.map((s) => s.name).join("; "),
      b.total_minutes,
      b.total_price,
      b.notes,
      b.created_at,
    ]
      .map(cell)
      .join(","),
  );

  // BOM so Excel opens UTF-8 names (e.g. "Zoë", "प्रिया") correctly.
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${stamp}.csv"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
