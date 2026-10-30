import { bookingConfig } from "@/config/booking.config";
import type { BookingConfig } from "@/config/types";
import { addDays, fromMinutes, toMinutes, weekdayOf, zonedNow } from "./time";

/**
 * Slot rules, all driven by the booking rules (booking.config.ts, with the opening hours,
 * breaks and closed days from the admin settings applied — see lib/content). Shared by the form
 * (to draw the calendar) and the API (to reject tampered requests), so both always agree.
 */

export type SalonNow = { date: string; minutes: number };

export const salonNow = (): SalonNow => zonedNow(bookingConfig.timezone);

/** Inside the booking window, not a holiday, not a closed weekday. */
export function isDateOpen(date: string, now: SalonNow = salonNow(), rules: BookingConfig = bookingConfig): boolean {
  const last = addDays(now.date, rules.bookingWindowDays - 1);
  if (date < now.date || date > last) return false;
  if (rules.holidays.includes(date)) return false;
  return rules.weeklyHours[weekdayOf(date)] !== null;
}

/**
 * Start times ("HH:mm") on `date` that can fit an appointment of `durationMinutes`.
 * Excludes: slots starting inside a break, slots that would run past closing,
 * and same-day slots earlier than now + sameDayCutoffMinutes.
 */
export function getSlotsForDate(
  date: string,
  durationMinutes: number = bookingConfig.slotMinutes,
  now: SalonNow = salonNow(),
  rules: BookingConfig = bookingConfig,
): string[] {
  if (!isDateOpen(date, now, rules)) return [];
  const hours = rules.weeklyHours[weekdayOf(date)];
  if (!hours) return [];

  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const length = Math.max(rules.slotMinutes, durationMinutes);
  const earliest = date === now.date ? now.minutes + rules.sameDayCutoffMinutes : -Infinity;
  const breaks = rules.breaks.map((b) => [toMinutes(b.start), toMinutes(b.end)] as const);

  const slots: string[] = [];
  for (let t = open; t + length <= close; t += rules.slotMinutes) {
    if (t < earliest) continue;
    if (breaks.some(([start, end]) => t >= start && t < end)) continue;
    slots.push(fromMinutes(t));
  }
  return slots;
}

/** Every date in the booking window that still has at least one slot. */
export function getBookableDates(now: SalonNow = salonNow(), rules: BookingConfig = bookingConfig): string[] {
  const dates: string[] = [];
  for (let i = 0; i < rules.bookingWindowDays; i++) {
    const date = addDays(now.date, i);
    if (getSlotsForDate(date, rules.slotMinutes, now, rules).length > 0) dates.push(date);
  }
  return dates;
}
