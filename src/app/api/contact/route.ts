/**
 * POST /api/contact
 *
 * Stores a contact form submission in the contact_messages table
 * and sends an email notification via Resend to cadenchiang@berkeley.edu.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/** Maximum message length to prevent abuse. */
const MAX_MESSAGE_LENGTH = 2000;

/** Destination email for contact form notifications. */
const DESTINATION_EMAIL = "cadenchiang@berkeley.edu";

/**
 * Sends an email notification via the Resend API.
 *
 * @param senderName - Name of the person who submitted the form
 * @param senderEmail - Email of the person who submitted the form
 * @param message - The contact form message body
 * @returns Object with success boolean and optional error string
 */
async function sendEmailNotification(
  senderName: string,
  senderEmail: string,
  message: string
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
      to: [DESTINATION_EMAIL],
      subject: `[caltodo] New message from ${senderName || "Anonymous"}`,
      text: `From: ${senderName || "Anonymous"} (${senderEmail})\n\n${message}`,
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

  const { allowed } = rateLimit(`contact:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  // Validate email format if provided
  const email = body.email?.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Store in database
  const { error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      user_id: user.id,
      name: body.name || null,
      email: email || user.email || null,
      message,
    });

  if (insertError) {
    logger.error("POST /api/contact: failed to store message", {
      userId: user.id,
      error: insertError.message,
    });
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  // Send email notification
  const senderEmail = email || user.email || "unknown";
  const emailResult = await sendEmailNotification(
    body.name || "Anonymous",
    senderEmail,
    message
  );

  if (!emailResult.success) {
    logger.error("POST /api/contact: email notification failed", {
      userId: user.id,
      error: emailResult.error,
    });
    // Message is already stored in DB — don't fail the request
  } else {
    logger.info("POST /api/contact: email notification sent", {
      userId: user.id,
    });
  }

  logger.info("POST /api/contact: contact message stored", {
    userId: user.id,
    name: body.name,
  });

  return NextResponse.json({ success: true });
}
