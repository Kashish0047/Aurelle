"use server";

import { CONTENT_TAGS } from "@/lib/content-tags";
import type { ActionResult } from "@/lib/admin/result";
import { settingsSchema } from "@/lib/admin/schemas/settings";
import { adminMutation, deleteMedia, friendlyError } from "@/lib/admin/server";
import { formToRow } from "@/lib/admin/settings";

/** Saves the single site_settings row (creates it if the seed was never run). */
export async function saveSettings(input: unknown): Promise<ActionResult> {
  return adminMutation(
    settingsSchema,
    input,
    async (data, session) => {
      const row = formToRow(data);
      const { data: old } = await session.supabase.from("site_settings").select("logo_url").eq("id", 1).maybeSingle();
      // Update the single row; create it only if it doesn't exist yet.
      const { data: updated, error } = old
        ? await session.supabase.from("site_settings").update(row).eq("id", 1).select("id")
        : await session.supabase.from("site_settings").insert(row).select("id");
      if (error || !updated?.length) return { ok: false, error: friendlyError(error, "save settings") };
      if (old?.logo_url && old.logo_url !== row.logo_url) await deleteMedia(session, [old.logo_url]);
      return { ok: true };
    },
    { tags: [CONTENT_TAGS.settings], paths: ["/admin/settings"] },
  );
}
