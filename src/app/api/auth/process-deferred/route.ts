/**
 * POST /api/auth/process-deferred
 *
 * Activates deferred task invites for the signed-in user. The OAuth
 * callback does this server-side itself; this endpoint covers sign-ins that
 * never pass through the callback (Google One Tap), which call it from the
 * browser once their session cookie is set. Idempotent.
 *
 * @returns 200 with { processed: number }, the count of deferred shares resolved
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { processDeferredInvites } from "@/lib/process-deferred-invites";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`process-deferred:${user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const processed = await processDeferredInvites(user.id, user.email);
    return NextResponse.json({ processed });
  } catch (err) {
    logger.error("POST /api/auth/process-deferred: failed", {
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to process invites" }, { status: 500 });
  }
}
