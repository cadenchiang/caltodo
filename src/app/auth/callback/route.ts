import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pickLandingPath } from "@/lib/landing-path";

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
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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

        if (!creds) {
          // New user — create bare credentials row and add welcome flag
          await supabase
            .from("integration_credentials")
            .upsert({ user_id: user.id }, { onConflict: "user_id" });
          redirectTo.searchParams.set("welcome", "1");
        }
        redirectTo.pathname = pickLandingPath(user.user_metadata);
      } else {
        redirectTo.pathname = "/app/home";
      }

      return NextResponse.redirect(redirectTo);
    }
  }

  // If code exchange fails, redirect to login
  redirectTo.pathname = "/login";
  return NextResponse.redirect(redirectTo);
}
