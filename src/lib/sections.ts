import { siteConfig } from "@/config/site.config";
import type { NavItem, SectionKey } from "@/config/types";

/** Which sections are on (siteConfig.sections, or the admin settings via useSiteContent()). */
export type SectionFlags = Record<SectionKey, boolean>;

/** DOM id of the hero, used by the logo link. */
export const TOP_ID = "top";

export function isSectionEnabled(key: SectionKey, sections: SectionFlags = siteConfig.sections): boolean {
  return sections[key];
}

/** Anchor href for a section; every section component uses its key as its id. */
export function sectionHref(key: SectionKey): string {
  return `#${key}`;
}

/** Nav items whose target section is switched on. */
export function getNavItems(sections: SectionFlags = siteConfig.sections): NavItem[] {
  return siteConfig.nav.filter((item) => isSectionEnabled(item.section, sections));
}

/** Where every "Book" CTA points. Falls back to WhatsApp if the booking section is off. */
export function getBookingHref(whatsappHref: string, sections: SectionFlags = siteConfig.sections): string {
  return isSectionEnabled("booking", sections) ? sectionHref("booking") : whatsappHref;
}

/** Page order of the toggleable sections (hero is always first). */
export const SECTION_ORDER: SectionKey[] = [
  "marquee",
  "about",
  "services",
  "process",
  "gallery",
  "team",
  "packages",
  "testimonials",
  "offers",
  "booking",
  "faq",
];

/** Target of the hero's scroll badge: the first enabled content section (the marquee is skipped). */
export function getFirstSectionHref(sections: SectionFlags = siteConfig.sections): string {
  const first = SECTION_ORDER.find((key) => key !== "marquee" && isSectionEnabled(key, sections));
  return first ? sectionHref(first) : "#contact";
}

/**
 * Sections hydrated lazily, when scrolled near (see components/sections/DeferredSections.tsx).
 * Never add a section with a pinned scroll scene (about, services) or the booking form here.
 */
export const DEFERRED_SECTIONS = ["process", "gallery", "team", "packages", "testimonials", "offers", "faq"] as const;
export type DeferredSectionKey = (typeof DEFERRED_SECTIONS)[number];

export function isDeferredSection(key: SectionKey): key is DeferredSectionKey {
  return (DEFERRED_SECTIONS as readonly SectionKey[]).includes(key);
}
