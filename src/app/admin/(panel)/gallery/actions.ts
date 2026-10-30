"use server";

import { CONTENT_TAGS } from "@/lib/content-tags";
import type { ActionResult } from "@/lib/admin/result";
import { galleryItemSchema, galleryUploadSchema } from "@/lib/admin/schemas/content";
import { adminMutation, deleteMedia, friendlyError, saveRow } from "@/lib/admin/server";

const refresh = { tags: [CONTENT_TAGS.gallery], paths: ["/admin/gallery", "/admin"] };

/** Create (id = null) or update one photo / before-after pair. */
export async function saveGalleryItem(id: string | null, input: unknown): Promise<ActionResult> {
  return saveRow({
    table: "gallery_items",
    id,
    schema: galleryItemSchema,
    input,
    imageColumns: ["image_url", "before_image_url"],
    refresh,
  });
}

/** Adds several already-uploaded photos at once (up to 20), at the end of the gallery. */
export async function createGalleryItems(input: unknown): Promise<ActionResult> {
  return adminMutation(
    galleryUploadSchema,
    input,
    async ({ urls }, session) => {
      const { data: last } = await session.supabase.from("gallery_items").select("sort_order").order("sort_order", { ascending: false }).limit(1);
      const start = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;
      const rows = urls.map((image_url, i) => ({ image_url: image_url!, sort_order: start + i, size: "square", is_published: true }));
      const { error } = await session.supabase.from("gallery_items").insert(rows);
      if (error) {
        await deleteMedia(session, urls);
        return { ok: false, error: friendlyError(error, "add gallery photos") };
      }
      return { ok: true };
    },
    refresh,
  );
}
