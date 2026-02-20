import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * Email confirmation callback route.
 * Handles both PKCE flow (code param) and non-PKCE flow (token_hash param).
 * After verification, routes new users to onboarding and returning users to inbox.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/app/inbox";

  // Validate redirect target: must be a relative path starting with "/" but not "//"
  // to prevent open redirect attacks (e.g. "//evil.com" resolves as protocol-relative URL).
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/app/inbox";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");
  redirectTo.searchParams.delete("code");

  const supabase = await createClient();

  // PKCE flow: Supabase redirects with a `code` param after email verification
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirectTo.pathname = await getPostAuthRedirect(supabase, next);
      logger.info("Email confirmation (PKCE): success");
      return NextResponse.redirect(redirectTo);
    }

    logger.error("Email confirmation (PKCE): code exchange failed", { error: error.message });
  }

  // Non-PKCE flow: Supabase redirects with `token_hash` + `type` params
  const validOtpTypes = ["signup", "email"];
  if (token_hash && type && validOtpTypes.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email",
      token_hash,
    });

    if (!error) {
      redirectTo.pathname = await getPostAuthRedirect(supabase, next);
      logger.info("Email confirmation (OTP): success");
      return NextResponse.redirect(redirectTo);
    }

    logger.error("Email confirmation (OTP): verification failed", { error: error.message });
  }

  // If verification fails, redirect to login
  logger.warn("Email confirmation: no valid code or token_hash provided");
  redirectTo.pathname = "/login";
  return NextResponse.redirect(redirectTo);
}

/**
 * Determines the post-auth redirect path.
 * New users (no integration_credentials) go to onboarding; returning users go to the default path.
 *
 * @param supabase - Authenticated Supabase client
 * @param defaultPath - Fallback path for returning users
 * @returns The redirect pathname
 */
async function getPostAuthRedirect(
  supabase: Awaited<ReturnType<typeof createClient>>,
  defaultPath: string,
): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: creds } = await supabase
        .from("integration_credentials")
        .select("id")
        .eq("user_id", user.id)
        .single();

      return creds ? defaultPath : "/app/onboarding";
    }
  } catch (err) {
    logger.error("Email confirmation: failed to check user credentials", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return defaultPath;
}
