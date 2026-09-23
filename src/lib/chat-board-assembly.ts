/**
 * Turns the viewer's course rows into one board per class (D4).
 *
 * Pure: the boards route fetches (the viewer's live rows with stats, the
 * viewer's hidden rows, and every course row that shares a name with any
 * of them) and this module decides which row is the room, which rooms the
 * viewer still has to be enrolled in, and how each board is flagged.
 *
 * @module chat-board-assembly
 */

import type { DiscussionBoard, MemberPreview } from "@/lib/types";
import { groupRooms, isPastTermCourse, type GroupableCourse } from "@/lib/chat-room-groups";

/** A course row plus the viewer's stats for it, from get_user_boards(). */
export interface LiveBoardRow extends GroupableCourse {
  external_id: string;
  message_count: number;
  last_message_body: string | null;
  last_message_author: string | null;
  last_message_at: string | null;
  member_count: number;
  member_avatars: MemberPreview[];
}

/** A course row the viewer is a member of but has hidden. */
export interface HiddenCourseRowInput extends GroupableCourse {
  external_id: string;
}

/** A course row from the global lookup (any viewer). */
export interface SiblingCourseRow extends GroupableCourse {
  external_id: string;
}

/** What the route must do before the list is final. */
export interface BoardAssembly {
  boards: DiscussionBoard[];
  /** Primary rooms the viewer belongs to via a sibling but is not yet a member of. */
  enrollInto: string[];
}

/**
 * Builds the board list.
 *
 * @param live - Viewer's live rows with stats
 * @param hidden - Viewer's hidden rows
 * @param siblings - Every course row sharing a name with a live or hidden
 *                   row (so the primary is the same for every viewer)
 * @param now - Reference date for the past-term flag
 * @returns Boards (visible first, hidden last) and the primary room ids the
 *          viewer must be enrolled into
 * @remarks A group whose primary the viewer is not in yet produces no board
 *          this pass: the route enrolls them and reruns, so the board then
 *          carries the primary's real stats instead of a sibling's.
 */
export function assembleBoards(
  live: readonly LiveBoardRow[],
  hidden: readonly HiddenCourseRowInput[],
  siblings: readonly SiblingCourseRow[],
  now: Date = new Date(),
): BoardAssembly {
  const liveById = new Map(live.map((r) => [r.id, r]));
  const hiddenById = new Map(hidden.map((r) => [r.id, r]));

  // Union of everything we know, deduped by id; live rows win so stats survive.
  const all = new Map<string, GroupableCourse & { external_id: string }>();
  for (const r of siblings) all.set(r.id, r);
  for (const r of hidden) all.set(r.id, r);
  for (const r of live) all.set(r.id, r);

  const boards: DiscussionBoard[] = [];
  const hiddenBoards: DiscussionBoard[] = [];
  const enrollInto: string[] = [];

  for (const group of groupRooms(Array.from(all.values()))) {
    const { primary, sources } = group;
    const viewerLiveInGroup = group.rows.some((r) => liveById.has(r.id));
    const viewerHiddenInGroup = group.rows.some((r) => hiddenById.has(r.id));
    if (!viewerLiveInGroup && !viewerHiddenInGroup) continue; // not the viewer's class

    const liveRow = liveById.get(primary.id);
    if (liveRow) {
      boards.push({
        course: {
          id: liveRow.id,
          source: liveRow.source as DiscussionBoard["course"]["source"],
          external_id: liveRow.external_id,
          name: liveRow.name,
          created_at: liveRow.created_at,
        },
        message_count: liveRow.message_count,
        last_message_body: liveRow.last_message_body,
        last_message_author: liveRow.last_message_author,
        last_message_at: liveRow.last_message_at,
        member_count: liveRow.member_count,
        member_avatars: liveRow.member_avatars ?? [],
        sources,
        past: primary.source !== "system" && isPastTermCourse(primary.name, now),
      });
      continue;
    }

    if (hiddenById.has(primary.id)) {
      hiddenBoards.push({
        course: {
          id: primary.id,
          source: primary.source as DiscussionBoard["course"]["source"],
          external_id: primary.external_id,
          name: primary.name,
          created_at: primary.created_at,
        },
        message_count: 0,
        last_message_body: null,
        last_message_author: null,
        last_message_at: null,
        member_count: 0,
        member_avatars: [],
        hidden: true,
        sources,
        past: isPastTermCourse(primary.name, now),
      });
      continue;
    }

    // Viewer is in a sibling only (live). They belong in the primary room.
    if (viewerLiveInGroup) enrollInto.push(primary.id);
  }

  return { boards: [...boards, ...hiddenBoards], enrollInto };
}
