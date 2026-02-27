/**
 * Email notifications via Resend.
 * Sends invite emails to non-caltodo users when they receive a deferred invite.
 * Includes in-memory rate limiting to prevent spam (max 1 email per recipient per hour).
 *
 * @module email
 */

import { Resend } from "resend";
import { logger } from "@/lib/logger";

/** Lazily initialized Resend client. Returns null if API key is not set. */
let _resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** In-memory rate limit: tracks last email sent time per recipient. */
const emailSentMap = new Map<string, number>();

/** Rate limit window: 1 hour in milliseconds. */
const RATE_LIMIT_MS = 60 * 60 * 1000;

/** Cleanup interval for stale rate limit entries (10 minutes). */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, sentAt] of emailSentMap) {
    if (now - sentAt > RATE_LIMIT_MS) {
      emailSentMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
  cleanupInterval.unref();
}

/**
 * Sends an invite email to a non-caltodo user via Resend.
 * Rate limited to 1 email per unique recipient per hour.
 *
 * @param recipientEmail - Email address to send the invite to
 * @param inviterName - Display name of the person who shared the task
 * @param taskTitle - Title of the shared task
 * @returns true if email was sent (or skipped due to rate limit), false on error
 *
 * @edge_cases
 * - If RESEND_API_KEY is not set, logs a warning and returns false.
 * - If the same recipient was emailed within the last hour, skips silently.
 * - Rate limit prevents spam when inviting same person to multiple tasks.
 */
export async function sendInviteEmail(
  recipientEmail: string,
  inviterName: string,
  taskTitle: string
): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    logger.warn("sendInviteEmail: RESEND_API_KEY not set, skipping email", {
      recipientEmail,
    });
    return false;
  }

  // Rate limit check
  const lastSent = emailSentMap.get(recipientEmail.toLowerCase());
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    logger.info("sendInviteEmail: rate limited, skipping", {
      recipientEmail,
      lastSentAgo: `${Math.round((Date.now() - lastSent) / 1000)}s ago`,
    });
    return true;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://caltodo.me";
  const fromAddress = process.env.RESEND_FROM_EMAIL || "caltodo <noreply@caltodo.me>";

  try {
    const { error } = await client.emails.send({
      from: fromAddress,
      to: recipientEmail,
      subject: `${inviterName} sent you an assignment on caltodo`,
      html: buildInviteEmailHtml(inviterName, taskTitle, appUrl),
    });

    if (error) {
      logger.error("sendInviteEmail: Resend API error", {
        recipientEmail,
        error: error.message,
      });
      return false;
    }

    // Record sent time for rate limiting
    emailSentMap.set(recipientEmail.toLowerCase(), Date.now());

    logger.info("sendInviteEmail: email sent", {
      recipientEmail,
      inviterName,
      taskTitle,
    });

    return true;
  } catch (err) {
    logger.error("sendInviteEmail: unexpected error", {
      recipientEmail,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Builds the HTML body for an invite email.
 *
 * @param inviterName - Display name of the inviter
 * @param taskTitle - Title of the shared task
 * @param appUrl - Base URL of the caltodo application
 * @returns HTML string for the email body
 */
function buildInviteEmailHtml(
  inviterName: string,
  taskTitle: string,
  appUrl: string
): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${appUrl}/logo.png" alt="caltodo" style="height: 40px; display: inline-block;" />
      </div>
      <h2 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px;">
        You have a pending assignment
      </h2>
      <p style="font-size: 15px; color: #4a4a4a; line-height: 1.5; margin: 0 0 8px;">
        <strong>${escapeHtml(inviterName)}</strong> sent you an assignment:
      </p>
      <p style="font-size: 15px; color: #1a1a1a; font-weight: 500; background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin: 0 0 24px;">
        ${escapeHtml(taskTitle)}
      </p>
      <p style="font-size: 14px; color: #6a6a6a; line-height: 1.5; margin: 0 0 24px;">
        Sign up for caltodo to view and accept this invite. You may have more pending invites waiting for you.
      </p>
      <a href="${appUrl}" style="display: inline-block; background: #007AFF; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
        Join caltodo
      </a>
      <p style="font-size: 12px; color: #999; margin-top: 32px;">
        If you didn't expect this email, you can safely ignore it.
      </p>
    </div>
  `;
}

/**
 * Escapes HTML special characters to prevent XSS in email templates.
 *
 * @param str - The string to escape
 * @returns HTML-escaped string
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
