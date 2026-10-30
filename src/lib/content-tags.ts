/**
 * Cache tags for content the public site reads from the database (Phase E data layer).
 * Admin actions call updateTag() with these so the owner's edits show up within seconds.
 */
export const CONTENT_TAGS = {
  settings: "content:settings",
  services: "content:services",
  packages: "content:packages",
  offers: "content:offers",
  gallery: "content:gallery",
  testimonials: "content:testimonials",
  team: "content:team",
  faqs: "content:faqs",
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];
