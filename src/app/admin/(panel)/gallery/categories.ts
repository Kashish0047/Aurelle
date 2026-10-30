import "server-only";
import type { AdminSession } from "@/lib/admin/auth";

/** Category suggestions: the ones already used in the gallery plus the service category names. */
export async function galleryCategorySuggestions({ supabase }: AdminSession): Promise<string[]> {
  const [{ data: used }, { data: cats }] = await Promise.all([
    supabase.from("gallery_items").select("category"),
    supabase.from("service_categories").select("name").order("sort_order"),
  ]);
  const all = [...(used ?? []).map((r) => r.category as string), ...(cats ?? []).map((c) => c.name as string)];
  return [...new Set(all.filter(Boolean))];
}
