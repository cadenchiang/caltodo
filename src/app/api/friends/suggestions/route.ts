/**
 * GET /api/friends/suggestions
 *
 * Returns up to 6 suggested users ranked by relevance:
 *   1. Mutual friends (friends-of-friends)
 *   2. Shared courses (same course_name on tasks)
 *   3. Same email domain (same school)
 * Excludes existing friends, pending requests, and self.
 *
 * @returns 200 with { suggestions: [{ id, email, full_name, avatar_url }] }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedUsers } from "@/lib/user-cache";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`friends-suggestions:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // Fetch all friendships (not just mine) for mutual friend scoring
    const { data: allFriendships } = await supabase
      .from("friendships")
      .select("requester_id, receiver_id, status");

    // Build my direct connections (exclude from suggestions)
    const excludeIds = new Set<string>([user.id]);
    // Build my accepted friends set for mutual friend scoring
    const myFriendIds = new Set<string>();

    if (allFriendships) {
      for (const row of allFriendships) {
        if (row.requester_id === user.id || row.receiver_id === user.id) {
          excludeIds.add(row.requester_id);
          excludeIds.add(row.receiver_id);
          if (row.status === "accepted") {
            myFriendIds.add(row.requester_id === user.id ? row.receiver_id : row.requester_id);
          }
        }
      }
    }

    // Build a map: userId → set of their accepted friends (for mutual counting)
    const friendsOf = new Map<string, Set<string>>();
    if (allFriendships) {
      for (const row of allFriendships) {
        if (row.status !== "accepted") continue;
        if (!friendsOf.has(row.requester_id)) friendsOf.set(row.requester_id, new Set());
        if (!friendsOf.has(row.receiver_id)) friendsOf.set(row.receiver_id, new Set());
        friendsOf.get(row.requester_id)!.add(row.receiver_id);
        friendsOf.get(row.receiver_id)!.add(row.requester_id);
      }
    }

    // Fetch current user's courses from their tasks
    const { data: myTasks } = await supabase
      .from("tasks")
      .select("course_name")
      .eq("user_id", user.id)
      .not("course_name", "is", null);

    const myCourses = new Set<string>();
    if (myTasks) {
      for (const t of myTasks) {
        if (t.course_name) myCourses.add(t.course_name.toLowerCase());
      }
    }

    // Fetch all tasks with course_name to find users sharing courses
    const { data: allCourseTasks } = await supabase
      .from("tasks")
      .select("user_id, course_name")
      .not("course_name", "is", null);

    // Map: userId → set of their courses
    const userCourses = new Map<string, Set<string>>();
    if (allCourseTasks) {
      for (const t of allCourseTasks) {
        if (!t.course_name) continue;
        if (!userCourses.has(t.user_id)) userCourses.set(t.user_id, new Set());
        userCourses.get(t.user_id)!.add(t.course_name.toLowerCase());
      }
    }

    const allUsers = await getCachedUsers();
    const userEmail = user.email ?? "";
    const userDomain = userEmail.split("@")[1]?.toLowerCase() ?? "";

    // Filter to same domain, exclude connected users
    const candidates = allUsers.filter((u) => {
      if (excludeIds.has(u.id)) return false;
      const candidateDomain = (u.email ?? "").split("@")[1]?.toLowerCase() ?? "";
      return candidateDomain === userDomain;
    });

    // Score each candidate
    const scored = candidates.map((u) => {
      let score = 0;

      // Mutual friends: +3 per mutual friend
      const theirFriends = friendsOf.get(u.id);
      if (theirFriends) {
        for (const fid of myFriendIds) {
          if (theirFriends.has(fid)) score += 3;
        }
      }

      // Shared courses: +2 per shared course
      const theirCourses = userCourses.get(u.id);
      if (theirCourses && myCourses.size > 0) {
        for (const course of myCourses) {
          if (theirCourses.has(course)) score += 2;
        }
      }

      // Small random tiebreaker so equal-score users vary
      score += Math.random() * 0.5;

      return { user: u, score };
    });

    // Sort by score descending, take top 6
    scored.sort((a, b) => b.score - a.score);
    const suggestions = scored.slice(0, 6).map((s) => ({
      id: s.user.id,
      email: s.user.email,
      full_name: s.user.fullName,
      avatar_url: s.user.avatarUrl,
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    logger.error("GET /api/friends/suggestions: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
