/**
 * POST /api/users/report
 *
 * Allows authenticated users to report another user.
 * Sends an email notification to the admin via Resend with report details.
 *
 * @param request - JSON body: { userId: string, reason?: string }
 * @returns { success: true } on success; 400/401/429/500 on error
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { ADMIN_EMAIL } from "@/lib/admin";

/** Maximum user reports per user per hour to prevent abuse. */
const MAX_REPORTS_PER_HOUR = 5;

/**
 * Sends a user-report notification email to the admin via Resend API.
 *
 * @param reporterEmail - Email of the reporting user
 * @param reportedUserId - User ID being reported
 * @param reason - Optional reason text
 * @returns Object with success boolean and optional error string
 */
async function sendUserReportEmail(
  reporterEmail: string,
  reportedUserId: string,
  reason?: string
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
      subject: `[caltodo] User reported`,
      text: [
        `Reporter: ${reporterEmail}`,
        `Reported User ID: ${reportedUserId}`,
        reason ? `Reason: ${reason}` : `Reason: (none provided)`,
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

  const { allowed } = rateLimit(`user-report:${user.id}`, MAX_REPORTS_PER_HOUR, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
  }

  let body: { userId?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reportedUserId = body.userId?.trim();
  if (!reportedUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Validate the reported id is a UUID so bogus strings can't be emailed.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportedUserId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  // Prevent self-reporting
  if (reportedUserId === user.id) {
    return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
  }

  // Cap the free-text reason so it can't bloat the notification email.
  const reason = body.reason?.trim().slice(0, 1000);
  const emailResult = await sendUserReportEmail(
    user.email ?? "unknown",
    reportedUserId,
    reason
  );

  if (!emailResult.success) {
    logger.error("POST /api/users/report: email notification failed", {
      reporterId: user.id,
      reportedUserId,
      error: emailResult.error,
    });
    return NextResponse.json({ error: "Failed to send report" }, { status: 500 });
  }

  logger.info("POST /api/users/report: report submitted", {
    reporterId: user.id,
    reportedUserId,
  });

  return NextResponse.json({ success: true });
}
