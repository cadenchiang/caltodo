/**
 * In-memory cache for the Supabase admin user list.
 * Avoids repeated listUsers() calls on every search/friends request.
 * Cache auto-expires after TTL_MS milliseconds.
 *
 * @module user-cache
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

interface CachedUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/** Cache TTL: 60 seconds. */
const TTL_MS = 60_000;

let cachedUsers: CachedUser[] | null = null;
let cacheTimestamp = 0;

/**
 * Returns all users from the Supabase admin API, with in-memory caching.
 * The cache expires after TTL_MS. Concurrent calls reuse the same result.
 *
 * @returns Array of cached user objects with id, email, fullName, avatarUrl
 * @edge_cases
 * - Returns empty array on admin API failure (logged as error)
 * - Stale cache is used if refresh fails
 */
export async function getCachedUsers(): Promise<CachedUser[]> {
  const now = Date.now();

  if (cachedUsers && now - cacheTimestamp < TTL_MS) {
    return cachedUsers;
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error || !data?.users) {
      logger.error("user-cache: failed to refresh user list", {
        error: error?.message,
      });
      return cachedUsers ?? [];
    }

    cachedUsers = data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      fullName: (u.user_metadata?.full_name as string) ?? null,
      avatarUrl: (u.user_metadata?.avatar_url as string) ?? null,
    }));
    cacheTimestamp = now;

    return cachedUsers;
  } catch (err) {
    logger.error("user-cache: unexpected error refreshing", {
      error: err instanceof Error ? err.message : String(err),
    });
    return cachedUsers ?? [];
  }
}

/**
 * Builds a Map of userId → user profile from the cached user list.
 * More efficient than building from raw admin API on each request.
 *
 * @returns Map keyed by user ID
 */
export async function getCachedUserMap(): Promise<Map<string, Omit<CachedUser, "id">>> {
  const users = await getCachedUsers();
  return new Map(
    users.map((u) => [u.id, { email: u.email, fullName: u.fullName, avatarUrl: u.avatarUrl }])
  );
}
