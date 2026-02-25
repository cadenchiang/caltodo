/**
 * GET /api/friends/suggestions
 *
 * Returns a list of users the current user might want to add as friends.
 * Excludes existing friends, pending requests (sent and received), and self.
 * Returns up to 6 random suggestions.
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
    // Fetch all friendships to exclude connected/pending users
    const { data: allRows } = await supabase
      .from("friendships")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    const excludeIds = new Set<string>([user.id]);
    if (allRows) {
      for (const row of allRows) {
        excludeIds.add(row.requester_id);
        excludeIds.add(row.receiver_id);
      }
    }

    const allUsers = await getCachedUsers();

    // Filter out self and anyone already connected/pending
    const candidates = allUsers.filter((u) => !excludeIds.has(u.id));

    // Shuffle and take up to 6 suggestions
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    const suggestions = shuffled.slice(0, 6).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.fullName,
      avatar_url: u.avatarUrl,
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    logger.error("GET /api/friends/suggestions: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
