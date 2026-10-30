import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { requireAdmin } from "@/lib/admin/auth";
import { salonNow } from "@/lib/booking/slots";
import { addDays, formatDateLong, weekdayOf } from "@/lib/booking/time";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Dashboard" };

interface LatestBooking {
  reference: string;
  customer_name: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  services: { name: string }[];
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/20 text-ink",
  confirmed: "bg-ink text-bg",
  cancelled: "bg-line text-muted line-through",
  completed: "bg-bg-alt text-muted",
  no_show: "bg-accent/15 text-ink",
};

const WEEK_OFFSET = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 } as const;

/** Overview: key counts, the latest bookings and quick actions. All data is read as the admin (RLS applies). */
export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const now = new Date().toISOString();
  const today = salonNow().date;
  const weekStart = addDays(today, -WEEK_OFFSET[weekdayOf(today)]);
  const weekEnd = addDays(weekStart, 6);

  const [services, offers, week, pending, latest] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("booking_date", weekStart)
      .lte("booking_date", weekEnd)
      .neq("status", "cancelled"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("bookings")
      .select("reference, customer_name, phone, booking_date, booking_time, status, services")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const failed = [services, offers, week, pending, latest].find((r) => r.error);
  if (failed) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-surface p-8">
        <h1 className="font-serif text-3xl">Almost there</h1>
        <p className="mt-3 text-muted">
          The database isn&apos;t ready yet. Run both files in <code>supabase/migrations</code> and then{" "}
          <code>supabase/seed.sql</code> in your Supabase SQL Editor (see ADMIN-SETUP.md), then reload this page.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Services", value: services.count ?? 0, href: "/admin/services" },
    { label: "Active offers", value: offers.count ?? 0, href: "/admin/offers" },
    { label: "Bookings this week", value: week.count ?? 0, href: "/admin/bookings" },
    { label: "Waiting for you", value: pending.count ?? 0, href: "/admin/bookings", highlight: (pending.count ?? 0) > 0 },
  ];
  const rows = (latest.data ?? []) as LatestBooking[];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">{formatDateLong(today, siteConfig.locale)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/offers?new=1" className="rounded-full bg-ink px-5 py-2.5 text-sm text-bg">
            + Add offer
          </Link>
          <Link href="/admin/gallery?new=1" className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm">
            + Add photo
          </Link>
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className={cn(
                "block rounded-2xl border bg-surface p-5 transition-colors hover:border-ink/40",
                s.highlight ? "border-gold" : "border-line",
              )}
            >
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-2 font-serif text-4xl">{s.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10 rounded-2xl border border-line bg-surface" aria-labelledby="latest-title">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="latest-title" className="font-serif text-2xl">
            Latest bookings
          </h2>
          <Link href="/admin/bookings" className="link-underline text-sm text-accent">
            See all
          </Link>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-muted">No bookings yet. New bookings from your website will appear here.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((b) => (
              <li key={b.reference} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">
                    {b.customer_name}{" "}
                    <span className={cn("ml-1 rounded-full px-2.5 py-0.5 text-xs capitalize", STATUS_STYLE[b.status])}>
                      {b.status.replace("_", " ")}
                    </span>
                  </p>
                  <p className="truncate text-sm text-muted">
                    {formatDateLong(b.booking_date, siteConfig.locale)} · {formatTime(b.booking_time.slice(0, 5))} ·{" "}
                    {b.services.map((s) => s.name).join(", ")}
                  </p>
                </div>
                <a
                  href={buildWhatsAppLink(
                    `Hi ${b.customer_name}, this is ${siteConfig.name} about your booking ${b.reference}.`,
                    b.phone,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit rounded-full border border-line px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-bg"
                >
                  Message on WhatsApp
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
