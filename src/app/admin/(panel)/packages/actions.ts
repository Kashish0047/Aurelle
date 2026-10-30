"use server";

import { CONTENT_TAGS } from "@/lib/content-tags";
import type { ActionResult } from "@/lib/admin/result";
import { packageSchema } from "@/lib/admin/schemas/catalog";
import { adminMutation, deleteMedia, friendlyError } from "@/lib/admin/server";

/**
 * Create (id = null) or update a package. Only one package can be "highlighted" (the featured
 * middle card), so highlighting one un-highlights the others.
 */
export async function savePackage(id: string | null, input: unknown): Promise<ActionResult> {
  return adminMutation(
    packageSchema,
    input,
    async (data, session) => {
      const row = { ...data, features: data.features.map((f) => f.value) };
      let savedId = id;

      if (id) {
        const { data: old } = await session.supabase.from("packages").select("image_url").eq("id", id).maybeSingle();
        const { error } = await session.supabase.from("packages").update(row).eq("id", id);
        if (error) return { ok: false, error: friendlyError(error, "update package") };
        if (old?.image_url && old.image_url !== row.image_url) await deleteMedia(session, [old.image_url]);
      } else {
        const { data: last } = await session.supabase.from("packages").select("sort_order").order("sort_order", { ascending: false }).limit(1);
        const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;
        const { data: created, error } = await session.supabase.from("packages").insert({ ...row, sort_order }).select("id").single();
        if (error) return { ok: false, error: friendlyError(error, "create package") };
        savedId = created.id as string;
      }

      if (row.is_highlighted && savedId) {
        await session.supabase.from("packages").update({ is_highlighted: false }).neq("id", savedId).eq("is_highlighted", true);
      }
      return { ok: true, id: savedId ?? undefined };
    },
    { tags: [CONTENT_TAGS.packages], paths: ["/admin/packages"] },
  );
}
