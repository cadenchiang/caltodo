/**
 * GET /api/friends — List accepted friends + pending requests with profile info.
 * POST /api/friends — Send a friend request by userId.
 *
 * Friendships use requester/receiver model with status (pending/accepted).
 * The unique index on LEAST/GREATEST prevents duplicate requests in either direction.
 *
 * @returns GET 200 with { friends: FriendEntry[], pendingReceived: FriendEntry[], pendingSent: FriendEntry[] }
 * @returns POST 200 with { friendship } or 409 if already exists
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Builds a user profile map from admin listUsers for enriching friendship data.
 *
 * @param adminClient - Supabase admin client
 * @returns Map of userId → { email, fullName, avatarUrl }
 */
async function buildUserMap(adminClient: ReturnType<typeof createAdminClient>) {
  const { data: usersData } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  return new Map(
    usersData?.users?.map((u) => [u.id, {
      email: u.email ?? "",
      fullName: (u.user_metadata?.full_name as string) ?? null,
      avatarUrl: (u.user_metadata?.avatar_url as string) ?? null,
    }]) ?? []
  );
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`friends-list:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { data: allRows, error: fetchError } = await supabase
      .from("friendships")
      .select("id, requester_id, receiver_id, status, created_at")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (fetchError) {
      logger.error("GET /api/friends: failed to fetch friendships", {
        error: fetchError.message,
      });
      return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 });
    }

    if (!allRows || allRows.length === 0) {
      return NextResponse.json({ friends: [], pendingReceived: [], pendingSent: [] });
    }

    const adminClient = createAdminClient();
    const userMap = await buildUserMap(adminClient);

    /** Enriches a friendship row into a FriendEntry for the "other" user. */
    function toEntry(row: { id: string; requester_id: string; receiver_id: string; status: string; created_at: string }) {
      const otherId = row.requester_id === user!.id ? row.receiver_id : row.requester_id;
      const profile = userMap.get(otherId);
      return {
        friendshipId: row.id,
        userId: otherId,
        email: profile?.email ?? "",
        fullName: profile?.fullName ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      };
    }

    const friends = allRows.filter((r) => r.status === "accepted").map(toEntry);
    const pendingReceived = allRows
      .filter((r) => r.status === "pending" && r.receiver_id === user.id)
      .map(toEntry);
    const pendingSent = allRows
      .filter((r) => r.status === "pending" && r.requester_id === user.id)
      .map(toEntry);

    return NextResponse.json({ friends, pendingReceived, pendingSent });
  } catch (err) {
    logger.error("GET /api/friends: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`friends-add:${user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "Cannot send request to yourself" }, { status: 400 });
  }

  try {
    const { data: friendship, error: insertError } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, receiver_id: userId, status: "pending" })
      .select("*")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Request already exists", code: "already_exists" },
          { status: 409 }
        );
      }
      logger.error("POST /api/friends: failed to insert friend request", {
        error: insertError.message,
        requesterId: user.id,
        receiverId: userId,
      });
      return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
    }

    logger.info("POST /api/friends: friend request sent", {
      friendshipId: friendship.id,
      requesterId: user.id,
      receiverId: userId,
    });

    return NextResponse.json({ friendship });
  } catch (err) {
    logger.error("POST /api/friends: unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
