/**
 * Batch resolves user profiles (name, avatar) from auth user IDs.
 * Uses the admin client to query auth.users metadata.
 *
 * @module user-lookup
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/**
 * Resolved user profile for display in discussion threads.
 *
 * @param id - The user's auth ID
 * @param name - Display name from Google OAuth metadata, or null
 * @param avatar - Avatar URL from Google OAuth metadata, or null
 */
export interface UserProfile {
  id: string;
  name: string | null;
  avatar: string | null;
}

/**
 * Resolves display profiles for a batch of user IDs.
 * Reads user_metadata from Supabase auth.users via the admin API.
 * Returns a Map keyed by user ID for O(1) lookup.
 *
 * @param adminClient - Supabase admin client (service role)
 * @param userIds - Array of user UUIDs to resolve
 * @returns Map of user ID to UserProfile
 */
export async function batchResolveUsers(
  adminClient: SupabaseClient,
  userIds: string[]
): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>();
  const uniqueIds = [...new Set(userIds)];

  if (uniqueIds.length === 0) return profiles;

  try {
    // Supabase admin API: listUsers with pagination
    // For reasonable batch sizes (<100), a single page suffices
    const { data, error } = await adminClient.auth.admin.listUsers({
      perPage: Math.min(uniqueIds.length, 1000),
    });

    if (error) {
      logger.error("batchResolveUsers: admin listUsers failed", {
        error: error.message,
        userCount: uniqueIds.length,
      });
      // Return empty profiles — callers will show "Unknown" as fallback
      return profiles;
    }

    const idSet = new Set(uniqueIds);
    for (const user of data.users) {
      if (idSet.has(user.id)) {
        profiles.set(user.id, {
          id: user.id,
          name: user.user_metadata?.full_name ?? null,
          avatar: user.user_metadata?.avatar_url ?? null,
        });
      }
    }

    // Fill in any missing IDs with null profiles
    for (const id of uniqueIds) {
      if (!profiles.has(id)) {
        profiles.set(id, { id, name: null, avatar: null });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("batchResolveUsers: unexpected error", {
      error: message,
      userCount: uniqueIds.length,
    });
  }

  return profiles;
}
