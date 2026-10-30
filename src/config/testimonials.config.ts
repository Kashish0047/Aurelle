import type { Testimonial } from "./types";

/** Link to the salon's full Google reviews. Set to `null` to hide the link. */
export const googleReviewsUrl: string | null = "https://www.google.com/maps";

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Priya M.",
    location: "Bandra",
    service: "Bridal Makeup",
    quote:
      "I cried happy tears when I saw myself. The makeup lasted through a 14-hour wedding and still looked fresh in the last photos.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Sana K.",
    location: "Khar",
    service: "Balayage",
    quote:
      "Finally a colourist who listens. My balayage grew out so softly that I went four months without a touch-up.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Neha D.",
    location: "Juhu",
    service: "Hydra Glow Facial",
    quote:
      "The calmest hour of my month. My skin was glowing for a week and nobody tried to sell me ten products.",
    rating: 5,
  },
  {
    id: "t4",
    name: "Aditi S.",
    location: "Andheri",
    service: "Gel Manicure",
    quote: "Spotless hygiene, gorgeous studio and a manicure that genuinely lasted three weeks.",
    rating: 5,
  },
  {
    id: "t5",
    name: "Kavya R.",
    location: "Powai",
    service: "Bridal Trial",
    quote:
      "The trial took away all my wedding-day nerves. Ananya explained every step and adjusted until it felt like me.",
    rating: 5,
  },
];
