/**
 * Daily digest email builder and sender.
 * Generates a polished HTML email showing overdue, today, and tomorrow tasks.
 *
 * @module email-digest
 */

import { Resend } from "resend";
import { logger } from "@/lib/logger";

/** Lazily initialized Resend client. */
let _resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

/** Task shape expected by the digest email builder. */
export interface DigestTask {
  title: string;
  due_date: string | null;
  due_time: string | null;
  course_name: string | null;
  points_possible: number | null;
  source_url: string | null;
}

interface DigestSections {
  overdue: DigestTask[];
  dueToday: DigestTask[];
  dueTomorrow: DigestTask[];
}

/**
 * Sends a daily digest email to a user via Resend.
 *
 * @param email - Recipient email address
 * @param firstName - User's first name for greeting
 * @param sections - Tasks grouped by overdue, today, and tomorrow
 * @returns true if sent successfully, false on error
 */
export async function sendDigestEmail(
  email: string,
  firstName: string,
  sections: DigestSections
): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    logger.warn("sendDigestEmail: RESEND_API_KEY not set, skipping", { email });
    return false;
  }

  const subject = `your daily rundown`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://caltodo.me";
  const fromAddress = process.env.RESEND_FROM_EMAIL || "caltodo <noreply@caltodo.me>";

  try {
    const { error } = await client.emails.send({
      from: fromAddress,
      to: email,
      subject,
      html: buildDigestHtml(firstName, sections, appUrl),
    });

    if (error) {
      logger.error("sendDigestEmail: Resend API error", { email, error: error.message });
      return false;
    }

    logger.info("sendDigestEmail: sent", { email, totalCount });
    return true;
  } catch (err) {
    logger.error("sendDigestEmail: unexpected error", {
      email,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Formats a time string from HH:MM 24h to 12h format.
 *
 * @param time - Time string in HH:MM format or null
 * @returns Formatted time like "11:59 PM" or empty string
 */
function formatTime(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/**
 * Formats a YYYY-MM-DD date to readable format.
 *
 * @param dateStr - ISO date string
 * @returns Formatted date like "Mon, Jan 15"
 */
function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param str - Raw string
 * @returns HTML-safe string
 */
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Builds a single task row for the email.
 *
 * @param task - Task data
 * @param color - Accent color for the left border
 * @param appUrl - Base app URL for links
 * @returns HTML string for one task row
 */
function buildTaskRow(task: DigestTask, color: string, appUrl: string): string {
  const time = formatTime(task.due_time);
  const course = task.course_name ? escapeHtml(task.course_name) : "";
  const points = task.points_possible ? `${task.points_possible} pts` : "";
  const meta = [course, points, time].filter(Boolean).join(" · ");
  const link = task.source_url || `${appUrl}/app/inbox`;

  return `
    <a href="${link}" style="display: block; text-decoration: none; color: inherit; padding: 12px 16px; border-left: 3px solid ${color}; background: #f9f9fb; border-radius: 0 8px 8px 0; margin-bottom: 6px;">
      <div style="font-size: 14px; font-weight: 500; color: #1a1a1a; line-height: 1.4;">
        ${escapeHtml(task.title)}
      </div>
      ${meta ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">${meta}</div>` : ""}
    </a>
  `;
}

/**
 * Builds a section (e.g. "Due Today") with a heading and task rows.
 *
 * @param label - Section heading text
 * @param tasks - Tasks in this section
 * @param color - Accent color
 * @param appUrl - Base app URL
 * @returns HTML string for the section, or empty string if no tasks
 */
function buildSection(label: string, tasks: DigestTask[], color: string, appUrl: string): string {
  if (tasks.length === 0) return "";
  const rows = tasks.map((t) => buildTaskRow(t, color, appUrl)).join("");
  return `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${color}; margin-bottom: 8px;">
        ${label} (${tasks.length})
      </div>
      ${rows}
    </div>
  `;
}

/**
 * Builds the complete digest email HTML.
 *
 * @param firstName - User's first name
 * @param sections - Tasks grouped by urgency
 * @param appUrl - Base app URL
 * @returns Complete HTML email string
 */
function buildDigestHtml(firstName: string, sections: DigestSections, appUrl: string): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const totalCount = sections.overdue.length + sections.dueToday.length + sections.dueTomorrow.length;
  const overdueHtml = buildSection("Overdue", sections.overdue, "#ef4444", appUrl);
  const todayHtml = buildSection("Due Today", sections.dueToday, "#3b82f6", appUrl);
  const tomorrowHtml = buildSection("Due Tomorrow", sections.dueTomorrow, "#8b5cf6", appUrl);
  const preheader = totalCount === 1 ? "1 assignment on deck today." : `${totalCount} assignments on deck today.`;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin: 0; padding: 0; background: #f0f0f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="display: none; max-height: 0; overflow: hidden;">${preheader}&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;</div>
      <div style="max-width: 480px; margin: 0 auto; padding: 32px 16px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="${appUrl}/logo.png" alt="caltodo" style="height: 36px; display: inline-block;" />
        </div>

        <!-- Card -->
        <div style="background: #ffffff; border-radius: 16px; padding: 28px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

          <!-- Greeting -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 20px; font-weight: 700; color: #1a1a1a;">
              Good morning, ${escapeHtml(firstName)}.
            </div>
            <div style="font-size: 13px; color: #999; margin-top: 4px;">
              ${dateStr}
            </div>
          </div>

          <!-- Sections -->
          ${overdueHtml}
          ${todayHtml}
          ${tomorrowHtml}

          <!-- CTA -->
          <a href="${appUrl}/app/inbox" style="display: block; text-align: center; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; margin-top: 8px;">
            Open CalTodo
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 24px;">
          <a href="${appUrl}/app/settings" style="font-size: 12px; color: #999; text-decoration: underline;">
            Manage email preferences
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}
