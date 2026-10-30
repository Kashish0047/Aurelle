import { z } from "zod";
import { imageUrl, minutes, money, optionalText, slug, text, uuid } from "../fields";

/** Shared by the forms (instant feedback) and the server actions (the real check). */

export const categorySchema = z.object({
  name: text("a category name", 60),
  slug,
});
export type CategoryValues = z.input<typeof categorySchema>;

export const serviceSchema = z.object({
  name: text("a service name", 80),
  slug,
  category_id: z.string().pipe(uuid.or(z.literal(""))).refine((v) => v !== "", "Please choose a category."),
  description: optionalText("the description", 400),
  price: money,
  price_from: z.boolean(),
  duration_min: minutes,
  image_url: imageUrl,
  image_alt: optionalText("the photo description", 160),
  is_popular: z.boolean(),
  is_published: z.boolean(),
});
export type ServiceValues = z.input<typeof serviceSchema>;

export const packageSchema = z.object({
  name: text("a package name", 80),
  tagline: optionalText("the tagline", 80),
  description: optionalText("the description", 600),
  price: money,
  price_from: z.boolean(),
  price_note: optionalText("the price note", 80),
  features: z
    .array(z.object({ value: text("this line", 120) }))
    .max(12, "Up to 12 lines, please."),
  cta_label: text("the button text", 30),
  image_url: imageUrl,
  is_highlighted: z.boolean(),
  is_published: z.boolean(),
});
export type PackageValues = z.input<typeof packageSchema>;
