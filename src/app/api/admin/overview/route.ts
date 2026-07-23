/**
 * GET /api/admin/overview
 *
 * Returns platform adoption counts and task completion statistics.
 * Queries integration_credentials for platform usage and tasks for completion rates.
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
 * Shape of platform adoption data returned by the API.
 */
export interface PlatformAdoptionData {
  canvas: number;
  gradescope: number;
  googleCalendar: number;
  pensieve: number;
}

/**
 * Shape of task statistics returned by the API.
 */
export interface TaskStatsData {
  total: number;
  completed: number;
  completionRate: number;
  bySource: Array<{ source: string; count: number; completed: number }>;
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
      logger.warn("GET /api/admin/overview — non-admin access attempt", {
        userId: user.id,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { allowed } = rateLimit(`admin-overview:${user.id}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const adminClient = createAdminClient();

    // Query integration_credentials for platform adoption
    const { data: credentials, error: credError } = await adminClient
      .from("integration_credentials")
      .select(
        "canvas_token, gradescope_email, google_calendar_id, pensieve_calendar_url"
      );

    // Track whether any query failed so the dashboard can flag under-reported
    // numbers instead of presenting partial/zeroed data as authoritative.
    let partial = false;

    if (credError) {
      logger.error(
        "GET /api/admin/overview — integration_credentials query failed",
        { error: credError.message }
      );
      partial = true;
    }

    const platforms: PlatformAdoptionData = {
      canvas: 0,
      gradescope: 0,
      googleCalendar: 0,
      pensieve: 0,
    };

    if (credentials) {
      for (const cred of credentials) {
        if (cred.canvas_token) platforms.canvas++;
        if (cred.gradescope_email) platforms.gradescope++;
        if (cred.google_calendar_id) platforms.googleCalendar++;
        if (cred.pensieve_calendar_url) platforms.pensieve++;
      }
    }

    // Query tasks for completion stats — paginate to avoid Supabase 1000-row default limit
    const allTasks: Array<{ is_completed: boolean; source: string | null }> = [];
    const PAGE_SIZE = 1000;
    let offset = 0;

    while (true) {
      const { data: page, error: taskError } = await adminClient
        .from("tasks")
        .select("is_completed, source")
        .range(offset, offset + PAGE_SIZE - 1);

      if (taskError) {
        logger.error("GET /api/admin/overview — tasks query failed", {
          error: taskError.message,
          offset,
        });
        partial = true;
        break;
      }

      if (page) allTasks.push(...page);
      if (!page || page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    const taskStats: TaskStatsData = {
      total: 0,
      completed: 0,
      completionRate: 0,
      bySource: [],
    };

    taskStats.total = allTasks.length;
    taskStats.completed = allTasks.filter((t) => t.is_completed).length;
    taskStats.completionRate =
      taskStats.total > 0
        ? Math.round((taskStats.completed / taskStats.total) * 100)
        : 0;

    // Group by source
    const sourceMap = new Map<
      string,
      { count: number; completed: number }
    >();
    for (const task of allTasks) {
      const src = task.source ?? "manual";
      const existing = sourceMap.get(src) ?? { count: 0, completed: 0 };
      existing.count++;
      if (task.is_completed) existing.completed++;
      sourceMap.set(src, existing);
    }

    taskStats.bySource = Array.from(sourceMap.entries())
      .map(([source, stats]) => ({ source, ...stats }))
      .sort((a, b) => b.count - a.count);

    logger.info("GET /api/admin/overview — success", {
      platforms,
      totalTasks: taskStats.total,
    });

    return NextResponse.json(
      { platforms, taskStats, partial },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    logger.error("GET /api/admin/overview — unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
