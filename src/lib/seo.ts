import type { Weekday } from "@/config/types";
import { configContent } from "./content/defaults";
import type { SiteContent } from "./content/types";
import { siteUrl } from "./site-url";

const SCHEMA_DAY: Record<Weekday, string> = {
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
};

const absolute = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path}`);

/**
 * schema.org BeautySalon (a LocalBusiness) built from the site content (admin settings or config): name, address, geo,
 * phone, opening hours (from booking.config), socials and the service menu with prices.
 * Helps Google show the salon correctly in Search and Maps.
 *
 * Note: review stars are deliberately NOT included. Google ignores self-published ratings
 * for local businesses; real stars come from the salon's Google Business Profile.
 */
export function beautySalonJsonLd(c: SiteContent = configContent()) {
  const { site: siteConfig, booking: bookingConfig, content: contentConfig, services } = c;
  const { contact, seo } = siteConfig;
  const a = contact.address;

  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${siteUrl}/#salon`,
    name: siteConfig.fullName,
    description: siteConfig.description,
    url: siteUrl,
    image: [absolute(seo.ogImage.src), absolute(contentConfig.about.image.src)],
    ...(siteConfig.logo ? { logo: absolute(siteConfig.logo.src) } : {}),
    telephone: `+${contact.whatsapp}`,
    email: contact.email,
    priceRange: seo.priceRange,
    currenciesAccepted: siteConfig.currency,
    address: {
      "@type": "PostalAddress",
      streetAddress: [a.line1, a.line2].filter(Boolean).join(", "),
      addressLocality: a.city,
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    ...(contact.geo
      ? { geo: { "@type": "GeoCoordinates", latitude: contact.geo.lat, longitude: contact.geo.lng } }
      : {}),
    hasMap: contact.mapsLink,
    openingHoursSpecification: (Object.keys(bookingConfig.weeklyHours) as Weekday[]).flatMap((day) => {
      const hours = bookingConfig.weeklyHours[day];
      return hours ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAY[day], opens: hours.open, closes: hours.close }] : [];
    }),
    sameAs: siteConfig.socials.map((s) => s.url),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: contentConfig.services.title,
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        price: s.price,
        priceCurrency: siteConfig.currency,
        itemOffered: { "@type": "Service", name: s.name, description: s.description },
      })),
    },
  };
}

/** schema.org FAQPage from the FAQ list. */
export function faqJsonLd(faq: SiteContent["faq"] = configContent().faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Serialises JSON-LD safely for an inline <script> (no "</script>" break-out). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
