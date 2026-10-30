import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site.config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminSession {
  user: User;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}

/**
 * The current admin, or null. Verified on the server on every call:
 *  1. the session is validated with Supabase Auth (getUser — not just a cookie read), and
 *  2. the user must be listed in public.admins (checked by the database's is_admin()).
 * Cached per request, so layouts, pages and actions can all call it cheaply.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!siteConfig.admin.enabled || !isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return null;
  return { user, supabase };
});

/** For admin pages and server actions: returns the admin or redirects to the login page. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
