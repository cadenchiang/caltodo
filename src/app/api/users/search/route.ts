/**
 * GET /api/users/search?q=...
 *
 * Searches for caltodo users by name or email for the guest picker autocomplete.
 * Requires authentication. Excludes the current user from results.
 *
 * @param q - Search query (min 2 characters)
 * @returns 200 with { users: [{ id, email, full_name, avatar_url }] }
 * @returns 400 if query is missing or too short
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCachedUsers } from "@/lib/user-cache";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`user-search:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  try {
    const allUsers = await getCachedUsers();

    const results = allUsers
      .filter((u) => {
        if (u.id === user.id) return false;
        const email = u.email.toLowerCase();
        const name = u.fullName?.toLowerCase() ?? "";
        return email.includes(q) || name.includes(q);
      })
      .slice(0, 10)
      .map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        avatar_url: u.avatarUrl,
      }));

    return NextResponse.json({ users: results });
  } catch (err) {
    logger.error("GET /api/users/search: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
