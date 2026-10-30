"use server";

import { z } from "zod";
import { CONTENT_TAGS, type ContentTag } from "@/lib/content-tags";
import { requireAdmin } from "./auth";
import type { ActionResult } from "./result";
import { deleteMedia, friendlyError, revalidateContent } from "./server";

/**
 * Shared list actions (reorder, publish/unpublish, delete) for every content table.
 * The table name comes from the browser, so it is checked against this whitelist; the
 * database's RLS policies and admin_reorder() check admin rights again on top.
 */
const TABLES = {
  service_categories: { tag: CONTENT_TAGS.services, path: "/admin/services/categories", images: [], publishColumn: null },
  services: { tag: CONTENT_TAGS.services, path: "/admin/services", images: ["image_url"], publishColumn: "is_published" },
  packages: { tag: CONTENT_TAGS.packages, path: "/admin/packages", images: ["image_url"], publishColumn: "is_published" },
  offers: { tag: CONTENT_TAGS.offers, path: "/admin/offers", images: ["image_url"], publishColumn: "is_active" },
  gallery_items: { tag: CONTENT_TAGS.gallery, path: "/admin/gallery", images: ["image_url", "before_image_url"], publishColumn: "is_published" },
  testimonials: { tag: CONTENT_TAGS.testimonials, path: "/admin/testimonials", images: ["photo_url"], publishColumn: "is_published" },
  team_members: { tag: CONTENT_TAGS.team, path: "/admin/team", images: ["photo_url"], publishColumn: "is_published" },
  faqs: { tag: CONTENT_TAGS.faqs, path: "/admin/faq", images: [], publishColumn: "is_published" },
} as const satisfies Record<string, { tag: ContentTag; path: string; images: readonly string[]; publishColumn: string | null }>;

export type AdminTable = keyof typeof TABLES;

const tableSchema = z.enum(Object.keys(TABLES) as [AdminTable, ...AdminTable[]]);
const idSchema = z.string().uuid();

function refresh(table: AdminTable) {
  const t = TABLES[table];
  revalidateContent([t.tag], [t.path]);
}

/** Saves a new drag-and-drop order (first id = top of the list). */
export async function reorderRows(table: AdminTable, ids: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z.object({ table: tableSchema, ids: z.array(idSchema).max(500) }).safeParse({ table, ids });
  if (!parsed.success) return { ok: false, error: "That order couldn't be saved. Please reload and try again." };
  const { error } = await supabase.rpc("admin_reorder", { p_table: parsed.data.table, p_ids: parsed.data.ids });
  if (error) return { ok: false, error: friendlyError(error, "reorder") };
  refresh(parsed.data.table);
  return { ok: true };
}

/** Show or hide an item on the website (offers use "active" instead of "published"). */
export async function setPublished(table: AdminTable, id: string, value: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = z.object({ table: tableSchema, id: idSchema, value: z.boolean() }).safeParse({ table, id, value });
  if (!parsed.success) return { ok: false, error: "That change couldn't be saved." };
  const column = TABLES[parsed.data.table].publishColumn;
  if (!column) return { ok: false, error: "This item can't be hidden." };
  const { error } = await supabase.from(parsed.data.table).update({ [column]: parsed.data.value }).eq("id", parsed.data.id);
  if (error) return { ok: false, error: friendlyError(error, "publish") };
  refresh(parsed.data.table);
  return { ok: true };
}

/** Deletes an item and its uploaded images from Storage. */
export async function deleteRow(table: AdminTable, id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = z.object({ table: tableSchema, id: idSchema }).safeParse({ table, id });
  if (!parsed.success) return { ok: false, error: "That item couldn't be deleted." };
  const t = TABLES[parsed.data.table];

  let urls: (string | null)[] = [];
  if (t.images.length) {
    const { data } = await session.supabase.from(parsed.data.table).select(t.images.join(", ")).eq("id", parsed.data.id).maybeSingle();
    const row = (data ?? {}) as unknown as Record<string, string | null>;
    urls = t.images.map((col) => row[col] ?? null);
  }

  const { error } = await session.supabase.from(parsed.data.table).delete().eq("id", parsed.data.id);
  if (error) return { ok: false, error: friendlyError(error, "delete") };
  await deleteMedia(session, urls);
  refresh(parsed.data.table);
  return { ok: true };
}
