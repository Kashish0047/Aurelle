"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { siteConfig } from "@/config/site.config";
import { clientIp, rateLimit } from "@/lib/booking/rateLimit";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
  notice?: string;
}

/** One message for every failure, so nobody can probe which emails are admins. */
const GENERIC_ERROR = "That email and password don't match an admin account.";
const RATE_LIMITED = "Too many attempts. Please wait 15 minutes and try again.";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

/** 5 attempts per 15 minutes per IP (Supabase Auth adds its own limits on top). */
async function allowAttempt() {
  return rateLimit(`admin-login:${clientIp(await headers())}`, 5, 15 * 60_000);
}

/**
 * Email + password sign-in. Server actions are POST-only and Next.js rejects cross-site
 * requests (Origin/Host check), so this form is CSRF-safe without extra tokens.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!siteConfig.admin.enabled || !isSupabaseConfigured) return { error: GENERIC_ERROR };
  if (!(await allowAttempt())) return { error: RATE_LIMITED };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: GENERIC_ERROR };

  // The visitor always sees GENERIC_ERROR; the real reason goes to the server log only,
  // so whoever runs the site can fix setup problems without leaking anything to the browser.
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    console.warn(`[admin] login refused: ${error.message} (${error.code ?? error.status ?? "no code"})`);
    return { error: GENERIC_ERROR };
  }

  // A valid account that isn't an admin gets no session and the same message.
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    console.warn(
      adminError
        ? `[admin] login refused: could not check admin list (${adminError.message}). Were both migration files run?`
        : "[admin] login refused: password correct, but this user is not in public.admins (ADMIN-SETUP.md step 4).",
    );
    await supabase.auth.signOut();
    return { error: GENERIC_ERROR };
  }
  redirect("/admin");
}

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

/** Optional magic link (site.config → admin.magicLink). Never creates accounts. */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const sent: LoginState = { notice: "If that email belongs to an admin, a sign-in link is on its way." };
  if (!siteConfig.admin.enabled || !siteConfig.admin.magicLink || !isSupabaseConfigured) return sent;
  if (!(await allowAttempt())) return { error: RATE_LIMITED };

  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return sent;

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/admin/auth/callback` },
  });
  return sent; // same answer whether or not the email exists
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
