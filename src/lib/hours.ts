import { bookingConfig } from "@/config/booking.config";
import type { BookingConfig, Weekday } from "@/config/types";
import { formatTime } from "./format";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DAY_LABELS: Record<Weekday, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export interface HoursRow {
  days: string;
  hours: string;
}

/**
 * Collapses weeklyHours into readable rows, grouping consecutive days with identical hours:
 * [{ days: "Tue – Thu", hours: "10 am – 8 pm" }, { days: "Mon", hours: "Closed" }]
 * Single source of truth: the footer never hardcodes hours.
 */
export function getOpeningHoursRows(
  closedLabel = "Closed",
  weeklyHours: BookingConfig["weeklyHours"] = bookingConfig.weeklyHours,
): HoursRow[] {
  const describe = (day: Weekday) => {
    const w = weeklyHours[day];
    return w ? `${formatTime(w.open)} – ${formatTime(w.close)}` : closedLabel;
  };

  const rows: HoursRow[] = [];
  let start = 0;
  for (let i = 1; i <= WEEKDAYS.length; i++) {
    const prev = WEEKDAYS[i - 1]!;
    const curr = WEEKDAYS[i];
    if (curr && describe(curr) === describe(prev)) continue;
    const first = WEEKDAYS[start]!;
    rows.push({
      days: first === prev ? DAY_LABELS[first] : `${DAY_LABELS[first]} – ${DAY_LABELS[prev]}`,
      hours: describe(prev),
    });
    start = i;
  }
  return rows;
}
