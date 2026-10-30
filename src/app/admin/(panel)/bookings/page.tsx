import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { requireAdmin } from "@/lib/admin/auth";
import { BOOKING_STATUSES, STATUS_LABEL, type BookingStatus } from "@/lib/admin/booking-status";
import { BOOKING_RANGES, PAGE_SIZE, filterQuery, parseBookingFilters, queryBookings, type BookingRow } from "@/lib/admin/bookings";
import { activeProviderName } from "@/lib/booking/providers";
import { formatDateLong } from "@/lib/booking/time";
import { cn } from "@/lib/cn";
import { formatPrice, formatTime } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { inputClass } from "@/components/admin/ui/styles";
import { StatusPicker } from "./StatusPicker";

export const metadata: Metadata = { title: "Bookings" };

/** Pre-filled WhatsApp text that fits where the booking is. */
function whatsappText(b: BookingRow): string {
  const when = `${formatDateLong(b.booking_date, siteConfig.locale)} at ${formatTime(b.booking_time.slice(0, 5))}`;
  const what = b.services.map((s) => s.name).join(", ");
  const hi = `Hi ${b.customer_name}, this is ${siteConfig.name}.`;
  switch (b.status) {
    case "pending":
    case "confirmed":
      return `${hi} Your booking for ${what} on ${when} is confirmed (ref ${b.reference}). See you soon!`;
    case "cancelled":
      return `${hi} About your booking ${b.reference} for ${what} on ${when}: it has been cancelled. Would you like another time?`;
    default:
      return `${hi} Thank you for visiting us on ${when}! We'd love to see you again.`;
  }
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdmin();
  const filters = parseBookingFilters(await searchParams);
  const { data, count, error } = await queryBookings(session, filters, { offset: (filters.page - 1) * PAGE_SIZE, limit: PAGE_SIZE });
  const rows = (data ?? []) as BookingRow[];
  const total = count ?? rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const storesBookings = activeProviderName() === "supabase";

  // Group by date for a calmer, diary-like list.
  const days = new Map<string, BookingRow[]>();
  rows.forEach((b) => days.set(b.booking_date, [...(days.get(b.booking_date) ?? []), b]));

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Every booking made on your website. Change a status, message the client, or download a spreadsheet."
        actions={
          // Plain link (not next/link): a CSV download must not be prefetched.
          <a
            href={`/admin/bookings/export${filterQuery(filters)}`}
            download
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm transition-colors hover:border-ink/40"
          >
            Download CSV
          </a>
        }
      />

      {!storesBookings && (
        <div role="note" className="mb-6 rounded-2xl border border-gold/60 bg-surface p-5 text-sm">
          <p className="font-medium">New website bookings aren&apos;t saved here yet.</p>
          <p className="mt-1 text-muted">
            Your booking form currently sends requests another way (<code>{activeProviderName()}</code>). To keep them here, with seat
            limits checked automatically, set <code>BOOKING_PROVIDER=supabase</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> — see
            README → Booking.
          </p>
        </div>
      )}

      <nav aria-label="Date range" className="mb-4 flex flex-wrap gap-1.5">
        {BOOKING_RANGES.map((r) => {
          const active = filters.range === r.value;
          return (
            <Link
              key={r.value}
              href={`/admin/bookings${filterQuery({ ...filters, from: undefined, to: undefined }, { range: r.value === "upcoming" ? undefined : r.value })}`}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink/40",
              )}
            >
              {r.label}
            </Link>
          );
        })}
      </nav>

      <form method="get" className="mb-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end">
        {filters.range !== "custom" && filters.range !== "upcoming" && <input type="hidden" name="range" value={filters.range} />}
        <label className="flex flex-col gap-1 text-xs text-muted">
          Search
          <input name="q" defaultValue={filters.q} placeholder="Name, phone or reference" className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Status
          <select name="status" defaultValue={filters.status} className={inputClass()}>
            <option value="all">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          From
          <input type="date" name="from" defaultValue={filters.from} className={inputClass()} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          To
          <input type="date" name="to" defaultValue={filters.to} className={inputClass()} />
        </label>
        <div className="flex gap-2">
          <button type="submit" className="h-11 rounded-full bg-ink px-5 text-sm text-bg">
            Apply
          </button>
          <Link href="/admin/bookings" className="grid h-11 place-items-center rounded-full px-4 text-sm text-muted hover:bg-bg-alt">
            Reset
          </Link>
        </div>
      </form>

      {error ? (
        <p className="rounded-2xl border border-accent/40 bg-surface p-6 text-sm">
          Bookings couldn&apos;t be loaded. Make sure both migration files have been run (ADMIN-SETUP.md, step 2), then reload.
        </p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
          <p className="font-serif text-2xl">No bookings here</p>
          <p className="mt-2 text-sm text-muted">
            {filters.q || filters.status !== "all" || filters.range === "custom"
              ? "Nothing matches these filters. Try “All” or reset the filters."
              : "When clients book on your website, their appointments appear here."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted" aria-live="polite">
            {total} booking{total === 1 ? "" : "s"}
          </p>
          <div className="flex flex-col gap-8">
            {[...days].map(([date, list]) => (
              <section key={date} aria-label={formatDateLong(date, siteConfig.locale)}>
                <h2 className="mb-2 font-serif text-xl">{formatDateLong(date, siteConfig.locale)}</h2>
                <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                  {list.map((b) => (
                    <li key={b.id} className="grid gap-3 px-4 py-4 md:grid-cols-[5rem_1fr_auto] md:items-center md:px-5">
                      <p className="font-serif text-2xl leading-none">{formatTime(b.booking_time.slice(0, 5))}</p>
                      <div className="min-w-0">
                        <p className="font-medium">
                          {b.customer_name} <span className="text-sm font-normal text-muted">· {b.phone}</span>
                        </p>
                        <p className="text-sm text-muted">
                          {b.services.map((s) => s.name).join(", ")} · {b.total_minutes} min · {formatPrice(b.total_price)}
                        </p>
                        {b.notes && <p className="mt-1 text-sm italic text-muted">“{b.notes}”</p>}
                        <p className="mt-1 text-xs text-muted">Ref {b.reference}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPicker id={b.id} status={b.status as BookingStatus} label={`${b.customer_name}, ${formatTime(b.booking_time.slice(0, 5))}`} />
                        <a
                          href={buildWhatsAppLink(whatsappText(b), b.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-bg"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {pages > 1 && (
            <nav aria-label="Pages" className="mt-8 flex items-center justify-between text-sm">
              {filters.page > 1 ? (
                <Link className="rounded-full border border-line bg-surface px-4 py-2" href={`/admin/bookings${filterQuery(filters, { page: String(filters.page - 1) })}`}>
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted">
                Page {filters.page} of {pages}
              </span>
              {filters.page < pages ? (
                <Link className="rounded-full border border-line bg-surface px-4 py-2" href={`/admin/bookings${filterQuery(filters, { page: String(filters.page + 1) })}`}>
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
