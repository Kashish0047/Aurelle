/**
 * The booking contract. Everything a provider needs is in BookingRecord; everything the UI
 * needs back is in CreateBookingResult. Components never know which provider is active.
 */

export interface BookedService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

/** A validated, normalised booking ready to store or send. */
export interface BookingRecord {
  /** Short human-friendly reference, e.g. "AUR-7K3F9Q" */
  id: string;
  createdAt: string;
  services: BookedService[];
  totalPrice: number;
  totalMinutes: number;
  /** Salon-local "YYYY-MM-DD" */
  date: string;
  /** Salon-local "HH:mm" */
  time: string;
  name: string;
  /** E.164, e.g. "+919876543210" */
  phone: string;
  notes: string;
}

/**
 * "confirmed": the provider stored it and capacity was checked → the slot is truly reserved.
 * "requested": the salon must confirm manually (providers that cannot read bookings back).
 */
export type BookingStatus = "confirmed" | "requested";

export interface CreateBookingResult {
  status: BookingStatus;
  /** Optional link the customer must open to finish (whatsapp-link provider). */
  actionUrl?: string;
}

/**
 * Implement these two methods to add a back-end (Supabase, Airtable, a CRM…).
 *
 * - createBooking: persist/send the booking. Throw BookingError("slot_full") if the provider
 *   detects the slot filled up in the meantime.
 * - getBookedCount: how many bookings already exist for that date + time, or `null` if this
 *   provider cannot read bookings back. `null` means: treat the slot as unlimited and present
 *   the booking as a *request* the salon will confirm on WhatsApp.
 */
/** The salon's live name and WhatsApp number (admin settings), for notification texts and links. */
export interface SalonContact {
  name: string;
  whatsapp: string;
}

export interface BookingProvider {
  createBooking(booking: BookingRecord, salon?: SalonContact): Promise<CreateBookingResult>;
  getBookedCount(date: string, time: string): Promise<number | null>;
}

export type BookingErrorCode = "slot_full" | "misconfigured" | "provider_error";

export class BookingError extends Error {
  constructor(
    public readonly code: BookingErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "BookingError";
  }
}

/** Shape of /api/availability responses. */
export interface AvailabilityResponse {
  date: string;
  /** "request" when the provider can't count bookings (slots are then unlimited). */
  mode: "confirmed" | "request";
  slots: { time: string; available: boolean; remaining: number | null }[];
}

/** Shape of /api/book responses. */
export type BookResponse =
  | { ok: true; status: BookingStatus; booking: BookingRecord; actionUrl?: string }
  | { ok: false; error: "validation" | "slot_full" | "rate_limited" | "server_error" };
