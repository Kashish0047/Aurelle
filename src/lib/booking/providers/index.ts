import { bookingConfig } from "@/config/booking.config";
import type { BookingProviderName } from "@/config/types";
import type { BookingProvider } from "../types";
import { createEmailProvider } from "./email";
import { createGoogleSheetsProvider } from "./googleSheets";
import { createSupabaseProvider } from "./supabase";
import { createWebhookProvider } from "./webhook";
import { createWhatsAppLinkProvider } from "./whatsappLink";

/**
 * Provider registry (server-only). To add a back-end, write a factory returning
 * { createBooking, getBookedCount } and register it here.
 */
const registry: Record<BookingProviderName, () => BookingProvider> = {
  "google-sheets": createGoogleSheetsProvider,
  supabase: createSupabaseProvider,
  email: createEmailProvider,
  "whatsapp-link": createWhatsAppLinkProvider,
  webhook: createWebhookProvider,
};

/** The booking back-end in use: BOOKING_PROVIDER (env) if valid, else bookingConfig.provider. */
export function activeProviderName(): BookingProviderName {
  const fromEnv = process.env.BOOKING_PROVIDER?.trim();
  if (fromEnv && fromEnv in registry) return fromEnv as BookingProviderName;
  if (fromEnv) console.warn(`[booking] Unknown BOOKING_PROVIDER "${fromEnv}", using "${bookingConfig.provider}".`);
  return bookingConfig.provider;
}

let instance: BookingProvider | undefined;

/** The provider chosen by BOOKING_PROVIDER (env) or bookingConfig.provider. Created once per server. */
export function getBookingProvider(): BookingProvider {
  instance ??= registry[activeProviderName()]();
  return instance;
}
