/**
 * GET /api/users/karma?userId=<uuid>
 *
 * Returns the karma score for a given user.
 * Karma = count of course_messages authored by the user.
 *
 * @param request - Query param: userId (required UUID)
 * @returns { karma: number } on success; 400/401/500 on error
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`karma:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawUserId = request.nextUrl.searchParams.get("userId")?.trim();
  if (!rawUserId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }

  // Allow "self" as a convenience to fetch own karma
  const targetUserId = rawUserId === "self" ? user.id : rawUserId;

  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("author_id", targetUserId);

    if (error) {
      logger.error("GET /api/users/karma: query failed", {
        userId: targetUserId,
        error: error.message,
      });
      return NextResponse.json({ error: "Failed to fetch karma" }, { status: 500 });
    }

    return NextResponse.json({ karma: count ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/users/karma: unexpected error", {
      userId: targetUserId,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
