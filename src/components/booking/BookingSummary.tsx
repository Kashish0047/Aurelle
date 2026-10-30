import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import type { BookingController } from "@/lib/booking/useBooking";
import { formatDateLong } from "@/lib/booking/time";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice, formatTime } from "@/lib/format";

/** Live receipt beside the form: updates as services, date and time are chosen. */
export function BookingSummary({ booking, className }: { booking: BookingController; className?: string }) {
  const copy = contentConfig.booking.summary;
  const { selected, values, totalMinutes, totalPrice, fromPrice } = booking;

  return (
    <aside aria-label={copy.title} className={cn("rounded-[1.75rem] border border-line bg-surface/60 p-6 backdrop-blur", className)}>
      <h3 className="font-serif text-2xl">{copy.title}</h3>
      {selected.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{copy.empty}</p>
      ) : (
        <dl className="mt-5 flex flex-col gap-3 text-sm">
          <Row label={copy.services}>
            <ul className="text-right">
              {selected.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </Row>
          {values.date && <Row label={copy.date}>{formatDateLong(values.date, siteConfig.locale)}</Row>}
          {values.time && <Row label={copy.time}>{formatTime(values.time)}</Row>}
          <Row label={copy.duration}>{formatDuration(totalMinutes)}</Row>
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <dt className="text-muted">{copy.total}</dt>
            <dd className="font-serif text-2xl">{formatPrice(totalPrice, fromPrice)}</dd>
          </div>
        </dl>
      )}
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
