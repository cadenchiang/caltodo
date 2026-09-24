/**
 * Enrolls a user into the primary chat room of every class they sync (D4).
 *
 * One class is one room: course rows that share a canonical name are
 * siblings, and the oldest row (then lowest id) is the room. The sync
 * creates a membership per row; this adds the membership in the primary
 * row so the user lands in the same room as everyone else in the class,
 * whichever platform their row came from. Existing rows are left alone
 * (ON CONFLICT DO NOTHING), so a hidden (soft-deleted) primary stays hidden.
 *
 * @module course-primary-rooms
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { groupRooms } from "@/lib/chat-room-groups";

/**
 * Ensures memberships in the primary room for each of the given course names.
 *
 * @param adminClient - Supabase admin client (service role)
 * @param userId - The user being enrolled
 * @param courseNames - Canonical names of the courses just synced
 * @returns Number of primary rooms the user is now guaranteed to be in
 */
export async function ensurePrimaryRoomMemberships(
  adminClient: SupabaseClient,
  userId: string,
  courseNames: readonly string[],
): Promise<number> {
  const names = Array.from(new Set(courseNames.filter((n) => n.trim().length > 0)));
  if (names.length === 0) return 0;

  const { data: rows, error } = await adminClient
    .from("courses")
    .select("id, source, name, created_at")
    .in("name", names)
    .neq("source", "system");

  if (error) {
    logger.error("ensurePrimaryRoomMemberships: course lookup failed", {
      userId,
      cause: error.message,
      impact: "user may land in a sibling row instead of the class room until the next sync or boards request",
    });
    return 0;
  }

  const primaries = groupRooms(rows ?? []).map((g) => g.primary.id);
  if (primaries.length === 0) return 0;

  const { error: upsertError } = await adminClient
    .from("course_memberships")
    .upsert(
      primaries.map((courseId) => ({ user_id: userId, course_id: courseId })),
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );

  if (upsertError) {
    logger.error("ensurePrimaryRoomMemberships: membership upsert failed", {
      userId,
      cause: upsertError.message,
      impact: "user may land in a sibling row instead of the class room until the next sync or boards request",
    });
    return 0;
  }

  logger.info("ensurePrimaryRoomMemberships: complete", { userId, primaryRooms: primaries.length });
  return primaries.length;
}
