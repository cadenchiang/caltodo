import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback route handler.
 * Exchanges the authorization code from the OAuth provider for a session.
 * New users (no integration_credentials) are redirected to onboarding.
 * Returning users are redirected to /app/inbox.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has integration credentials (returning user)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: creds } = await supabase
          .from("integration_credentials")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (creds) {
          redirectTo.pathname = "/app/inbox";
        } else {
          redirectTo.pathname = "/app/onboarding";
        }
      } else {
        redirectTo.pathname = "/app/inbox";
      }

      return NextResponse.redirect(redirectTo);
    }
  }

  // If code exchange fails, redirect to login
  redirectTo.pathname = "/login";
  return NextResponse.redirect(redirectTo);
}
