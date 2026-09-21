/**
 * Side effects of deleting an account that live outside Postgres.
 *
 * Audit M18: deleting the auth user cascaded the database rows but left
 * the Stripe subscription billing and the user's storage objects behind.
 * Both are handled here so the route reads as a sequence.
 *
 * @module account-cleanup
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe, StripeNotConfiguredError } from "@/lib/stripe";
import { logger } from "@/lib/logger";

/** Buckets whose objects belong to one user, and how they are found. */
const AVATARS_BUCKET = "avatars";
const CHAT_ATTACHMENTS_BUCKET = "chat-attachments";

/**
 * Cancels the user's Stripe subscription, if the row names one.
 *
 * @param admin - Service-role client
 * @param userId - The user being deleted
 * @returns ok=true when there was nothing to cancel, it was canceled, or it
 *          was already gone at Stripe; ok=false when Stripe refused
 * @remarks Stripe being unconfigured is tolerated: the id is logged so it
 *          can be canceled by hand, and deletion proceeds.
 */
export async function cancelStripeSubscription(
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: boolean; subscriptionId: string | null }> {
  const { data, error } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    logger.error("Account deletion: failed to read subscription row", {
      userId,
      error: error.message,
      impact: "deletion refused so a paid subscription cannot be orphaned",
    });
    return { ok: false, subscriptionId: null };
  }
  const subscriptionId = data?.stripe_subscription_id ?? null;
  if (!subscriptionId) return { ok: true, subscriptionId: null };

  try {
    await stripe().subscriptions.cancel(subscriptionId);
    logger.info("Account deletion: Stripe subscription canceled", { userId, subscriptionId });
    return { ok: true, subscriptionId };
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      logger.warn("Account deletion: Stripe not configured, subscription left for manual cancel", {
        userId,
        subscriptionId,
        envVar: err.envVar,
      });
      return { ok: true, subscriptionId };
    }
    const code = (err as { code?: string }).code;
    if (code === "resource_missing") {
      logger.info("Account deletion: Stripe subscription already gone", { userId, subscriptionId });
      return { ok: true, subscriptionId };
    }
    logger.error("Account deletion: Stripe cancel failed", {
      userId,
      subscriptionId,
      error: err instanceof Error ? err.message : String(err),
      impact: "deletion refused so the user is not charged for an account that no longer exists",
    });
    return { ok: false, subscriptionId };
  }
}

/**
 * Removes every object in `bucket` at the given paths, in one call.
 *
 * @returns The number removed, or -1 when the remove call failed (logged)
 */
async function removeObjects(admin: SupabaseClient, userId: string, bucket: string, paths: string[]): Promise<number> {
  if (paths.length === 0) return 0;
  const { error } = await admin.storage.from(bucket).remove(paths);
  if (error) {
    logger.error("Account deletion: failed to remove storage objects", {
      userId,
      bucket,
      count: paths.length,
      error: error.message,
      impact: "objects orphaned in storage; account deletion continues",
    });
    return -1;
  }
  logger.info("Account deletion: storage objects removed", { userId, bucket, count: paths.length });
  return paths.length;
}

/**
 * Deletes the user's avatar and chat-attachment objects.
 *
 * Avatars live under `<userId>/`, so they are listed by folder. Chat
 * attachments are keyed by course, so they are found by the object's
 * owner in storage.objects.
 *
 * @param admin - Service-role client
 * @param userId - The user being deleted
 * @returns Per-bucket counts (-1 where a step failed and was logged)
 * @remarks Failures here never block the deletion; they are logged with
 *          enough detail to clean up by hand.
 */
export async function deleteUserStorageObjects(
  admin: SupabaseClient,
  userId: string,
): Promise<{ avatars: number; chatAttachments: number }> {
  let avatars = -1;
  const { data: avatarFiles, error: listError } = await admin.storage.from(AVATARS_BUCKET).list(userId);
  if (listError) {
    logger.error("Account deletion: failed to list avatars", {
      userId,
      error: listError.message,
      impact: "avatar objects orphaned; account deletion continues",
    });
  } else {
    avatars = await removeObjects(
      admin,
      userId,
      AVATARS_BUCKET,
      (avatarFiles ?? []).map((f) => `${userId}/${f.name}`),
    );
  }

  let chatAttachments = -1;
  const { data: owned, error: ownedError } = await admin
    .schema("storage")
    .from("objects")
    .select("name")
    .eq("bucket_id", CHAT_ATTACHMENTS_BUCKET)
    .or(`owner.eq.${userId},owner_id.eq.${userId}`);
  if (ownedError) {
    logger.error("Account deletion: failed to find chat attachments", {
      userId,
      error: ownedError.message,
      impact: "chat attachment objects orphaned; account deletion continues",
    });
  } else {
    chatAttachments = await removeObjects(
      admin,
      userId,
      CHAT_ATTACHMENTS_BUCKET,
      (owned ?? []).map((o) => o.name as string),
    );
  }

  return { avatars, chatAttachments };
}
