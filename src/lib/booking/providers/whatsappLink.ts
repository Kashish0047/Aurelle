import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatBookingText } from "../summary";
import type { BookingProvider } from "../types";

/**
 * Zero-setup provider: nothing is stored. The customer gets a wa.me link pre-filled with the
 * booking, sends it to the salon's WhatsApp, and the owner confirms by reply.
 * Can't read bookings back → getBookedCount returns null (slots unlimited, status "requested").
 */
export function createWhatsAppLinkProvider(): BookingProvider {
  return {
    async createBooking(booking, salon) {
      return { status: "requested", actionUrl: buildWhatsAppLink(formatBookingText(booking, salon?.name), salon?.whatsapp) };
    },
    async getBookedCount() {
      return null;
    },
  };
}
