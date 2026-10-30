/**
 * Public Supabase settings. These two are safe in the browser: the anon / publishable key can
 * only do what the database's row-level security allows (read published content).
 * The service-role key is NEVER read here — it lives only in server-only booking code.
 */
/**
 * Only the origin is kept ("https://xxxx.supabase.co"), so a URL pasted with an API path such as
 * ".../rest/v1/" still works. Exported for the server-side booking provider too.
 */
export function normalizeSupabaseUrl(raw: string | undefined): string {
  const value = raw?.trim() ?? "";
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

export const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
// Supabase's own Next.js snippet names it NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; both are accepted.
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
