/**
 * POST /api/nsfw-check
 *
 * Server-side NSFW image classification endpoint.
 * Accepts multipart/form-data with a single "file" field.
 * Returns NsfwResult JSON with sensitivity flag and scores.
 *
 * Auth required. Rate limited to 30 requests per minute per user.
 * Max file size: 10 MB. Allowed types: jpeg, png, webp, gif.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { classifyImageBuffer } from "@/lib/nsfw-classify-server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`nsfw-check:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 10 MB." },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await classifyImageBuffer(buffer);

    logger.info("POST /api/nsfw-check: classification complete", {
      userId: user.id,
      isSensitive: result.isSensitive,
      nsfwScore: result.nsfwScore,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("POST /api/nsfw-check: unexpected error", {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    // Fail-open: treat as safe on unexpected errors
    return NextResponse.json({
      isSensitive: false,
      nsfwScore: 0,
      predictions: [],
    });
  }
}
