import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pickLandingPath } from "@/lib/landing-path";
import { isPro } from "@/lib/entitlements";

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

          // Seed default hidden-nav preferences for new users.
          // Board (Home) is opt-in: hidden by default. New users see only
          // Inbox and Calendar in their sidebar; they can re-enable Home
          // from Settings → Navigation. Existing users are not affected
          // because we only seed when integration_credentials didn't exist.
          const existingHidden = (user.user_metadata as { hidden_nav_items?: unknown } | null)?.hidden_nav_items;
          if (!Array.isArray(existingHidden)) {
            const { error: seedError } = await supabase.auth.updateUser({
              data: { hidden_nav_items: ["/app/home"] },
            });
            if (seedError) {
              console.warn("auth/callback: failed to seed hidden_nav_items", seedError.message);
            }
          }

          // Send new users through the onboarding wizard so they pick
          // their platforms and connect each integration.
          redirectTo.pathname = "/app/onboarding";
        } else {
          // Free users skip /app/home (Pro-gated lock screen) and land on
          // /app/inbox instead. isPro() reads the cached entitlement so
          // this is one DB hit at most per 60s per user.
          const userIsPro = await isPro(user.id);
          redirectTo.pathname = pickLandingPath(user.user_metadata, userIsPro);
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
