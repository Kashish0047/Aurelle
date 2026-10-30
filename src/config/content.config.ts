import type { ContentConfig } from "./types";

/**
 * All section copy (headlines, intros, button labels).
 * Lists of things (services, team, FAQ…) live in their own config files.
 */
export const contentConfig: ContentConfig = {
  ui: {
    skipToContent: "Skip to content",
    skipIntro: "Skip intro",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    primaryNav: "Primary",
    closed: "Closed",
    whatsapp: "WhatsApp",
    call: "Call",
    email: "Email",
    reviews: "reviews",
    scrollDown: "Scroll to the next section",
    from: "from",
    close: "Close",
    previous: "Previous",
    next: "Next",
    view: "View",
    before: "Before",
    after: "After",
    compare: "Drag to compare before and after",
    chatOnWhatsApp: "Chat on WhatsApp",
  },

  preloader: {
    caption: "Beauty Studio · Est. 2014",
  },

  hero: {
    eyebrow: "Beauty Studio · Mumbai",
    headlineLines: ["Where your", "glow finds", "its light."],
    subheading:
      "Skin rituals, couture hair colour and bridal artistry, crafted slowly in a calm, sunlit studio.",
    primaryCta: "Book Appointment",
    secondaryCta: "View Services",
    scrollBadgeText: "Scroll to explore · Scroll to explore · ",
    image: { src: "/images/hero.jpg", alt: "Soft light falling across a calm salon chair" },
    video: { src: "/videos/hero.mp4", poster: "/images/hero.jpg" },
  },

  marquee: [
    "Bridal Makeup",
    "Balayage",
    "Hydra Facials",
    "Gel Nails",
    "Keratin Rituals",
    "Brow Sculpting",
    "Aromatherapy Spa",
    "Lash Lifts",
  ],

  about: {
    eyebrow: "Our Story",
    title: "A slower kind of beauty",
    statement:
      "We believe beauty is not something you put on, it is something we help you uncover — with patient hands, honest advice and products that respect your skin.",
    body: "Founded in 2014 as a two-chair studio, Aurelle has grown into a team of twelve artists who still treat every appointment like a ritual. No rush, no upselling, just you leaving lighter than you came.",
    image: { src: "/images/about.jpg", alt: "Lash artist carefully applying extensions to a relaxed client" },
    stats: [
      { value: 12, suffix: "+", label: "Years of craft" },
      { value: 18, suffix: "k", label: "Happy clients" },
      { value: 60, suffix: "+", label: "Signature services" },
    ],
  },

  services: {
    eyebrow: "Services",
    title: "Rituals for every you",
    intro: "Transparent pricing, unhurried appointments. Pick a ritual and book it in one tap.",
    allLabel: "All",
    bookLabel: "Book this",
    popularLabel: "Popular",
    whatsappMessage: "Hi Aurelle! I'd like to book: {service}.",
  },

  process: {
    eyebrow: "Why Aurelle",
    title: "Your visit, beautifully simple",
    steps: [
      {
        title: "Consult",
        description: "A free 10-minute chat to understand your skin, hair and the look you love.",
      },
      {
        title: "Customise",
        description: "We tailor products and technique to you — never a one-size-fits-all menu.",
      },
      {
        title: "Create",
        description: "Certified artists, hospital-grade hygiene and premium, cruelty-free products.",
      },
      {
        title: "Care",
        description: "Leave with an at-home routine and a follow-up check-in a week later.",
      },
    ],
  },

  gallery: {
    eyebrow: "Lookbook",
    title: "Recent work",
    intro: "Real clients, real light. Tap any image to view it full screen.",
  },

  team: {
    eyebrow: "The Artists",
    title: "Hands you can trust",
    specialtyLabel: "Speciality",
  },

  packages: {
    eyebrow: "Packages",
    title: "Bridal & spa journeys",
    intro: "Curated bundles for your big day and your slow Sundays.",
    highlightLabel: "Most loved",
    enquiryMessage: "Hi Aurelle! I'd like to know more about the {package} package.",
  },

  testimonials: {
    eyebrow: "Kind Words",
    title: "Loved by our clients",
    googleReviewsLabel: "Read all reviews on Google",
  },

  offers: {
    eyebrow: "Festive Offer",
    title: "20% off all bridal trials",
    description: "Book a bridal trial this season and get 20% off, plus a complimentary hydrating facial.",
    code: "GLOW20",
    endsAt: "2026-12-31T23:59:59+05:30",
    ctaLabel: "Claim offer",
    endsInLabel: "Offer ends in",
    copyLabel: "Copy code",
    copiedLabel: "Copied!",
    units: { days: "Days", hours: "Hours", minutes: "Mins", seconds: "Secs" },
  },

  booking: {
    eyebrow: "Book Online",
    title: "Reserve your moment",
    intro: "Choose a service, pick a time, and we'll confirm on WhatsApp within the hour.",
    steps: { services: "Services", date: "Date", time: "Time", details: "Details", confirm: "Confirm" },
    stepTitles: {
      services: "What would you like?",
      date: "Pick a day",
      time: "Choose a time",
      details: "Your details",
      confirm: "Review & confirm",
    },
    maxServicesNote: "Choose up to {max} services.",
    moreDates: "Show more dates",
    next: "Continue",
    back: "Back",
    edit: "Edit",
    submit: "Confirm booking",
    submitting: "Booking…",
    fields: {
      name: "Full name",
      phone: "Mobile number",
      notes: "Notes (optional)",
      namePlaceholder: "Your name",
      phonePlaceholder: "98765 43210",
      notesPlaceholder: "Allergies, preferences, occasion…",
    },
    summary: {
      title: "Your booking",
      services: "Services",
      date: "Date",
      time: "Time",
      duration: "Duration",
      total: "Estimated total",
      empty: "Nothing selected yet",
    },
    slots: {
      loading: "Checking availability…",
      none: "No times left on this day. Please pick another date.",
      full: "Full",
      left: "{count} left",
      error: "We couldn't load the times.",
      retry: "Try again",
    },
    errors: {
      services: "Please choose at least one service.",
      tooManyServices: "You can book up to {max} services at once.",
      date: "Please pick a date.",
      time: "Please pick a time.",
      name: "Please enter your name.",
      phone: "Please enter a valid 10-digit Indian mobile number.",
      notes: "Notes can be up to 500 characters.",
      slotFull: "Sorry, that time was just taken. Please choose another.",
      rateLimited: "Too many attempts. Please wait a few minutes and try again.",
      generic: "Something went wrong. Please try again or message us on WhatsApp.",
    },
    success: {
      confirmedTitle: "You're booked!",
      confirmedText: "We can't wait to see you. Your booking details are below.",
      requestedTitle: "Request received",
      requestedText: "We'll confirm your appointment on WhatsApp shortly.",
      sendTitle: "One last tap",
      sendText: "Send us your booking on WhatsApp and we'll confirm it shortly.",
      sendCta: "Send on WhatsApp",
      reference: "Reference",
      addToCalendar: "Add to calendar",
      whatsappCta: "Message us on WhatsApp",
      bookAnother: "Book another appointment",
    },
    message: {
      heading: "New booking request",
      reference: "Ref",
      name: "Name",
      phone: "Phone",
      services: "Services",
      date: "Date",
      time: "Time",
      duration: "Duration",
      total: "Estimated total",
      notes: "Notes",
    },
    calendarTitle: "{services} at {salon}",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Good to know",
    ctaText: "Still curious? We usually reply within the hour.",
    ctaLabel: "Ask on WhatsApp",
  },

  footer: {
    headline: "Come as you are. Leave glowing.",
    hoursTitle: "Opening hours",
    visitTitle: "Visit us",
    followTitle: "Follow",
    directionsLabel: "Get directions",
    copyright: "All rights reserved.",
  },
};
