"use server";

import { CONTENT_TAGS } from "@/lib/content-tags";
import type { ActionResult } from "@/lib/admin/result";
import { categorySchema, serviceSchema } from "@/lib/admin/schemas/catalog";
import { adminMutation, deleteMedia, friendlyError } from "@/lib/admin/server";
import type { AdminSession } from "@/lib/admin/auth";

const refreshServices = { tags: [CONTENT_TAGS.services], paths: ["/admin/services", "/admin/services/categories", "/admin"] };

/** Next sort_order so new items appear at the end of the list. */
async function nextSortOrder(session: AdminSession, table: "services" | "service_categories" | "packages") {
  const { data } = await session.supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;
}

/** Create (id = null) or update a service. Deletes the old photo from Storage if it was replaced. */
export async function saveService(id: string | null, input: unknown): Promise<ActionResult> {
  return adminMutation(
    serviceSchema,
    input,
    async (data, session) => {
      if (id) {
        const { data: old } = await session.supabase.from("services").select("image_url").eq("id", id).maybeSingle();
        const { error } = await session.supabase.from("services").update(data).eq("id", id);
        if (error) return { ok: false, error: friendlyError(error, "update service") };
        if (old?.image_url && old.image_url !== data.image_url) await deleteMedia(session, [old.image_url]);
        return { ok: true, id };
      }
      const sort_order = await nextSortOrder(session, "services");
      const { data: row, error } = await session.supabase.from("services").insert({ ...data, sort_order }).select("id").single();
      if (error) return { ok: false, error: friendlyError(error, "create service") };
      return { ok: true, id: row.id as string };
    },
    refreshServices,
  );
}

/** Create (id = null) or rename a category. */
export async function saveCategory(id: string | null, input: unknown): Promise<ActionResult> {
  return adminMutation(
    categorySchema,
    input,
    async (data, session) => {
      if (id) {
        const { error } = await session.supabase.from("service_categories").update(data).eq("id", id);
        return error ? { ok: false, error: friendlyError(error, "update category") } : { ok: true, id };
      }
      const sort_order = await nextSortOrder(session, "service_categories");
      const { data: row, error } = await session.supabase
        .from("service_categories")
        .insert({ ...data, sort_order })
        .select("id")
        .single();
      return error ? { ok: false, error: friendlyError(error, "create category") } : { ok: true, id: row.id as string };
    },
    refreshServices,
  );
}
