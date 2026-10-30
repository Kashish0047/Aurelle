"use server";

import { bookingConfig } from "@/config/booking.config";
import { CONTENT_TAGS } from "@/lib/content-tags";
import { localInputToIso } from "@/lib/admin/datetime";
import type { ActionResult } from "@/lib/admin/result";
import { offerSchema } from "@/lib/admin/schemas/content";
import { saveRow } from "@/lib/admin/server";

/** Create (id = null) or update an offer. Dates arrive in the salon's local time. */
export async function saveOffer(id: string | null, input: unknown): Promise<ActionResult> {
  return saveRow({
    table: "offers",
    id,
    schema: offerSchema,
    input,
    toRow: (d) => ({
      ...d,
      start_date: localInputToIso(d.start_date, bookingConfig.timezone),
      end_date: localInputToIso(d.end_date, bookingConfig.timezone),
    }),
    imageColumns: ["image_url"],
    refresh: { tags: [CONTENT_TAGS.offers], paths: ["/admin/offers", "/admin"] },
  });
}
