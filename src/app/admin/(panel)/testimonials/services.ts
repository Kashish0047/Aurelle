import "server-only";
import type { AdminSession } from "@/lib/admin/auth";

/** Service names, offered as suggestions in the review form. */
export async function serviceNameSuggestions({ supabase }: AdminSession): Promise<string[]> {
  const { data } = await supabase.from("services").select("name").order("sort_order");
  return [...new Set((data ?? []).map((s) => s.name as string))];
}
