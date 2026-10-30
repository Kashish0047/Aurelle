import { BookingError, type BookingProvider } from "../types";
import { formatBookingText } from "../summary";

/**
 * POSTs each booking as JSON to any URL — Zapier, Make, n8n, a CRM, a custom server.
 * Env: BOOKING_WEBHOOK_URL (required), BOOKING_WEBHOOK_SECRET (optional, sent as
 * the "X-Booking-Secret" header so the receiver can verify the sender).
 * One-way → getBookedCount returns null (status "requested").
 */
export function createWebhookProvider(): BookingProvider {
  const url = process.env.BOOKING_WEBHOOK_URL;
  const secret = process.env.BOOKING_WEBHOOK_SECRET;

  return {
    async createBooking(booking, salon) {
      if (!url) throw new BookingError("misconfigured", "BOOKING_WEBHOOK_URL is required");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "X-Booking-Secret": secret } : {}),
        },
        body: JSON.stringify({ event: "booking.created", booking, text: formatBookingText(booking, salon?.name) }),
      });
      if (!res.ok) throw new BookingError("provider_error", `Webhook responded ${res.status}`);
      return { status: "requested" };
    },
    async getBookedCount() {
      return null;
    },
  };
}
