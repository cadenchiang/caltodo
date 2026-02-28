/**
 * POST /api/discussions/report
 *
 * Allows authenticated users to report a chat message.
 * Sends an email notification to the admin via Resend with message details.
 *
 * @param request - JSON body: { messageId: string }
 * @returns { success: true } on success; 400/401/404/429/500 on error
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { ADMIN_EMAIL } from "@/lib/admin";

/** Maximum reports per user per hour to prevent abuse. */
const MAX_REPORTS_PER_HOUR = 10;

/**
 * Sends a report notification email to the admin via Resend API.
 *
 * @param reporterEmail - Email of the user submitting the report
 * @param messageBody - Content of the reported message
 * @param messageAuthorId - User ID of the message author
 * @param messageId - ID of the reported message
 * @param courseId - Course/channel the message belongs to
 * @returns Object with success boolean and optional error string
 */
async function sendReportEmail(
  reporterEmail: string,
  messageBody: string,
  messageAuthorId: string,
  messageId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "caltodo <noreply@caltodo.me>",
      to: [ADMIN_EMAIL],
      subject: `[caltodo] Message reported in discussion`,
      text: [
        `Reporter: ${reporterEmail}`,
        `Message ID: ${messageId}`,
        `Course ID: ${courseId}`,
        `Author ID: ${messageAuthorId}`,
        ``,
        `Message content:`,
        messageBody,
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

  let body: { messageId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messageId = body.messageId?.trim();
  if (!messageId) {
    return NextResponse.json({ error: "messageId is required" }, { status: 400 });
  }

  // Fetch the reported message
  const { data: message, error: msgError } = await supabase
    .from("chat_messages")
    .select("id, course_id, author_id, body")
    .eq("id", messageId)
    .single();

  if (msgError || !message) {
    logger.warn("POST /api/discussions/report: message not found", {
      messageId,
      reporterId: user.id,
      error: msgError?.message,
    });
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Prevent self-reporting
  if (message.author_id === user.id) {
    return NextResponse.json({ error: "Cannot report your own message" }, { status: 400 });
  }

  // Persist report snapshot so content survives if the author unsends later
  const { error: reportInsertError } = await supabase
    .from("message_reports")
    .insert({
      message_id: message.id,
      reporter_id: user.id,
      author_id: message.author_id,
      course_id: message.course_id,
      message_body: message.body,
    });

  if (reportInsertError) {
    logger.error("POST /api/discussions/report: failed to persist report", {
      reporterId: user.id,
      messageId,
      error: reportInsertError.message,
    });
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }

  // Send email to admin
  const emailResult = await sendReportEmail(
    user.email ?? "unknown",
    message.body,
    message.author_id,
    message.id,
    message.course_id
  );

  if (!emailResult.success) {
    // Report is already persisted in DB — log the email failure but don't block
    logger.error("POST /api/discussions/report: email notification failed", {
      reporterId: user.id,
      messageId,
      error: emailResult.error,
    });
  }

  logger.info("POST /api/discussions/report: report submitted", {
    reporterId: user.id,
    messageId,
    authorId: message.author_id,
    courseId: message.course_id,
  });

  return NextResponse.json({ success: true });
}
