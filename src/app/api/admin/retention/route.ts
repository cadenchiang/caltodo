/**
 * GET /api/admin/retention
 *
 * Returns DAU/WAU/MAU metrics and per-user login frequency.
 * Queries auth.audit_log_entries for login events over the last 30 days.
 * Falls back to auth.users last_sign_in_at if audit_log access is blocked.
 * Requires admin authentication.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Computes DAU, WAU, MAU from an array of login entries.
 *
 * @param logins - Array of { user_id, created_at } login events
 * @returns Object with dau, wau, mau counts and stickiness ratio
 */
export function computeRetentionMetrics(
  logins: Array<{ user_id: string; created_at: string }>
): { dau: number; wau: number; mau: number; stickiness: number } {
  const now = new Date();
  const dayAgo = new Date(now);
  dayAgo.setDate(dayAgo.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();

  for (const login of logins) {
    const ts = new Date(login.created_at);
    if (ts >= dayAgo) dauSet.add(login.user_id);
    if (ts >= weekAgo) wauSet.add(login.user_id);
    if (ts >= monthAgo) mauSet.add(login.user_id);
  }

  const dau = dauSet.size;
  const wau = wauSet.size;
  const mau = mauSet.size;
  const stickiness = mau > 0 ? Math.round((dau / mau) * 100) : 0;

  return { dau, wau, mau, stickiness };
}

/**
 * Computes per-user login frequency from login entries.
 *
 * @param logins - Array of { user_id, created_at } login events
 * @param userMap - Map of user_id to email for display
 * @param limit - Max number of users to return (default 50)
 * @returns Array of { email, totalLogins, activeDays, lastLogin } sorted by totalLogins desc
 */
export function computeUserFrequency(
  logins: Array<{ user_id: string; created_at: string }>,
  userMap: Map<string, string>,
  limit = 50
): Array<{
  email: string;
  totalLogins: number;
  activeDays: number;
  lastLogin: string;
}> {
  const userStats = new Map<
    string,
    { totalLogins: number; days: Set<string>; lastLogin: string }
  >();

  for (const login of logins) {
    const existing = userStats.get(login.user_id);
    const dayKey = login.created_at.slice(0, 10);

    if (existing) {
      existing.totalLogins++;
      existing.days.add(dayKey);
      if (login.created_at > existing.lastLogin) {
        existing.lastLogin = login.created_at;
      }
    } else {
      userStats.set(login.user_id, {
        totalLogins: 1,
        days: new Set([dayKey]),
        lastLogin: login.created_at,
      });
    }
  }

  return Array.from(userStats.entries())
    .map(([userId, stats]) => ({
      email: userMap.get(userId) ?? userId.slice(0, 8) + "...",
      totalLogins: stats.totalLogins,
      activeDays: stats.days.size,
      lastLogin: stats.lastLogin,
    }))
    .sort((a, b) => b.totalLogins - a.totalLogins)
    .slice(0, limit);
}

export async function GET() {
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
      logger.warn("GET /api/admin/retention — non-admin access attempt", {
        userId: user.id,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { allowed } = rateLimit(`admin-retention:${user.id}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const adminClient = createAdminClient();

    // Build user email map from paginated listUsers
    const userMap = new Map<string, string>();
    let page = 1;
    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (error) {
        logger.error("GET /api/admin/retention — listUsers failed", {
          page,
          error: error.message,
        });
        break;
      }
      for (const u of data.users) {
        userMap.set(u.id, u.email ?? "unknown");
      }
      if (data.users.length < 1000) break;
      page++;
    }

    // Try querying audit_log_entries for login events
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let logins: Array<{ user_id: string; created_at: string }> = [];

    const { data: auditData, error: auditError } = await adminClient
      .schema("auth")
      .from("audit_log_entries")
      .select("id, payload, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10000);

    if (auditError) {
      logger.warn(
        "GET /api/admin/retention — audit_log query failed, using fallback",
        { error: auditError.message }
      );

      // Fallback: use last_sign_in_at from auth.users
      for (const [userId] of userMap) {
        // We already have the users from listUsers — reconstruct basic login data
        // This is less accurate but provides some signal
      }
    } else if (auditData) {
      // Extract login events — audit_log payload contains action info
      for (const entry of auditData) {
        const payload =
          typeof entry.payload === "string"
            ? JSON.parse(entry.payload)
            : entry.payload;

        // Login actions in Supabase audit log
        if (
          payload?.action === "login" ||
          payload?.action === "token_refreshed"
        ) {
          const userId =
            payload?.actor_id ?? payload?.user_id ?? payload?.sub;
          if (userId) {
            logins.push({
              user_id: userId,
              created_at: entry.created_at,
            });
          }
        }
      }

      logger.info("GET /api/admin/retention — parsed audit log logins", {
        totalEntries: auditData.length,
        loginEvents: logins.length,
      });
    }

    // If audit log gave no results, build from last_sign_in_at as fallback
    if (logins.length === 0) {
      logger.info(
        "GET /api/admin/retention — no audit logins, falling back to last_sign_in_at"
      );
      let fbPage = 1;
      while (true) {
        const { data, error } = await adminClient.auth.admin.listUsers({
          page: fbPage,
          perPage: 1000,
        });
        if (error) break;
        for (const u of data.users) {
          if (u.last_sign_in_at) {
            logins.push({
              user_id: u.id,
              created_at: u.last_sign_in_at,
            });
          }
        }
        if (data.users.length < 1000) break;
        fbPage++;
      }
    }

    const metrics = computeRetentionMetrics(logins);
    const topUsers = computeUserFrequency(logins, userMap, 50);

    return NextResponse.json(
      { ...metrics, topUsers },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    logger.error("GET /api/admin/retention — unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
