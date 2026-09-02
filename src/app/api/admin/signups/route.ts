/**
 * GET /api/admin/signups
 *
 * Returns daily signup counts for the last 30 days.
 * Optional `?date=YYYY-MM-DD` parameter returns 24 hourly buckets for that day.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { bucketByDay, bucketByHour } from "@/lib/admin-metrics";

export const dynamic = "force-dynamic";

/**
 * Fetches all users via paginated admin API calls.
 *
 * @param adminClient - Supabase admin client with service role access
 * @returns Array of user objects with created_at timestamps
 */
async function fetchAllUsers(
  adminClient: ReturnType<typeof createAdminClient>
): Promise<Array<{ created_at: string }>> {
  const allUsers: Array<{ created_at: string }> = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      logger.error("GET /api/admin/signups — listUsers page failed", {
        page,
        error: error.message,
      });
      break;
    }

    for (const user of data.users) {
      allUsers.push({ created_at: user.created_at });
    }

    // Stop if we've fetched all users
    if (data.users.length < perPage) break;
    page++;
  }

  return allUsers;
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(user.email)) {
      logger.warn("GET /api/admin/signups — non-admin access attempt", {
        userId: user.id,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { allowed } = rateLimit(`admin-signups:${user.id}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const adminClient = createAdminClient();
    const users = await fetchAllUsers(adminClient);

    logger.info("GET /api/admin/signups — fetched users", {
      count: users.length,
    });

    // Check for hourly drill-down
    const dateParam = request.nextUrl.searchParams.get("date");
    if (dateParam) {
      const hourly = bucketByHour(users, dateParam);
      return NextResponse.json(
        { date: dateParam, hourly },
        {
          headers: {
            "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
          },
        }
      );
    }

    // Default: daily buckets for last 30 days
    const daily = bucketByDay(users, 30);
    const total = users.length;

    return NextResponse.json(
      { daily, total },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    logger.error("GET /api/admin/signups — unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
