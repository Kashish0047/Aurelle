import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { siteConfig } from "@/config/site.config";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/** Cookie holding the time of the admin's last request (idle-timeout clock). */
const SEEN_COOKIE = "admin_last_seen";
/** Admin pages reachable without a session. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/auth/callback"];

/**
 * Next.js 16 proxy (formerly "middleware"). Runs before every /admin and /api/admin request:
 *  - /admin disabled in site.config → 404
 *  - refreshes the Supabase session cookies
 *  - no session → /admin/login (pages) or 401 (API)
 *  - idle longer than admin.sessionTimeoutMinutes → signed out, back to login
 *  - always sends X-Robots-Tag: noindex
 * (Signed-in admins visiting /admin/login are forwarded to the dashboard by the login page itself.)
 * This is the first gate only. Every admin page, server action and route handler checks the
 * session AND admin membership again on the server (lib/admin/auth.ts), and the database's
 * row-level security enforces it a third time.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");

  if (!siteConfig.admin.enabled) return new NextResponse(null, { status: 404 });

  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isSupabaseConfigured) {
    // The login page explains how to finish setup; everything else stays closed.
    return isPublic ? withNoIndex(NextResponse.next()) : deny(request, isApi);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return isPublic ? withNoIndex(response) : deny(request, isApi, response);

  // Idle timeout: sign out if the last admin request was too long ago.
  const now = Date.now();
  const lastSeen = Number(request.cookies.get(SEEN_COOKIE)?.value ?? now);
  if (now - lastSeen > siteConfig.admin.sessionTimeoutMinutes * 60_000) {
    await supabase.auth.signOut();
    const expired = deny(request, isApi, response, "timeout");
    expired.cookies.delete(SEEN_COOKIE);
    return expired;
  }
  response.cookies.set(SEEN_COOKIE, String(now), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
  });

  // Note: no "signed in → skip login" redirect here. Whether the user is an *admin* is only known
  // on the server (database check), so the login page decides — otherwise a signed-in non-admin
  // would bounce between /admin and /admin/login forever.
  return withNoIndex(response);
}

/** Redirect to login (pages) or 401 (API), keeping any cookie changes Supabase made. */
function deny(request: NextRequest, isApi: boolean, from?: NextResponse, reason?: string) {
  const res = isApi
    ? NextResponse.json({ error: "unauthorized" }, { status: 401 })
    : NextResponse.redirect(new URL(`/admin/login${reason ? `?reason=${reason}` : ""}`, request.url));
  return withNoIndex(from ? copyCookies(from, res) : res);
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => to.cookies.set(c));
  return to;
}

function withNoIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
