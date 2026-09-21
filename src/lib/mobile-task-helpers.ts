/**
 * Shared pieces of the /api/mobile/tasks routes.
 *
 * The iOS app authenticates with a bearer JWT rather than cookies, so each
 * route builds a per-request Supabase client and must confirm the token is
 * still good before touching the database: an expired token otherwise
 * surfaces as a 500 from the query instead of the 401 the app knows how to
 * recover from. The row invariants the web client keeps by convention
 * (completion, dismissal) are enforced here for every caller.
 *
 * @module mobile-task-helpers
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/** A request the bearer token vouched for. */
export interface MobileAuth {
  supabase: SupabaseClient;
  user: User;
}

/**
 * Builds a Supabase client acting as the bearer token's user.
 *
 * @param req - The incoming request, with `Authorization: Bearer <jwt>`
 * @returns The client, or null when the header is missing or malformed
 */
export function getAuthClient(req: NextRequest): SupabaseClient | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

/**
 * Authenticates a mobile request before any query runs.
 *
 * @param req - The incoming request
 * @param route - Route name for the log line, e.g. "GET /api/mobile/tasks"
 * @returns The client and user, or a ready 401 response when the header is
 *          missing or the token is expired, revoked or otherwise rejected
 */
export async function authenticateMobile(
  req: NextRequest,
  route: string,
): Promise<MobileAuth | { response: NextResponse }> {
  const supabase = getAuthClient(req);
  if (!supabase) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    logger.warn(`${route}: bearer token rejected`, {
      error: error?.message ?? "no user for token",
      impact: "client receives 401 and refreshes its session",
    });
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { supabase, user };
}

/**
 * Keeps is_completed and completed_at consistent.
 *
 * They are independent fields on the wire, so a client could set one
 * without the other, and clients did: prod held 44 tasks complete with a
 * null completed_at, which the nightly archive purge (deletes on
 * `completed_at < cutoff`) never sees, so the rows were retained forever.
 *
 * @param update - The fields being written
 * @param now - The timestamp to stamp when completing without one
 * @returns A copy with completed_at derived from is_completed; untouched
 *          when is_completed is not in the update
 */
export function applyCompletionInvariant(
  update: Record<string, unknown>,
  now: string = new Date().toISOString(),
): Record<string, unknown> {
  const next = { ...update };
  if ("is_completed" in next) {
    if (next.is_completed === true) {
      if (next.completed_at == null) next.completed_at = now;
    } else if (next.is_completed === false) {
      next.completed_at = null;
    }
  }
  return next;
}

/**
 * Keeps dismissed_at and dismissed_by_user consistent.
 *
 * The sync engine only respects a dismissal it can see was the user's
 * (`dismissed_by_user`), so a client setting dismissed_at alone had its
 * task resurrected on the next sync. Clearing dismissed_at clears the flag,
 * matching the web client's undo.
 *
 * @param update - The fields being written
 * @returns A copy with dismissed_by_user derived from dismissed_at;
 *          untouched when dismissed_at is not in the update
 */
export function applyDismissalInvariant(update: Record<string, unknown>): Record<string, unknown> {
  const next = { ...update };
  if ("dismissed_at" in next) {
    next.dismissed_by_user = next.dismissed_at != null;
  }
  return next;
}
