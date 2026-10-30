import { z } from "zod";
import { ctaLink, httpsUrl, imageUrl, localDateTime, optionalText, requiredImageUrl, text } from "../fields";

/** Shared by the admin forms (instant feedback) and the server actions (the real check). */

export const offerSchema = z
  .object({
    title: text("a title", 120),
    subtitle: optionalText("the description", 300),
    discount_text: optionalText("the small label", 40),
    code: optionalText("the code", 30),
    cta_label: optionalText("the button text", 30),
    cta_link: ctaLink,
    image_url: imageUrl,
    start_date: localDateTime,
    end_date: localDateTime,
    is_active: z.boolean(),
    show_countdown: z.boolean(),
  })
  .refine((o) => o.end_date > o.start_date, { path: ["end_date"], message: "The end must be after the start." });
export type OfferValues = z.input<typeof offerSchema>;

export const galleryItemSchema = z.object({
  title: optionalText("the caption", 120),
  category: optionalText("the category", 40),
  size: z.enum(["tall", "square", "wide"]),
  image_url: requiredImageUrl,
  image_alt: optionalText("the photo description", 160),
  before_image_url: imageUrl,
  is_published: z.boolean(),
});
export type GalleryItemValues = z.input<typeof galleryItemSchema>;

export const galleryUploadSchema = z.object({
  urls: z.array(requiredImageUrl).min(1, "Please choose at least one photo.").max(20, "Up to 20 photos at a time."),
});

export const testimonialSchema = z.object({
  name: text("the client's name", 80),
  location: optionalText("the area", 60),
  service: optionalText("the service", 80),
  text: text("the review", 800),
  rating: z.number().int().min(1, "Choose 1 to 5 stars.").max(5, "Choose 1 to 5 stars."),
  photo_url: imageUrl,
  is_published: z.boolean(),
});
export type TestimonialValues = z.input<typeof testimonialSchema>;

export const teamMemberSchema = z.object({
  name: text("a name", 80),
  role: optionalText("the role", 80),
  specialty: optionalText("the speciality", 80),
  photo_url: imageUrl,
  photo_alt: optionalText("the photo description", 160),
  instagram_url: httpsUrl,
  is_published: z.boolean(),
});
export type TeamMemberValues = z.input<typeof teamMemberSchema>;

export const faqSchema = z.object({
  question: text("a question", 200),
  answer: text("an answer", 1500),
  is_published: z.boolean(),
});
export type FaqValues = z.input<typeof faqSchema>;
