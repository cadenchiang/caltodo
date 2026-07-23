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
      .filter((u) => u.id !== user.id)
      .map((u) => {
        const email = u.email.toLowerCase();
        const name = u.fullName?.toLowerCase() ?? "";
        // Email matches must be EXACT (full address) — substring email search
        // let a caller harvest every user's email one prefix at a time. Names
        // may still be matched by substring for the picker UX.
        const emailExact = email === q;
        const nameMatch = name.includes(q);
        return { u, emailExact, nameMatch };
      })
      .filter((r) => r.emailExact || r.nameMatch)
      .slice(0, 10)
      .map((r) => ({
        id: r.u.id,
        full_name: r.u.fullName,
        avatar_url: r.u.avatarUrl,
        // Only echo the email back when the caller already typed it exactly, so
        // the endpoint can't be used to discover users' emails.
        email: r.emailExact ? r.u.email : undefined,
      }));

    return NextResponse.json({ users: results });
  } catch (err) {
    logger.error("GET /api/users/search: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
