import { siteConfig } from "@/config/site.config";
import type { SiteConfig } from "@/config/types";

/** Builds a wa.me deep link. `phone` must be international digits only (e.g. "919876543210"). */
export function buildWhatsAppLink(message: string, phone: string = siteConfig.contact.whatsapp): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Default "chat with us" link used by the floating button, footer and nav fallbacks. */
export function getDefaultWhatsAppLink(site: SiteConfig = siteConfig): string {
  return buildWhatsAppLink(site.contact.whatsappMessage, site.contact.whatsapp);
}
