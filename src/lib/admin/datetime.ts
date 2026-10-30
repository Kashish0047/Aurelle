import { zonedNow, zonedTimeToUtc } from "@/lib/booking/time";

/**
 * Offers are typed in the salon's own clock (booking.config.ts → timezone), whatever the
 * admin's device timezone is, and stored as real instants (timestamptz).
 */

/** "2026-12-31T23:59" in `timeZone` → ISO instant. */
export function localInputToIso(value: string, timeZone: string): string {
  const [date, time] = value.split("T");
  return zonedTimeToUtc(date!, time!, timeZone).toISOString();
}

/** ISO instant → "2026-12-31T23:59" in `timeZone` (for <input type="datetime-local">). */
export function isoToLocalInput(iso: string, timeZone: string): string {
  const { date, minutes } = zonedNow(timeZone, new Date(iso));
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${date}T${hh}:${mm}`;
}

/** Readable date in the salon's timezone, e.g. "31 Dec 2026, 11:59 pm". */
export function formatInstant(iso: string, timeZone: string, locale = "en-IN"): string {
  return new Intl.DateTimeFormat(locale, { timeZone, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );
}

/** Where an offer is in its run, from its dates alone. */
export function offerPhase(startIso: string, endIso: string, at: number = Date.now()): "live" | "scheduled" | "ended" {
  if (new Date(endIso).getTime() <= at) return "ended";
  return new Date(startIso).getTime() > at ? "scheduled" : "live";
}
