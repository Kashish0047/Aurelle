import type { Package } from "./types";

/** Exactly one package should have `highlighted: true` — it becomes the featured middle card. */
export const packages: Package[] = [
  {
    id: "radiance",
    name: "Radiance",
    tagline: "Pre-wedding prep",
    price: 18000,
    priceNote: "3 sessions over 6 weeks",
    features: [
      "2 × Hydra Glow Facials",
      "Brow sculpt & lash lift",
      "Gel manicure & pedicure",
      "Personal skincare plan",
    ],
    ctaLabel: "Enquire",
  },
  {
    id: "aurelle-bride",
    name: "The Aurelle Bride",
    tagline: "Our signature bridal journey",
    price: 55000,
    priceFrom: true,
    priceNote: "Wedding day + trial",
    features: [
      "Bridal trial with senior artist",
      "HD airbrush wedding-day makeup",
      "Hairstyling & dupatta draping",
      "Pre-bridal facial & body polish",
      "Touch-up kit to take home",
    ],
    highlighted: true,
    ctaLabel: "Enquire",
  },
  {
    id: "slow-sunday",
    name: "Slow Sunday",
    tagline: "Half-day spa escape",
    price: 9500,
    priceNote: "Approx. 4 hours",
    features: [
      "Aromatherapy massage",
      "Silk body polish",
      "Hydrating facial",
      "Herbal tea & light bites",
    ],
    ctaLabel: "Enquire",
  },
];
