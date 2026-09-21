/**
 * Activates task invites that were sent to an email before it had an account.
 *
 * An invite to an unregistered email is stored as a task_shares row with
 * `invitee_id` null ("deferred"). Once that person signs in, every such row
 * for their email is claimed for their user id and moved to `pending` so it
 * shows up in their invite list. Runs with the admin client because it is
 * called from the OAuth callback, where the request's own session cookie is
 * not yet usable, and the rows were written by other users.
 *
 * Idempotent: a second run finds no rows and processes 0.
 *
 * @module process-deferred-invites
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

/**
 * Claims every deferred invite addressed to `email` for `userId`.
 *
 * @param userId - The signed-in user's id, written to `invitee_id`
 * @param email - The user's email; matched case-insensitively (stored lowercased)
 * @param client - Service-role client override for tests; defaults to the real one
 * @returns How many shares were activated
 * @throws Error when either the read or the write fails, with the cause
 *         logged; callers decide whether that blocks them (the callback
 *         does not, the API route returns 500)
 * @remarks A user without an email (possible for some providers) has no
 *          deferred invites by definition and resolves to 0 without a query.
 */
export async function processDeferredInvites(
  userId: string,
  email: string | null | undefined,
  client: SupabaseClient = createAdminClient(),
): Promise<number> {
  const userEmail = email?.toLowerCase();
  if (!userEmail) return 0;

  const { data: deferredShares, error: fetchError } = await client
    .from("task_shares")
    .select("id")
    .eq("invitee_email", userEmail)
    .is("invitee_id", null);

  if (fetchError) {
    logger.error("processDeferredInvites: failed to fetch deferred shares", {
      userId,
      error: fetchError.message,
      impact: "invites sent before signup stay inactive until the next sign-in",
    });
    throw new Error(`Failed to fetch deferred shares: ${fetchError.message}`);
  }

  if (!deferredShares || deferredShares.length === 0) return 0;

  const shareIds = deferredShares.map((s) => s.id);
  const { error: updateError } = await client
    .from("task_shares")
    .update({ invitee_id: userId, status: "pending" })
    .in("id", shareIds);

  if (updateError) {
    logger.error("processDeferredInvites: failed to claim deferred shares", {
      userId,
      shareIds,
      error: updateError.message,
      impact: "invites stay deferred; retried on the next sign-in",
    });
    throw new Error(`Failed to update deferred shares: ${updateError.message}`);
  }

  logger.info("processDeferredInvites: deferred shares resolved", {
    userId,
    processed: shareIds.length,
  });
  return shareIds.length;
}
