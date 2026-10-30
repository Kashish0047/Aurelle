import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import type { z } from "zod";
import type { ContentTag } from "@/lib/content-tags";
import { mediaPathFromUrl } from "./media";
import { requireAdmin, type AdminSession } from "./auth";
import type { ActionResult } from "./result";

type DbError = { code?: string; message?: string } | null;

/**
 * Turns database errors into plain-English messages for a non-technical owner.
 * The real error is logged on the server only.
 */
export function friendlyError(error: DbError, context = "save"): string {
  console.error(`[admin] ${context} failed:`, error);
  switch (error?.code) {
    case "23505":
      return "That name or link is already used by another item. Please choose a different one.";
    case "23503": // foreign key violation
    case "23001": // ON DELETE RESTRICT (e.g. a category that still has services)
      return "This item is still in use (for example, a category that still has services). Move or delete those first.";
    case "23514":
      return "One of the values isn't allowed. Please check the form and try again.";
    case "42501":
      return "You don't have permission to do that. Please sign in again.";
    default:
      return "Something went wrong and nothing was changed. Please try again.";
  }
}

/**
 * Runs an admin mutation safely:
 *  1. re-checks the session and admin membership on the server (never trusts the UI),
 *  2. validates the input with the same Zod schema the form used,
 *  3. runs the work and refreshes the affected public content + admin pages.
 */
export async function adminMutation<S extends z.ZodType>(
  schema: S,
  input: unknown,
  work: (data: z.output<S>, session: AdminSession) => Promise<ActionResult>,
  refresh: { tags: ContentTag[]; paths: string[] },
): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const result = await work(parsed.data, session);
  if (result.ok) revalidateContent(refresh.tags, refresh.paths);
  return result;
}

/** Expire public content caches (read-your-own-writes) and re-render the affected pages. */
export function revalidateContent(tags: ContentTag[], paths: string[]) {
  tags.forEach((tag) => updateTag(tag));
  revalidatePath("/", "layout");
  paths.forEach((p) => revalidatePath(p));
}

/** Deletes images from the site-media bucket. Ignores URLs that aren't ours (e.g. /images/… defaults). */
export async function deleteMedia(session: AdminSession, urls: (string | null | undefined)[]) {
  const paths = urls.map((u) => (u ? mediaPathFromUrl(u) : null)).filter((p): p is string => !!p);
  if (!paths.length) return;
  const { error } = await session.supabase.storage.from("site-media").remove(paths);
  if (error) console.error("[admin] could not delete media", paths, error);
}

type ContentTable = "offers" | "gallery_items" | "testimonials" | "team_members" | "faqs";

interface SaveRowOptions<S extends z.ZodType> {
  table: ContentTable;
  /** null = create */
  id: string | null;
  schema: S;
  input: unknown;
  /** Turn validated form values into database columns (default: as-is). */
  toRow?: (data: z.output<S>) => Record<string, unknown>;
  /** Columns holding uploaded images; replaced files are deleted from Storage on save. */
  imageColumns?: string[];
  refresh: { tags: ContentTag[]; paths: string[] };
}

/**
 * Create or update one content row (admin-checked + validated via adminMutation).
 * New rows go to the end of the list; replaced images are removed from Storage.
 */
export async function saveRow<S extends z.ZodType>(o: SaveRowOptions<S>): Promise<ActionResult> {
  return adminMutation(
    o.schema,
    o.input,
    async (data, session) => {
      const row = o.toRow ? o.toRow(data) : (data as Record<string, unknown>);
      const images = o.imageColumns ?? [];

      if (o.id) {
        let old: Record<string, string | null> = {};
        if (images.length) {
          const { data: before } = await session.supabase.from(o.table).select(images.join(", ")).eq("id", o.id).maybeSingle();
          old = (before ?? {}) as unknown as Record<string, string | null>;
        }
        const { error } = await session.supabase.from(o.table).update(row).eq("id", o.id);
        if (error) return { ok: false, error: friendlyError(error, `update ${o.table}`) };
        await deleteMedia(session, images.filter((c) => old[c] && old[c] !== row[c]).map((c) => old[c]));
        return { ok: true, id: o.id };
      }

      const { data: last } = await session.supabase.from(o.table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
      const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;
      const { data: created, error } = await session.supabase.from(o.table).insert({ ...row, sort_order }).select("id").single();
      if (error) return { ok: false, error: friendlyError(error, `create ${o.table}`) };
      return { ok: true, id: created.id as string };
    },
    o.refresh,
  );
}
