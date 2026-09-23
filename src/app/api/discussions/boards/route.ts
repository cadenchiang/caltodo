/**
 * API route for listing discussion boards the user is enrolled in.
 * GET: Returns enrolled courses with post counts via a single DB function call.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/discussions/boards
 * Calls get_user_boards() — a single SQL function that joins
 * memberships, courses, and post counts in one round-trip.
 *
 * @returns Array of { course, post_count } objects
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`discussion-boards:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // Auto-enroll user in calyak if not already a member
    const { data: initialData } = await supabase.rpc("get_user_boards");
    const hasYak = (initialData ?? []).some(
      (r: { course_source: string }) => r.course_source === "system"
    );

    if (!hasYak) {
      // Auto-enroll every authenticated user in CalYak, regardless of
      // email domain. Previously .edu-gated; now open to all.
      const admin = createAdminClient();
      const { data: yakCourse } = await admin
        .from("courses")
        .select("id")
        .eq("source", "system")
        .eq("external_id", "caltodo-yak")
        .single();

      if (yakCourse) {
        await admin.from("course_memberships").upsert(
          { user_id: user.id, course_id: yakCourse.id },
          { onConflict: "user_id,course_id" }
        );
        logger.info("Auto-enrolled user in calyak", { userId: user.id });
      }
    }

    const { data, error } = await supabase.rpc("get_user_boards");

    if (error) {
      logger.error("GET /api/discussions/boards: rpc failed", {
        userId: user.id,
        error: error.message,
      });
      return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
    }

    const rawBoards = (data ?? []).map((row: {
      course_id: string;
      course_source: string;
      course_external_id: string;
      course_name: string;
      course_created_at: string;
      message_count: number;
      last_message_body: string | null;
      last_message_author: string | null;
      last_message_at: string | null;
      member_count: number;
      member_avatars: Array<{ name: string | null; avatar: string | null }>;
    }) => ({
      course: {
        id: row.course_id,
        source: row.course_source,
        external_id: row.course_external_id,
        name: row.course_name,
        created_at: row.course_created_at,
      },
      message_count: row.message_count,
      last_message_body: row.last_message_body,
      last_message_author: row.last_message_author,
      last_message_at: row.last_message_at,
      member_count: row.member_count,
      member_avatars: row.member_avatars ?? [],
    }));

    // Dedupe historical duplicate course rows by normalized name across all
    // sources. The course-enrollment dedup key is (source, external_id), so the
    // same class showing up via Canvas + Gradescope + Pensieve creates three
    // separate course rows even when the user thinks of them as one chat.
    // Keep `system` courses (CalYak) as-is; for the rest, collapse same-name
    // entries down to the most active one: most messages, then most recent
    // activity, then oldest.
    const seen = new Map<string, typeof rawBoards[number]>();
    for (const board of rawBoards) {
      if (board.course.source === "system") {
        seen.set(`system:${board.course.id}`, board);
        continue;
      }
      const key = `name:${board.course.name.replace(/\s+/g, " ").trim().toLowerCase()}`;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, board);
        continue;
      }
      const existingScore: [number, number, number] = [
        existing.message_count,
        existing.last_message_at ? new Date(existing.last_message_at).getTime() : 0,
        -new Date(existing.course.created_at).getTime(),
      ];
      const candidateScore: [number, number, number] = [
        board.message_count,
        board.last_message_at ? new Date(board.last_message_at).getTime() : 0,
        -new Date(board.course.created_at).getTime(),
      ];
      const candidateWins =
        candidateScore[0] > existingScore[0] ||
        (candidateScore[0] === existingScore[0] && candidateScore[1] > existingScore[1]) ||
        (candidateScore[0] === existingScore[0] &&
          candidateScore[1] === existingScore[1] &&
          candidateScore[2] > existingScore[2]);
      if (candidateWins) {
        seen.set(key, board);
      }
    }
    const boards = Array.from(seen.values());

    logger.info("GET /api/discussions/boards", {
      userId: user.id,
      boardCount: boards.length,
      duplicatesCollapsed: rawBoards.length - boards.length,
    });

    return NextResponse.json(boards);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/discussions/boards: unexpected error", {
      userId: user.id,
      error: message,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
