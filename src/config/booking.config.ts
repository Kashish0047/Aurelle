import type { BookingConfig } from "./types";

/**
 * Booking rules. Time slots in the form are generated from these values,
 * and the footer's opening hours are read from `weeklyHours` too.
 */
export const bookingConfig: BookingConfig = {
  // "whatsapp-link" works with zero setup. Options: "google-sheets" | "supabase" | "email" |
  // "whatsapp-link" | "webhook". See README → "Booking providers".
  provider: "whatsapp-link",
  // "instant" only works with "google-sheets" or "supabase" (they can check free seats).
  // Everything else: "manual".
  confirmationMode: "manual",
  timezone: "Asia/Kolkata",
  slotMinutes: 30,

  weeklyHours: {
    mon: null, // closed
    tue: { open: "10:00", close: "20:00" },
    wed: { open: "10:00", close: "20:00" },
    thu: { open: "10:00", close: "20:00" },
    fri: { open: "10:00", close: "21:00" },
    sat: { open: "09:00", close: "21:00" },
    sun: { open: "10:00", close: "18:00" },
  },

  breaks: [{ start: "14:00", end: "14:30", label: "Lunch" }],

  holidays: ["2026-11-08", "2026-12-25", "2027-01-01"],

  sameDayCutoffMinutes: 90,
  bookingWindowDays: 45,
  maxBookingsPerSlot: 2,
  maxServicesPerBooking: 3,
};
