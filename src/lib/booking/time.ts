import type { Weekday } from "@/config/types";

/**
 * Timezone-safe date helpers. Dates are plain "YYYY-MM-DD" strings and times "HH:mm",
 * always interpreted in the salon's timezone (bookingConfig.timezone) — never the visitor's.
 */

const WEEKDAY_BY_UTC_DAY: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const pad = (n: number) => String(n).padStart(2, "0");

export function toMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function parseDate(date: string): [number, number, number] {
  const [y = 1970, m = 1, d = 1] = date.split("-").map(Number);
  return [y, m, d];
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = parseDate(date);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function weekdayOf(date: string): Weekday {
  const [y, m, d] = parseDate(date);
  return WEEKDAY_BY_UTC_DAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]!;
}

/** Current date and minutes-since-midnight in `timeZone`. */
export function zonedNow(timeZone: string, at: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** Offset of `timeZone` from UTC at instant `at`, in minutes (e.g. +330 for Asia/Kolkata). */
function offsetMinutes(timeZone: string, at: Date): number {
  const { date, minutes } = zonedNow(timeZone, at);
  const [y, m, d] = parseDate(date);
  const wallAsUtc = Date.UTC(y, m - 1, d) + minutes * 60_000;
  const atMinute = Math.floor(at.getTime() / 60_000) * 60_000;
  return Math.round((wallAsUtc - atMinute) / 60_000);
}

/** Converts a wall-clock date + time in `timeZone` to a real instant (handles DST shifts). */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = parseDate(date);
  const guess = Date.UTC(y, m - 1, d) + toMinutes(time) * 60_000;
  let utc = guess - offsetMinutes(timeZone, new Date(guess)) * 60_000;
  const corrected = guess - offsetMinutes(timeZone, new Date(utc)) * 60_000;
  if (corrected !== utc) utc = corrected;
  return new Date(utc);
}

/** "Sat, 14 Nov 2026" (calendar date only — no timezone shifting). */
export function formatDateLong(date: string, locale: string): string {
  const [y, m, d] = parseDate(date);
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Parts for compact date pills: { weekday: "Sat", day: "14", month: "Nov" }. */
export function dateParts(date: string, locale: string) {
  const [y, m, d] = parseDate(date);
  const at = new Date(Date.UTC(y, m - 1, d));
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone: "UTC" }).format(at);
  return { weekday: f({ weekday: "short" }), day: f({ day: "numeric" }), month: f({ month: "short" }) };
}
