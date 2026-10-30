/**
 * Shared types for every config file.
 * If a config value is wrong (typo in a theme name, missing price, bad weekday),
 * TypeScript flags it immediately — that is the whole point of this file.
 */

/* ------------------------------------------------------------------ */
/* Common                                                              */
/* ------------------------------------------------------------------ */

/** Any image used by the site. `src` is relative to /public, e.g. "/images/hero.jpg". */
export interface ImageAsset {
  src: string;
  alt: string;
}

export interface LinkItem {
  label: string;
  href: string;
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

export type ThemePresetName = "blush" | "noir-gold" | "sage" | "lavender";

export interface ThemePreset {
  label: string;
  /** Tells the browser how to render form controls & scrollbars. */
  scheme: "light" | "dark";
  colors: {
    /** Page background */
    bg: string;
    /** Alternate section background */
    bgAlt: string;
    /** Cards, inputs */
    surface: string;
    /** Main text */
    text: string;
    /** Secondary text (must still pass AA contrast on bg) */
    textMuted: string;
    /** Brand accent (buttons, highlights) */
    accent: string;
    /** Text colour placed on top of `accent` */
    accentContrast: string;
    /** Champagne / metallic highlight */
    gold: string;
    /** Hairline borders */
    line: string;
    /** Soft glow used in background gradients */
    glow: string;
  };
}

/* ------------------------------------------------------------------ */
/* Site                                                                */
/* ------------------------------------------------------------------ */

export type HeroVariant = "3d-scene" | "image" | "video";

/** Procedural 3D products. The hero shows the first; the services scene morphs through all of them in order. */
export type HeroSceneObject = "lipstick" | "compact" | "brush" | "serum";

/**
 * Reflections for the 3D scene:
 *  - "procedural": soft studio light baked in code — no download (recommended)
 *  - a drei preset: downloads a ~1–2 MB HDR photo from the pmndrs CDN on each visit
 */
export type HeroSceneEnvironment =
  | "procedural"
  | "apartment"
  | "city"
  | "dawn"
  | "forest"
  | "lobby"
  | "night"
  | "park"
  | "studio"
  | "sunset"
  | "warehouse";

export interface HeroSceneConfig {
  /** At least one object. Order = morph order in the services section. */
  objects: [HeroSceneObject, ...HeroSceneObject[]];
  /** Lipstick bullet, powder, brush handle, serum liquid */
  primaryColor: string;
  /** Gold / metal parts (casings, rims, ferrule, collar) */
  accentColor: string;
  /** The liquid pearl blob behind the object; also used for brush bristles */
  blobColor: string;
  /**
   * Services scene: the product's primary tint follows the category of the cards in view.
   * Keys are category ids from services.config.ts; missing categories use `primaryColor`.
   */
  categoryTints: Record<string, string>;
  /** Max rotation toward the pointer, in degrees (each axis). */
  mouseRange: number;
  /** 0–1: how far the pearl blob drifts toward the pointer. */
  blobFollow: number;
  /** Multiplies every light (1 = default). */
  lightIntensity: number;
  /** 0–1: iridescent sheen on metal and the blob. */
  iridescence: number;
  keyLightColor: string;
  rimLightColor: string;
  environment: HeroSceneEnvironment;
  /** Shown instead of the 3D on phones (unless features.mobile3d) and for reduced motion. */
  fallbackImage: ImageAsset;
}

/** Every toggleable section. Hero, navbar and footer are always on. */
export type SectionKey =
  | "marquee"
  | "about"
  | "services"
  | "process"
  | "gallery"
  | "team"
  | "packages"
  | "testimonials"
  | "offers"
  | "booking"
  | "faq";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "pinterest"
  | "tiktok"
  | "x"
  | "linkedin";

export interface NavItem {
  label: string;
  /** The section this link scrolls to. Hidden automatically if that section is disabled. */
  section: SectionKey;
}

export interface SiteConfig {
  /** Short brand name used in the wordmark, e.g. "Aurelle" */
  name: string;
  /** Legal / full name used in SEO & schema, e.g. "Aurelle Beauty Studio" */
  fullName: string;
  tagline: string;
  description: string;
  /**
   * Optional logo image (SVG/PNG in /public). When `null`, the text wordmark (`name`)
   * is rendered in the serif font instead — which looks great for most salons.
   */
  logo: (ImageAsset & { width: number; height: number }) | null;
  /** Production URL, no trailing slash. Can be overridden by NEXT_PUBLIC_SITE_URL. */
  url: string;
  /** BCP-47 locale for number/date formatting, e.g. "en-IN" */
  locale: string;
  /** ISO 4217 currency, e.g. "INR" */
  currency: string;

  theme: ThemePresetName;
  heroVariant: HeroVariant;
  /** The 3D hero / services scene (used when heroVariant is "3d-scene"). */
  heroScene: HeroSceneConfig;

  /** Turn whole sections on/off per client. */
  sections: Record<SectionKey, boolean>;

  features: {
    /** Intro wordmark animation, once per session */
    preloader: boolean;
    /** Custom cursor on desktop (never shown on touch devices) */
    customCursor: boolean;
    /** Film-grain texture overlay */
    grain: boolean;
    /** Lenis smooth scrolling (auto-disabled for reduced motion) */
    smoothScroll: boolean;
    /** Floating WhatsApp button */
    whatsappButton: boolean;
    /**
     * Render the (lite) 3D scene on phones too. Off by default: phones get
     * `heroScene.fallbackImage` and never download three.js (~1 MB), keeping mobile scores high.
     */
    mobile3d: boolean;
  };

  nav: NavItem[];
  /** Label of the always-visible CTA in the navbar */
  bookCtaLabel: string;

  rating: {
    value: number;
    count: number;
    source: string;
    url?: string;
  } | null;

  contact: {
    /** Display format, e.g. "+91 98765 43210" */
    phone: string;
    /** International digits only, no "+", e.g. "919876543210" */
    whatsapp: string;
    /** Pre-filled text for the floating WhatsApp button */
    whatsappMessage: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    };
    /** "Embed a map" src URL from Google Maps → Share → Embed a map */
    mapsEmbedUrl: string;
    /** Normal Google Maps link for "Get directions" */
    mapsLink: string;
    geo?: { lat: number; lng: number };
  };

  socials: { platform: SocialPlatform; url: string; label?: string }[];

  seo: {
    /** Browser tab title. "%s" is replaced by the page title on sub-pages. */
    titleTemplate: string;
    defaultTitle: string;
    keywords: string[];
    ogImage: ImageAsset;
    /** Price range shown in Google business schema, e.g. "₹₹" */
    priceRange: string;
  };

  /**
   * "supabase": content edited in /admin (falls back to the config files per table while Supabase
   * isn't connected or a table can't be read). "config": only the config files.
   */
  contentSource: "supabase" | "config";

  /** The /admin content panel (needs Supabase — see ADMIN-SETUP.md). */
  admin: {
    /** false = /admin does not exist (sell / deliver the template without the panel). */
    enabled: boolean;
    /** Also offer "email me a sign-in link" on the login page. */
    magicLink: boolean;
    /** Log the admin out after this many minutes without any admin page activity. */
    sessionTimeoutMinutes: number;
  };

  /** "Built by" credit in the footer. Set `show: false` to remove. */
  credit: {
    show: boolean;
    prefix: string;
    name: string;
    url: string;
  };
}

/* ------------------------------------------------------------------ */
/* Page content                                                        */
/* ------------------------------------------------------------------ */

export interface SectionHeading {
  eyebrow: string;
  title: string;
  intro?: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface ContentConfig {
  /** Small interface labels (translate these for non-English sites). */
  ui: {
    skipToContent: string;
    skipIntro: string;
    openMenu: string;
    closeMenu: string;
    primaryNav: string;
    closed: string;
    whatsapp: string;
    call: string;
    email: string;
    /** Appended to the rating count, e.g. "1,280 Google reviews" */
    reviews: string;
    /** Accessible label of the hero's circular scroll badge */
    scrollDown: string;
    /** Prefix for starting prices, e.g. "from ₹7,500" */
    from: string;
    close: string;
    previous: string;
    next: string;
    /** Custom-cursor label over gallery images */
    view: string;
    before: string;
    after: string;
    /** Accessible label of the before/after slider */
    compare: string;
    /** Tooltip / label of the floating WhatsApp button */
    chatOnWhatsApp: string;
  };
  preloader: {
    /** Small line shown under the wordmark */
    caption: string;
  };
  hero: {
    eyebrow: string;
    /** Each string is one line of the giant headline (revealed line by line). */
    headlineLines: string[];
    subheading: string;
    primaryCta: string;
    secondaryCta: string;
    scrollBadgeText: string;
    /** Used by heroVariant "image" and as the low-end/reduced-motion fallback. */
    image: ImageAsset;
    /** Used by heroVariant "video". Keep under ~3 MB, muted, looping. */
    video?: { src: string; poster: string };
  };
  marquee: string[];
  about: SectionHeading & {
    /** Long statement revealed word-by-word on scroll. */
    statement: string;
    body: string;
    image: ImageAsset;
    stats: Stat[];
  };
  services: SectionHeading & {
    allLabel: string;
    bookLabel: string;
    popularLabel: string;
    /** WhatsApp text used when the booking section is disabled. `{service}` is replaced. */
    whatsappMessage: string;
  };
  process: SectionHeading & { steps: { title: string; description: string }[] };
  gallery: SectionHeading;
  team: SectionHeading & { specialtyLabel: string };
  packages: SectionHeading & {
    /** Badge on the highlighted package */
    highlightLabel: string;
    /** WhatsApp text for "Enquire". `{package}` is replaced with the package name. */
    enquiryMessage: string;
  };
  testimonials: SectionHeading & { googleReviewsLabel: string };
  offers: {
    eyebrow: string;
    title: string;
    description: string;
    code?: string;
    /** ISO date-time. The whole banner hides itself once this date has passed. */
    endsAt: string;
    ctaLabel: string;
    /** Button link; defaults to the booking section (or WhatsApp when booking is off). */
    ctaHref?: string;
    endsInLabel: string;
    copyLabel: string;
    copiedLabel: string;
    units: { days: string; hours: string; minutes: string; seconds: string };
  };
  booking: SectionHeading & BookingCopy;
  faq: SectionHeading & {
    /** Small prompt under the heading, e.g. "Still curious?" */
    ctaText: string;
    ctaLabel: string;
  };
  footer: {
    headline: string;
    hoursTitle: string;
    visitTitle: string;
    followTitle: string;
    directionsLabel: string;
    copyright: string;
  };
}

/** All text used by the booking form, its messages and notifications. `{placeholders}` are filled in. */
export interface BookingCopy {
  steps: { services: string; date: string; time: string; details: string; confirm: string };
  stepTitles: { services: string; date: string; time: string; details: string; confirm: string };
  /** "{max}" = maxServicesPerBooking */
  maxServicesNote: string;
  moreDates: string;
  next: string;
  back: string;
  edit: string;
  submit: string;
  submitting: string;
  fields: {
    name: string;
    phone: string;
    notes: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    notesPlaceholder: string;
  };
  summary: {
    title: string;
    services: string;
    date: string;
    time: string;
    duration: string;
    total: string;
    empty: string;
  };
  slots: {
    loading: string;
    none: string;
    full: string;
    /** "{count}" = seats left */
    left: string;
    error: string;
    retry: string;
  };
  errors: {
    services: string;
    tooManyServices: string;
    date: string;
    time: string;
    name: string;
    phone: string;
    notes: string;
    slotFull: string;
    rateLimited: string;
    generic: string;
  };
  success: {
    confirmedTitle: string;
    confirmedText: string;
    requestedTitle: string;
    requestedText: string;
    sendTitle: string;
    sendText: string;
    sendCta: string;
    reference: string;
    addToCalendar: string;
    whatsappCta: string;
    bookAnother: string;
  };
  /** Labels used in the owner notification (email / sheet / WhatsApp / webhook text). */
  message: {
    heading: string;
    reference: string;
    name: string;
    phone: string;
    services: string;
    date: string;
    time: string;
    duration: string;
    total: string;
    notes: string;
  };
  /** Calendar event title. "{services}" and "{salon}" are filled in. */
  calendarTitle: string;
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export interface ServiceCategory {
  id: string;
  label: string;
}

export interface Service<C extends string = string> {
  /** Stable id, used to preselect the service in the booking form. */
  id: string;
  category: C;
  name: string;
  description: string;
  durationMinutes: number;
  /** In the major unit of `siteConfig.currency` (e.g. rupees). */
  price: number;
  /** Shows "from ₹X" instead of "₹X". */
  priceFrom?: boolean;
  image: ImageAsset;
  popular?: boolean;
}

/* ------------------------------------------------------------------ */
/* Team / Gallery / Testimonials / Packages / FAQ                      */
/* ------------------------------------------------------------------ */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: ImageAsset;
  instagram?: string;
}

export type GallerySize = "tall" | "wide" | "square";

export type GalleryItem =
  | {
      type: "image";
      id: string;
      image: ImageAsset;
      caption?: string;
      size: GallerySize;
    }
  | {
      type: "before-after";
      id: string;
      before: ImageAsset;
      after: ImageAsset;
      caption: string;
      size: GallerySize;
    };

export interface Testimonial {
  id: string;
  name: string;
  location?: string;
  service?: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface Package {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceFrom?: boolean;
  priceNote?: string;
  features: string[];
  /** The featured (middle) card. */
  highlighted?: boolean;
  ctaLabel: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/* ------------------------------------------------------------------ */
/* Booking                                                             */
/* ------------------------------------------------------------------ */

/**
 * Available booking back-ends (see src/lib/booking/providers).
 * To add one (e.g. "supabase"): add its name here, create the provider file, register it in
 * providers/index.ts. No component changes needed.
 */
export type BookingProviderName = "google-sheets" | "supabase" | "email" | "whatsapp-link" | "webhook";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** 24h "HH:mm" */
export type TimeString = `${number}:${number}`;

export interface OpeningWindow {
  open: TimeString;
  close: TimeString;
}

export interface BookingConfig {
  /** Default provider. BOOKING_PROVIDER env var overrides it. */
  provider: BookingProviderName;
  /**
   * What customers are told after booking:
   *  - "instant": "You're booked!" — only for providers that can read bookings back
   *    (google-sheets, supabase), because only they can guarantee the slot is really free.
   *  - "manual":  "Request received, we'll confirm on WhatsApp" — the salon confirms by hand.
   * If "instant" is set but the provider can't read bookings, the site falls back to "manual".
   */
  confirmationMode: "instant" | "manual";
  /** IANA timezone of the salon, e.g. "Asia/Kolkata" */
  timezone: string;
  /** Length of each bookable slot in minutes */
  slotMinutes: number;
  /** `null` = closed that day */
  weeklyHours: Record<Weekday, OpeningWindow | null>;
  /** Unbookable ranges applied every open day (lunch etc.) */
  breaks: { start: TimeString; end: TimeString; label?: string }[];
  /** "YYYY-MM-DD" dates the salon is closed */
  holidays: string[];
  /** Same-day bookings must be at least this many minutes from now */
  sameDayCutoffMinutes: number;
  /** How many days ahead customers can book */
  bookingWindowDays: number;
  /** Max parallel bookings per slot (enforced where the provider can check) */
  maxBookingsPerSlot: number;
  /** Max services in one booking */
  maxServicesPerBooking: number;
}
