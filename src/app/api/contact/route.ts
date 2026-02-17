/**
 * POST /api/contact
 *
 * Stores a contact form submission in the contact_messages table.
 * The destination email (cadenchiang@berkeley.edu) is only used server-side
 * and never exposed to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/** Maximum message length to prevent abuse. */
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      user_id: user.id,
      name: body.name || null,
      email: body.email || user.email || null,
      message,
    });

  if (insertError) {
    logger.error("POST /api/contact: failed to store message", {
      userId: user.id,
      error: insertError.message,
    });
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  logger.info("POST /api/contact: contact message stored", {
    userId: user.id,
    name: body.name,
  });

  return NextResponse.json({ success: true });
}
