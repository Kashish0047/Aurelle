import type { SiteConfig } from "./types";

/**
 * ─── START HERE ───────────────────────────────────────────────────────
 * The main business config. Changing values here re-brands the whole site.
 * Nothing in /components contains business text, so you never edit code.
 */
export const siteConfig: SiteConfig = {
  name: "Aurelle",
  fullName: "Aurelle Beauty Studio",
  tagline: "Skin, hair & bridal artistry",
  description:
    "Aurelle Beauty Studio is a calm, light-filled salon for skin rituals, hair colour, nails and bridal makeup. Book your appointment online in under a minute.",
  logo: null, // e.g. { src: "/images/logo.svg", alt: "Aurelle", width: 140, height: 40 }
  url: "https://aurelle.example.com",
  locale: "en-IN",
  currency: "INR",

  // "blush" | "noir-gold" | "sage" | "lavender"
  theme: "blush",

  // "3d-scene" (full experience) | "image" | "video" (lighter variants)
  heroVariant: "3d-scene",

  // The 3D products in the hero and services sections. Everything here is safe to change per client.
  heroScene: {
    objects: ["lipstick", "compact", "brush", "serum"], // hero shows the first; services morph through all
    primaryColor: "#B4495E", // lipstick, powder, brush handle, serum
    accentColor: "#D4AE72", // gold casings and rims
    blobColor: "#F2D3CB", // liquid pearl behind the product
    categoryTints: {
      hair: "#8E5A3C",
      skin: "#E3A08B",
      makeup: "#B4495E",
      nails: "#C25B7A",
      bridal: "#9E2F45",
      spa: "#7E9A82",
    },
    mouseRange: 15, // degrees the product turns toward the pointer
    blobFollow: 0.35, // 0–1, how far the pearl drifts toward the pointer
    lightIntensity: 1,
    iridescence: 0.4,
    keyLightColor: "#FFE1C2", // warm key light
    rimLightColor: "#F7C9D9", // soft pink rim light
    environment: "procedural", // or a drei preset: "studio" | "city" | "sunset" … (downloads an HDR file)
    fallbackImage: { src: "/images/hero-product.jpg", alt: "Gold lipstick and compact mirror in soft rose light" },
  },

  sections: {
    marquee: true,
    about: true,
    services: true,
    process: true,
    gallery: true,
    team: true,
    packages: true,
    testimonials: true,
    offers: true,
    booking: true,
    faq: true,
  },

  features: {
    preloader: true,
    customCursor: true,
    grain: true,
    smoothScroll: true,
    whatsappButton: true,
    mobile3d: false, // true = lite 3D on phones too (slower mobile load)
  },

  nav: [
    { label: "About", section: "about" },
    { label: "Services", section: "services" },
    { label: "Gallery", section: "gallery" },
    { label: "Packages", section: "packages" },
    { label: "Team", section: "team" },
    { label: "FAQ", section: "faq" },
  ],
  bookCtaLabel: "Book Now",

  rating: {
    value: 4.9,
    count: 1280,
    source: "Google",
    url: "https://www.google.com/maps",
  },

  contact: {
    phone: "+91 9215870786",
    whatsapp: "919215870786",
    whatsappMessage: "Hi Aurelle! I'd like to book an appointment.",
    email: "hello@aurelle.example.com",
    address: {
      line1: "14 Petal Lane, Ground Floor",
      line2: "Near Carter Road Promenade",
      city: "Mumbai",
      region: "Maharashtra",
      postalCode: "400050",
      country: "IN",
    },
    mapsEmbedUrl: "https://www.google.com/maps?q=Bandra+West,+Mumbai&output=embed",
    mapsLink: "https://maps.google.com/?q=Bandra+West,+Mumbai",
    geo: { lat: 19.0596, lng: 72.8295 },
  },

  socials: [
    { platform: "instagram", url: "https://instagram.com/" },
    { platform: "facebook", url: "https://facebook.com/" },
    { platform: "youtube", url: "https://youtube.com/" },
    { platform: "pinterest", url: "https://pinterest.com/" },
  ],

  seo: {
    titleTemplate: "%s · Aurelle Beauty Studio",
    defaultTitle: "Aurelle Beauty Studio — Skin, Hair & Bridal Makeup in Mumbai",
    keywords: [
      "beauty salon Mumbai",
      "bridal makeup artist",
      "hair colour",
      "facial",
      "spa",
      "nail art",
    ],
    ogImage: { src: "/images/og.jpg", alt: "Aurelle Beauty Studio interior bathed in warm light" },
    priceRange: "₹₹",
  },

  // Where the website reads its content:
  //   "supabase" = what the owner edits in /admin (falls back to these config files automatically
  //                while Supabase isn't connected, or if a table can't be read)
  //   "config"   = only these config files; the database is never read
  contentSource: "supabase",

  // Admin panel at /admin (requires Supabase; see ADMIN-SETUP.md)
  admin: {
    enabled: true,
    magicLink: false,
    sessionTimeoutMinutes: 60,
  },

  credit: {
    show: true,
    prefix: "Website by",
    name: "Your Studio Name",
    url: "https://example.com",
  },
};
