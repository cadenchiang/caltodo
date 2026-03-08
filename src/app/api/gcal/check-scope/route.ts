/**
 * GET /api/gcal/check-scope
 *
 * Checks whether the user's Google Calendar token has full read/write
 * access (calendar scope) vs read-only (calendar.readonly).
 * Uses Google's tokeninfo endpoint to inspect granted scopes.
 *
 * @returns { needsReconnect: boolean } — true if token lacks write access
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/gcal/token-manager";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Google tokeninfo endpoint for inspecting granted scopes. */
const GOOGLE_TOKENINFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gcal-check-scope:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const accessToken = await getValidAccessToken(supabase, user.id);
  if (!accessToken) {
    return NextResponse.json({ needsReconnect: false, reason: "not_connected" });
  }

  try {
    const res = await fetch(`${GOOGLE_TOKENINFO_URL}?access_token=${encodeURIComponent(accessToken)}`);
    if (!res.ok) {
      logger.warn("GET /api/gcal/check-scope: tokeninfo request failed", {
        userId: user.id,
        status: res.status,
      });
      return NextResponse.json({ needsReconnect: false, reason: "tokeninfo_failed" });
    }

    const data = await res.json();
    const scope = (data.scope as string) ?? "";
    const hasFullAccess = scope.includes("https://www.googleapis.com/auth/calendar") &&
      !scope.match(/calendar\.readonly(?:\s|$)/);

    logger.info("GET /api/gcal/check-scope: scope checked", {
      userId: user.id,
      hasFullAccess,
      scope,
    });

    return NextResponse.json({ needsReconnect: !hasFullAccess });
  } catch (err) {
    logger.error("GET /api/gcal/check-scope: unexpected error", {
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ needsReconnect: false, reason: "error" });
  }
}
