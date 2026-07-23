/**
 * GET /api/canvas/assignments
 * Returns Canvas assignments that accept file uploads.
 *
 * Uses the already-synced tasks table for instant response instead of
 * hitting the Canvas API (which requires sequential per-course fetches).
 * Falls back to parallel Canvas API calls if no synced tasks exist.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * Parses the `rel="next"` URL from a Canvas `Link` response header for
 * pagination. Returns null when there is no next page.
 */
function parseNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (match) return match[1];
  }
  return null;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's selected Canvas courses to filter
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: creds } = await admin
      .from("integration_credentials")
      .select("selected_canvas_courses, canvas_token, canvas_base_url")
      .eq("user_id", user.id)
      .single();

    const selectedCourseIds = new Set(
      (creds?.selected_canvas_courses as Array<{ id: number; name: string }> | null)
        ?.map((c) => String(c.id)) ?? []
    );

    const canvasToken = creds?.canvas_token as string | null;
    const canvasBaseUrl = (creds?.canvas_base_url as string) || "https://bcourses.berkeley.edu";

    // Pull from already-synced tasks — near instant
    const { data: tasks, error: dbError } = await supabase
      .from("tasks")
      .select("external_id, title, course_name, due_date, source, source_url")
      .eq("source", "canvas")
      .eq("is_submitted", false)
      .is("dismissed_at", null)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (dbError) {
      logger.error("canvas-assignments:db-error", { error: dbError.message });
      return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
    }

    const candidates = (tasks || [])
      .filter((t) => t.external_id)
      .map((t) => {
        const courseMatch = t.source_url?.match(/\/courses\/(\d+)\//);
        const courseId = courseMatch ? Number(courseMatch[1]) : null;
        return {
          id: Number(t.external_id),
          name: t.title,
          courseId,
          courseName: t.course_name || "Unknown Course",
          dueAt: t.due_date,
        };
      })
      .filter((a) => a.courseId !== null)
      .filter((a) => selectedCourseIds.size === 0 || selectedCourseIds.has(String(a.courseId)));

    // Filter to assignments that accept file uploads via Canvas API
    let assignments = candidates;
    if (canvasToken && candidates.length > 0) {
      const uniqueCourseIds = [...new Set(candidates.map((a) => a.courseId))];
      const headers = { Authorization: `Bearer ${canvasToken}` };

      // Fetch assignments per course in parallel to get submission_types.
      // Fail OPEN on any error (HTTP non-2xx OR thrown) so a rate-limited /
      // transient failure never silently drops a whole course's assignments
      // from the submit picker. Follow Link rel="next" so courses with >100
      // assignments aren't truncated to the first page.
      const uploadableIds = new Set<number>();
      const keepAllForCourse = (cId: number | null) => {
        for (const a of candidates) {
          if (a.courseId === cId) uploadableIds.add(a.id);
        }
      };
      await Promise.all(
        uniqueCourseIds.map(async (cId) => {
          try {
            let url: string | null = `${canvasBaseUrl}/api/v1/courses/${cId}/assignments?per_page=100`;
            while (url) {
              const res: Response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
              if (!res.ok) {
                keepAllForCourse(cId); // HTTP error: fail open, not closed
                break;
              }
              const data = await res.json();
              if (Array.isArray(data)) {
                for (const a of data) {
                  if (Array.isArray(a.submission_types) && a.submission_types.includes("online_upload")) {
                    uploadableIds.add(a.id);
                  }
                }
              }
              url = parseNextLink(res.headers.get("link"));
            }
          } catch {
            keepAllForCourse(cId); // network/timeout: fail open
          }
        })
      );
      assignments = candidates.filter((a) => uploadableIds.has(a.id));
    }

    logger.info("GET /api/canvas/assignments", {
      userId: user.id,
      count: assignments.length,
    });

    return NextResponse.json({ assignments });
  } catch (err) {
    logger.error("GET /api/canvas/assignments failed", {
      userId: user.id,
      error: (err as Error).message,
    });
    // Log the detail server-side but return a generic message — the raw error
    // can leak internal fetch/DNS/host details (amplifies SSRF probing).
    return NextResponse.json({ error: "Failed to load Canvas assignments" }, { status: 500 });
  }
}
