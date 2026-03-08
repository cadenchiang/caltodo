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

export const dynamic = "force-dynamic";

/** Timezone used for bucketing timestamps into local days/hours. */
const TZ = "America/Los_Angeles";

/**
 * Converts a UTC ISO timestamp to a local YYYY-MM-DD string in Pacific time.
 *
 * @param iso - UTC ISO timestamp (e.g. from Supabase created_at)
 * @returns Local date string like "2026-02-23"
 */
export function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Converts a UTC ISO timestamp to the local hour (0-23) in Pacific time.
 *
 * @param iso - UTC ISO timestamp
 * @returns Hour number 0-23 in Pacific time
 */
export function toLocalHour(iso: string): number {
  return parseInt(
    new Date(iso).toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false }),
    10
  );
}

/**
 * Returns today's date as YYYY-MM-DD in Pacific time.
 *
 * @returns Local date string for today
 */
function todayLocal(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Buckets an array of user objects by day (YYYY-MM-DD) in Pacific time.
 *
 * @param users - Array of objects with a created_at ISO timestamp
 * @param days - Number of days to look back from today
 * @returns Array of { date, count } sorted ascending by date
 */
export function bucketByDay(
  users: Array<{ created_at: string }>,
  days: number
): Array<{ date: string; count: number }> {
  const today = todayLocal();
  const buckets = new Map<string, number>();

  // Initialize all days with 0, working backwards from today in local time
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today + "T12:00:00");
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
    buckets.set(key, 0);
  }

  const cutoffDate = new Date(today + "T00:00:00");
  cutoffDate.setDate(cutoffDate.getDate() - days);

  for (const user of users) {
    const created = new Date(user.created_at);
    if (created < cutoffDate) continue;
    const key = toLocalDate(user.created_at);
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key)! + 1);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/**
 * Buckets an array of user objects into 24 hourly slots for a specific date
 * in Pacific time.
 *
 * @param users - Array of objects with a created_at ISO timestamp
 * @param targetDate - The date to drill into (YYYY-MM-DD in Pacific time)
 * @returns Array of { hour, count } for hours 0-23
 */
export function bucketByHour(
  users: Array<{ created_at: string }>,
  targetDate: string
): Array<{ hour: number; count: number }> {
  const buckets = new Array(24).fill(0) as number[];

  for (const user of users) {
    const localDay = toLocalDate(user.created_at);
    if (localDay !== targetDate) continue;
    const hour = toLocalHour(user.created_at);
    buckets[hour]++;
  }

  return buckets.map((count, hour) => ({ hour, count }));
}

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
