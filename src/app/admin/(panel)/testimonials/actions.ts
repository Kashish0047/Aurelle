"use server";

import { CONTENT_TAGS } from "@/lib/content-tags";
import type { ActionResult } from "@/lib/admin/result";
import { testimonialSchema } from "@/lib/admin/schemas/content";
import { saveRow } from "@/lib/admin/server";

/** Create (id = null) or update a client review. */
export async function saveTestimonial(id: string | null, input: unknown): Promise<ActionResult> {
  return saveRow({
    table: "testimonials",
    id,
    schema: testimonialSchema,
    input,
    imageColumns: ["photo_url"],
    refresh: { tags: [CONTENT_TAGS.testimonials], paths: ["/admin/testimonials", "/admin"] },
  });
}
