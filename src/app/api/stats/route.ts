/**
 * GET /api/stats
 *
 * Returns the total count of authenticated users from auth.users.
 * Public endpoint — no auth required. Used by the landing page hero.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = rateLimit(`stats:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const supabase = createAdminClient();

    // Use admin API to count all authenticated users
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1, page: 1 });

    if (error) {
      logger.error("GET /api/stats: failed to count users", { error: error.message });
      return NextResponse.json({ count: 0 });
    }

    // listUsers returns total count in the response
    const count = data.total ?? data.users.length;

    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (err) {
    logger.error("GET /api/stats: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ count: 0 });
  }
}
