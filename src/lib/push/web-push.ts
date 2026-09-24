/**
 * Server-side Web Push helper.
 *
 * Wraps the `web-push` library with VAPID configuration from env and a
 * single sendPush() entry point used by API routes and the reminder cron.
 *
 * Edge cases:
 *  - 404/410 from the push service means the subscription is gone (user
 *    revoked, browser uninstalled). Caller should delete the row.
 *  - Other errors are logged but do not throw, so a single bad subscription
 *    never aborts a batch.
 */

import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { logger } from "@/lib/logger";

let configured = false;

/**
 * Lazily configures web-push with VAPID details from env. Idempotent.
 *
 * @returns true if VAPID keys are present and configuration succeeded.
 */
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@caltodo.me";
  if (!publicKey || !privateKey) {
    logger.warn("web-push: missing VAPID keys, push disabled");
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

/** Payload shipped to the service worker push event. */
export interface PushPayload {
  /** Notification title shown in the OS banner. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Optional URL the SW navigates to on click; defaults to /app/today. */
  url?: string;
  /** Optional tag — same tag replaces prior notification (no stacking). */
  tag?: string;
}

/** Result of a single push attempt — used by callers to clean up dead subs. */
export interface SendPushResult {
  ok: boolean;
  /** True if the push service reported the subscription is gone (404/410). */
  gone: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Sends a push notification to a single subscription.
 *
 * @param subscription - The Web Push subscription object (endpoint + keys).
 * @param payload - The notification content.
 * @returns A SendPushResult — never throws, so batch loops stay safe.
 */
export async function sendPush(
  subscription: WebPushSubscription,
  payload: PushPayload
): Promise<SendPushResult> {
  if (!ensureConfigured()) {
    return { ok: false, gone: false, error: "VAPID not configured" };
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 60 * 60, // 1 hour — drop if device offline that long
    });
    return { ok: true, gone: false };
  } catch (err) {
    const status =
      err && typeof err === "object" && "statusCode" in err
        ? Number((err as { statusCode: unknown }).statusCode)
        : undefined;
    const message = err instanceof Error ? err.message : String(err);
    const gone = status === 404 || status === 410;
    if (!gone) {
      logger.error("web-push: send failed", { statusCode: status, error: message });
    }
    return { ok: false, gone, statusCode: status, error: message };
  }
}
