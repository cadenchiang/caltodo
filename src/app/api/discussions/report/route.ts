/**
 * POST /api/discussions/report
 *
 * Reports a chat message with a reason. One report per user per message:
 * a repeat is a 409. The snapshot is persisted first (so it survives an
 * unsend), then the admin is emailed via Resend.
 *
 * @param request - JSON body: { messageId: string, reason: ReportReason }
 * @returns { success: true } on success; 400/401/404/409/429/500 on error
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { ADMIN_EMAIL } from "@/lib/admin";
import { REPORT_REASONS, isReportReason, type ReportReason } from "@/lib/chat-report-reasons";

/** Maximum reports per user per hour to prevent abuse. */
const MAX_REPORTS_PER_HOUR = 10;

/**
 * Sends a report notification email to the admin via Resend.
 *
 * @returns Object with success boolean and optional error string
 */
async function sendReportEmail(input: {
  reporterEmail: string;
  messageBody: string;
  messageAuthorId: string;
  messageId: string;
  courseId: string;
  reason: ReportReason;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "RESEND_API_KEY not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "caltodo <noreply@caltodo.me>",
      to: [ADMIN_EMAIL],
      subject: `[caltodo] Message reported: ${REPORT_REASONS[input.reason]}`,
      text: [
        `Reporter: ${input.reporterEmail}`,
        `Reason: ${REPORT_REASONS[input.reason]}`,
        `Message ID: ${input.messageId}`,
        `Course ID: ${input.courseId}`,
        `Author ID: ${input.messageAuthorId}`,
        ``,
        `Message content:`,
        input.messageBody,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    return { success: false, error: `Resend API ${res.status}: ${errorBody}` };
  }
  return { success: true };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`report:${user.id}`, MAX_REPORTS_PER_HOUR, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
  }

  let body: { messageId?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messageId = body.messageId?.trim();
  if (!messageId) {
    return NextResponse.json({ error: "messageId is required" }, { status: 400 });
  }
  if (!isReportReason(body.reason)) {
    return NextResponse.json({ error: "A reason is required" }, { status: 400 });
  }
  const reason = body.reason;

  // author_id is not readable by end users; read the message as admin.
  const admin = createAdminClient();
  const { data: message, error: msgError } = await admin
    .from("chat_messages")
    .select("id, course_id, author_id, body")
    .eq("id", messageId)
    .maybeSingle();

  if (msgError || !message) {
    logger.warn("POST /api/discussions/report: message not found", { messageId, reporterId: user.id, error: msgError?.message });
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Only members of the room may report into it.
  const { data: membership } = await supabase
    .from("course_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", message.course_id)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  if (message.author_id === user.id) {
    return NextResponse.json({ error: "Cannot report your own message" }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("message_reports")
    .select("id")
    .eq("message_id", message.id)
    .eq("reporter_id", user.id)
    .maybeSingle();
  if (existing) {
    logger.info("POST /api/discussions/report: duplicate report ignored", { reporterId: user.id, messageId });
    return NextResponse.json({ error: "You already reported this message" }, { status: 409 });
  }

  const { error: reportInsertError } = await admin.from("message_reports").insert({
    message_id: message.id,
    reporter_id: user.id,
    author_id: message.author_id,
    course_id: message.course_id,
    message_body: message.body,
    reason,
  });

  if (reportInsertError) {
    // The unique index (migration 20260923000002) also catches a race.
    if (reportInsertError.code === "23505") {
      return NextResponse.json({ error: "You already reported this message" }, { status: 409 });
    }
    logger.error("POST /api/discussions/report: failed to persist report", {
      reporterId: user.id,
      messageId,
      cause: reportInsertError.message,
      impact: "report lost; user asked to retry",
    });
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }

  const emailResult = await sendReportEmail({
    reporterEmail: user.email ?? "unknown",
    messageBody: message.body,
    messageAuthorId: message.author_id,
    messageId: message.id,
    courseId: message.course_id,
    reason,
  });
  if (!emailResult.success) {
    logger.error("POST /api/discussions/report: email notification failed", {
      reporterId: user.id,
      messageId,
      cause: emailResult.error,
      impact: "report saved but the admin was not emailed",
    });
  }

  logger.info("POST /api/discussions/report: report submitted", {
    reporterId: user.id,
    messageId,
    reason,
    authorId: message.author_id,
    courseId: message.course_id,
  });

  return NextResponse.json({ success: true });
}
