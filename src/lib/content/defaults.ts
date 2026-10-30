import { bookingConfig } from "@/config/booking.config";
import { contentConfig } from "@/config/content.config";
import { faq } from "@/config/faq.config";
import { gallery } from "@/config/gallery.config";
import { packages } from "@/config/packages.config";
import { serviceCategories, services } from "@/config/services.config";
import { siteConfig } from "@/config/site.config";
import { team } from "@/config/team.config";
import { testimonials } from "@/config/testimonials.config";
import type { SiteContent } from "./types";

/** The site exactly as the config files describe it: the fallback for every part of SiteContent. */
export function configContent(): SiteContent {
  return {
    site: siteConfig,
    content: contentConfig,
    booking: bookingConfig,
    serviceCategories: [...serviceCategories],
    services,
    packages,
    gallery,
    team,
    testimonials,
    faq,
    source: {},
  };
}
