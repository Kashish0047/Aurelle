import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Magic-link landing: exchanges the one-time code for a session, then confirms the user is an
 * admin. Anyone else is signed straight back out.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const fail = NextResponse.redirect(new URL("/admin/login?reason=link", request.url));
  if (!code) return fail;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return fail;
  }
  return NextResponse.redirect(new URL("/admin", request.url));
}
