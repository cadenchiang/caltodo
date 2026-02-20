/**
 * GET /api/stats
 *
 * Returns the count of distinct authenticated users (by user_id in tasks table).
 * Public endpoint — no auth required. Used by the landing page hero.
 * Cached for 5 minutes to avoid excessive DB queries.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Count distinct user_ids from integration_credentials (users who signed up and set up)
    const { count, error } = await supabase
      .from("integration_credentials")
      .select("*", { count: "exact", head: true });

    if (error) {
      logger.error("GET /api/stats: failed to count users", { error: error.message });
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (err) {
    logger.error("GET /api/stats: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ count: 0 });
  }
}
