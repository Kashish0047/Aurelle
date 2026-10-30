import { siteConfig } from "@/config/site.config";
import { BookingError, type BookingProvider } from "../types";
import { formatBookingText } from "../summary";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Emails each booking to the owner via Resend (https://resend.com, free tier is plenty).
 * Env: RESEND_API_KEY, BOOKING_EMAIL_TO, BOOKING_EMAIL_FROM (a sender on a verified domain,
 * or "onboarding@resend.dev" while testing).
 * Email can't be read back → getBookedCount returns null (status "requested").
 */
export function createEmailProvider(): BookingProvider {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_EMAIL_TO;
  const from = process.env.BOOKING_EMAIL_FROM;

  return {
    async createBooking(booking, salon) {
      if (!apiKey || !to || !from) {
        throw new BookingError("misconfigured", "RESEND_API_KEY, BOOKING_EMAIL_TO and BOOKING_EMAIL_FROM are required");
      }
      const text = formatBookingText(booking, salon?.name);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: to.split(",").map((s) => s.trim()),
          subject: `${siteConfig.name} · ${booking.id} · ${booking.name}`,
          text,
          html: `<pre style="font:15px/1.6 system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
        }),
      });
      if (!res.ok) throw new BookingError("provider_error", `Resend responded ${res.status}`);
      return { status: "requested" };
    },
    async getBookedCount() {
      return null;
    },
  };
}
