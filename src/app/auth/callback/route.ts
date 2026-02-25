import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback route handler.
 * Exchanges the authorization code from the OAuth provider for a session.
 * Enforces @berkeley.edu email restriction — non-berkeley accounts are
 * signed out and redirected to /login with an error.
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
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Enforce @berkeley.edu restriction server-side
        if (!user.email?.endsWith("@berkeley.edu")) {
          await supabase.auth.signOut();
          redirectTo.pathname = "/login";
          redirectTo.searchParams.set("error", "berkeley-only");
          return NextResponse.redirect(redirectTo);
        }

        // Process any deferred invites for this user's email (fire-and-forget)
        const origin = request.nextUrl.origin;
        fetch(`${origin}/api/auth/process-deferred`, {
          method: "POST",
          headers: {
            cookie: request.headers.get("cookie") ?? "",
          },
        }).catch(() => { /* non-critical */ });

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
