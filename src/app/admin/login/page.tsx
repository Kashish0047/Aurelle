import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { siteConfig } from "@/config/site.config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Wordmark } from "@/components/ui/Wordmark";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in" };

const REASONS: Record<string, string> = {
  timeout: "You were signed out after a period of inactivity. Please sign in again.",
  link: "That sign-in link has expired or was already used. Please request a new one.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  // Already signed in as an admin → straight to the dashboard. (A signed-in non-admin stays here.)
  if (await getAdminSession()) redirect("/admin");
  const { reason } = await searchParams;
  const message = reason ? REASONS[reason] : undefined;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg-alt px-4 py-12">
      <div className="w-full max-w-sm rounded-[1.75rem] border border-line bg-surface p-8 shadow-[0_30px_80px_-40px_var(--glow)]">
        <Wordmark />
        <h1 className="mt-6 font-serif text-3xl">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted">Manage your website content and bookings.</p>

        {message && (
          <p role="status" className="mt-6 rounded-xl border border-line bg-bg-alt px-4 py-3 text-sm">
            {message}
          </p>
        )}

        <div className="mt-8">
          {isSupabaseConfigured ? (
            <LoginForm magicLink={siteConfig.admin.magicLink} />
          ) : (
            <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
              The admin panel isn&apos;t connected yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see ADMIN-SETUP.md), then restart the site.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
