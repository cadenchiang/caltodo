/**
 * API route for listing the user's chat rooms.
 * GET: one board per class (D4), visible rooms first, hidden rooms last.
 *
 * The sync stores one course row per (source, external_id), so a class on
 * Canvas and Gradescope is two rows with the same canonical name. Rows are
 * grouped by that name across every viewer; the oldest row is the room.
 * A viewer who is only in a sibling row is enrolled into the room here
 * (course-enrollment.ts does the same on every sync, and migration
 * 20260923000001 backfilled existing members).
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import {
  assembleBoards,
  type LiveBoardRow,
  type HiddenCourseRowInput,
  type SiblingCourseRow,
} from "@/lib/chat-board-assembly";

type Admin = ReturnType<typeof createAdminClient>;
type UserClient = Awaited<ReturnType<typeof createClient>>;

/** Row shape returned by get_user_boards(). */
interface UserBoardRow {
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
}

/** Course columns the grouping needs. */
const COURSE_COLUMNS = "id, source, external_id, name, created_at";

/** Maps get_user_boards() rows to the assembly input. */
function toLiveRows(rows: UserBoardRow[]): LiveBoardRow[] {
  return rows.map((r) => ({
    id: r.course_id,
    source: r.course_source,
    external_id: r.course_external_id,
    name: r.course_name,
    created_at: r.course_created_at,
    message_count: r.message_count,
    last_message_body: r.last_message_body,
    last_message_author: r.last_message_author,
    last_message_at: r.last_message_at,
    member_count: r.member_count,
    member_avatars: r.member_avatars ?? [],
  }));
}

/**
 * Enrolls every signed-in user in CalYak once. Returns true when a
 * membership was created so the caller reruns the boards query.
 */
async function ensureCalYakMembership(admin: Admin, userId: string, rows: UserBoardRow[]): Promise<boolean> {
  if (rows.some((r) => r.course_source === "system")) return false;
  const { data: yakCourse } = await admin
    .from("courses")
    .select("id")
    .eq("source", "system")
    .eq("external_id", "caltodo-yak")
    .single();
  if (!yakCourse) return false;
  const { error } = await admin
    .from("course_memberships")
    .upsert({ user_id: userId, course_id: yakCourse.id }, { onConflict: "user_id,course_id", ignoreDuplicates: true });
  if (error) {
    logger.error("boards: CalYak auto-enroll failed", { userId, cause: error.message, impact: "CalYak missing from this list" });
    return false;
  }
  logger.info("Auto-enrolled user in calyak", { userId });
  return true;
}

/** The viewer's hidden (soft-deleted) memberships, read as admin (RLS hides them). */
async function fetchHiddenRows(admin: Admin, userId: string): Promise<HiddenCourseRowInput[]> {
  const { data, error } = await admin
    .from("course_memberships")
    .select(`course_id, courses!inner(${COURSE_COLUMNS})`)
    .eq("user_id", userId)
    .not("deleted_at", "is", null);
  if (error) {
    logger.error("boards: hidden rooms lookup failed", { userId, cause: error.message, impact: "Hidden chats group is empty for this response" });
    return [];
  }
  return ((data ?? []) as unknown as Array<{ courses: SiblingCourseRow | null }>)
    .map((r) => r.courses)
    .filter((c): c is SiblingCourseRow => !!c && c.source !== "system");
}

/** Every non-system course row sharing a name with the given rows (all viewers). */
async function fetchSiblingRows(admin: Admin, userId: string, names: string[]): Promise<SiblingCourseRow[]> {
  if (names.length === 0) return [];
  const { data, error } = await admin
    .from("courses")
    .select(COURSE_COLUMNS)
    .in("name", names)
    .neq("source", "system");
  if (error) {
    logger.error("boards: sibling course lookup failed", { userId, cause: error.message, impact: "rooms grouped from the viewer's rows only this response" });
    return [];
  }
  return (data ?? []) as SiblingCourseRow[];
}

/** Runs get_user_boards() for the viewer. */
async function fetchUserBoards(supabase: UserClient, userId: string): Promise<UserBoardRow[] | null> {
  const { data, error } = await supabase.rpc("get_user_boards");
  if (error) {
    logger.error("GET /api/discussions/boards: rpc failed", { userId, error: error.message });
    return null;
  }
  return (data ?? []) as UserBoardRow[];
}

/**
 * GET /api/discussions/boards
 *
 * @returns Array of DiscussionBoard: one per class, with `sources` for the
 *          platform badge, `past` for the Past classes group, and hidden
 *          rooms last with `hidden: true`
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
    const admin = createAdminClient();
    let rows = await fetchUserBoards(supabase, user.id);
    if (!rows) return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });

    if (await ensureCalYakMembership(admin, user.id, rows)) {
      rows = (await fetchUserBoards(supabase, user.id)) ?? rows;
    }

    const hidden = await fetchHiddenRows(admin, user.id);
    const names = Array.from(new Set([
      ...rows.filter((r) => r.course_source !== "system").map((r) => r.course_name),
      ...hidden.map((r) => r.name),
    ]));
    const siblings = await fetchSiblingRows(admin, user.id, names);

    let assembly = assembleBoards(toLiveRows(rows), hidden, siblings);

    // Viewer is in a sibling row only: enroll them into the room and rerun
    // so the board carries the room's real stats.
    if (assembly.enrollInto.length > 0) {
      const { error } = await admin
        .from("course_memberships")
        .upsert(
          assembly.enrollInto.map((courseId) => ({ user_id: user.id, course_id: courseId })),
          { onConflict: "user_id,course_id", ignoreDuplicates: true },
        );
      if (error) {
        logger.error("boards: primary room enrollment failed", {
          userId: user.id,
          rooms: assembly.enrollInto,
          cause: error.message,
          impact: "these classes are missing from the list until the next sync enrolls the user",
        });
      } else {
        logger.info("boards: enrolled viewer into primary rooms", { userId: user.id, rooms: assembly.enrollInto });
        rows = (await fetchUserBoards(supabase, user.id)) ?? rows;
        assembly = assembleBoards(toLiveRows(rows), hidden, siblings);
      }
    }

    logger.info("GET /api/discussions/boards", {
      userId: user.id,
      boardCount: assembly.boards.filter((b) => !b.hidden).length,
      hiddenCount: assembly.boards.filter((b) => b.hidden).length,
      rowsGrouped: rows.length,
    });

    return NextResponse.json(assembly.boards);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("GET /api/discussions/boards: unexpected error", { userId: user.id, error: message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
