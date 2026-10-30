import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * It acts as the logged-in user (session from cookies), so every query is filtered by RLS:
 * an admin gets admin rights, anyone else only public read access.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes
          // the session cookies on every admin request, so this is safe to ignore.
        }
      },
    },
  });
}
