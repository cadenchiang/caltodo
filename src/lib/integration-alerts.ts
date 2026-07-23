/**
 * Integration failure alerting.
 *
 * When a sync surfaces errors for any integration (Canvas / Gradescope /
 * Pensieve / Brightspace), this emails a bug report to the maintainer via
 * Resend so breakage is visible instead of silent. Best-effort and throttled:
 * it never throws into the caller and it won't spam the same failure.
 *
 * Server-side only.
 */

import { logger } from "@/lib/logger";
import type { SyncResult } from "@/lib/types";

/** Where integration bug reports are sent. */
const ALERT_EMAIL = "cadenchiang@berkeley.edu";

/** Per-instance throttle: don't re-alert the same (user, source, error) within this window. */
const THROTTLE_MS = 6 * 60 * 60 * 1000; // 6 hours
const lastAlerted = new Map<string, number>();

/** Small stable signature for an error list so identical failures dedup. */
function signature(errors: string[]): string {
  return errors.join(" | ").slice(0, 200);
}

/**
 * Sends a single alert email via Resend. Returns false if not configured or
 * the send failed (logged, never thrown).
 */
async function sendAlertEmail(subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "caltodo alerts <noreply@caltodo.me>",
        to: [ALERT_EMAIL],
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      logger.error("integration-alerts: Resend send failed", { status: res.status });
      return false;
    }
    return true;
  } catch (err) {
    logger.error("integration-alerts: Resend send threw", {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Inspects a completed SyncResult and, for every source that reported errors,
 * logs the failure and emails a throttled bug report. Fire-and-forget: call
 * without awaiting so alerting never blocks or breaks the sync response.
 *
 * @param result - The SyncResult returned by runSync
 * @param userId - The user whose sync produced these errors
 */
export async function reportSyncFailures(result: SyncResult, userId: string): Promise<void> {
  const sources: Array<["canvas" | "gradescope" | "pensieve" | "brightspace", string[]]> = [
    ["canvas", result.canvas?.errors ?? []],
    ["gradescope", result.gradescope?.errors ?? []],
    ["pensieve", result.pensieve?.errors ?? []],
    ["brightspace", result.brightspace?.errors ?? []],
  ];

  for (const [source, errors] of sources) {
    if (!errors.length) continue;

    // Always log for server-side visibility (wrangler/vercel logs, Sentry).
    logger.error("integration sync reported errors", { userId, source, errors });

    // Throttle the email so a persistently-failing integration doesn't spam.
    const key = `${userId}:${source}:${signature(errors)}`;
    const now = Date.now();
    const last = lastAlerted.get(key) ?? 0;
    if (now - last < THROTTLE_MS) continue;
    lastAlerted.set(key, now);

    const subject = `[caltodo] ${source} sync failed`;
    const body =
      `Integration: ${source}\n` +
      `User: ${userId}\n` +
      `When: ${new Date(now).toISOString()}\n\n` +
      `Errors:\n- ${errors.join("\n- ")}`;
    await sendAlertEmail(subject, body);
  }
}
