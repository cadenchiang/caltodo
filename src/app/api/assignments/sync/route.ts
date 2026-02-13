/**
 * API route to trigger assignment sync from Canvas and Gradescope.
 * POST: Runs the sync engine and returns results.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSync } from "@/lib/sync-engine";
import { logger } from "@/lib/logger";

/**
 * POST /api/assignments/sync
 * Triggers a full sync from both Canvas and Gradescope.
 * Returns sync results with counts and any errors per source.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    logger.info("POST /api/assignments/sync started", { userId: user.id });
    const result = await runSync(supabase, user.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("POST /api/assignments/sync failed", { userId: user.id, error: message });
    return NextResponse.json({ error: "Sync failed: " + message }, { status: 500 });
  }
}
