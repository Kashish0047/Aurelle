import { bookingConfig } from "@/config/booking.config";
import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { fill } from "@/lib/template";
import { formatBookingText } from "./summary";
import { zonedTimeToUtc } from "./time";
import type { BookingRecord } from "./types";

/** 20261114T060000Z */
const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** Escape per RFC 5545 */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Builds an .ics calendar file for the booking (times converted from the salon's timezone to UTC). */
export function buildIcs(b: BookingRecord): string {
  const start = zonedTimeToUtc(b.date, b.time, bookingConfig.timezone);
  const end = new Date(start.getTime() + b.totalMinutes * 60_000);
  const a = siteConfig.contact.address;
  const location = [a.line1, a.line2, `${a.city} ${a.postalCode}`].filter(Boolean).join(", ");
  const title = fill(contentConfig.booking.calendarTitle, {
    services: b.services.map((s) => s.name).join(" + "),
    salon: siteConfig.fullName,
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteConfig.name}//Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@${new URL(siteConfig.url).hostname}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(formatBookingText(b))}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Triggers a download of the .ics file in the browser. */
export function downloadIcs(b: BookingRecord) {
  const blob = new Blob([buildIcs(b)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${b.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
