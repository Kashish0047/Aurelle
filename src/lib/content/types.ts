import type {
  BookingConfig,
  ContentConfig,
  FaqItem,
  GalleryItem,
  Package,
  Service,
  ServiceCategory,
  SiteConfig,
  TeamMember,
  Testimonial,
} from "@/config/types";

/**
 * Everything the public website shows that the owner can edit in /admin, resolved once per
 * render on the server (database → config fallback) and handed to client sections via context.
 *
 * Shapes are exactly the config types, so sections don't care where the data came from.
 */
export interface SiteContent {
  /** siteConfig with business details, theme, logo, socials, sections and SEO applied. */
  site: SiteConfig;
  /** contentConfig with the hero text and the live offer applied. */
  content: ContentConfig;
  /** bookingConfig with opening hours, breaks and closed days applied. */
  booking: BookingConfig;
  serviceCategories: ServiceCategory[];
  services: Service[];
  packages: Package[];
  gallery: GalleryItem[];
  team: TeamMember[];
  testimonials: Testimonial[];
  faq: FaqItem[];
  /** Where each part came from, for debugging ("db" | "config"). Not shown to visitors. */
  source: Record<string, "db" | "config">;
}
