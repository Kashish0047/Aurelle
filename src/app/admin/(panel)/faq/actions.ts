"use server";

import { CONTENT_TAGS } from "@/lib/content-tags";
import type { ActionResult } from "@/lib/admin/result";
import { faqSchema } from "@/lib/admin/schemas/content";
import { saveRow } from "@/lib/admin/server";

/** Create (id = null) or update a question. */
export async function saveFaq(id: string | null, input: unknown): Promise<ActionResult> {
  return saveRow({
    table: "faqs",
    id,
    schema: faqSchema,
    input,
    refresh: { tags: [CONTENT_TAGS.faqs], paths: ["/admin/faq", "/admin"] },
  });
}
