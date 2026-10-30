import { contentConfig } from "@/config/content.config";
import { services } from "@/config/services.config";
import { siteConfig } from "@/config/site.config";
import type { Service } from "@/config/types";
import { formatDuration, formatPrice, formatTime } from "@/lib/format";
import { formatDateLong } from "./time";
import type { BookedService, BookingRecord } from "./types";

const byId = (catalog: Service[]) => new Map(catalog.map((s) => [s.id, s]));

/**
 * Looks up services by id (unknown ids are dropped — never trust client input).
 * `catalog`: the live service list (useSiteContent / getSiteContent); config by default.
 */
export function resolveServices(ids: string[], catalog: Service[] = services): BookedService[] {
  const serviceById = byId(catalog);
  return ids.flatMap((id) => {
    const s = serviceById.get(id);
    return s ? [{ id: s.id, name: s.name, price: s.price, durationMinutes: s.durationMinutes }] : [];
  });
}

export function totals(list: BookedService[]) {
  return {
    totalPrice: list.reduce((sum, s) => sum + s.price, 0),
    totalMinutes: list.reduce((sum, s) => sum + s.durationMinutes, 0),
  };
}

/** True if any selected service shows a "from" price, so the total is an estimate. */
export function hasFromPrice(ids: string[], catalog: Service[] = services): boolean {
  const serviceById = byId(catalog);
  return ids.some((id) => serviceById.get(id)?.priceFrom);
}

/**
 * Plain-text summary used for every owner notification (WhatsApp, email, webhook, sheet note).
 * Labels come from content.config → booking.message.
 */
export function formatBookingText(b: BookingRecord, salonName: string = siteConfig.name, catalog: Service[] = services): string {
  const m = contentConfig.booking.message;
  const lines = [
    `${m.heading} · ${salonName}`,
    `${m.reference}: ${b.id}`,
    `${m.name}: ${b.name}`,
    `${m.phone}: ${b.phone}`,
    `${m.services}: ${b.services.map((s) => s.name).join(", ")}`,
    `${m.date}: ${formatDateLong(b.date, siteConfig.locale)}`,
    `${m.time}: ${formatTime(b.time)}`,
    `${m.duration}: ${formatDuration(b.totalMinutes)}`,
    `${m.total}: ${formatPrice(b.totalPrice, hasFromPrice(b.services.map((s) => s.id), catalog))}`,
  ];
  if (b.notes) lines.push(`${m.notes}: ${b.notes}`);
  return lines.join("\n");
}
