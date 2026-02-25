/**
 * PUT /api/account/name
 *
 * Updates the current user's display name in auth metadata.
 * Validates name length (1-100 chars after trimming).
 *
 * @param body.name - The new display name
 * @returns 200 with { full_name } on success
 * @returns 400 for invalid input
 * @returns 401 if not authenticated
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`name-update:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();

  if (!name || name.length < 1 || name.length > 100) {
    return NextResponse.json(
      { error: "Name must be 1-100 characters" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (updateError) {
    logger.error("PUT /api/account/name: failed to update name", {
      userId: user.id,
      error: updateError.message,
    });
    return NextResponse.json({ error: "Failed to update name" }, { status: 500 });
  }

  logger.info("PUT /api/account/name: name updated", {
    userId: user.id,
    name,
  });

  return NextResponse.json({ full_name: name });
}
