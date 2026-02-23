/**
 * POST /api/account/avatar
 *
 * Uploads a profile picture to Supabase Storage (avatars bucket),
 * updates the user's auth metadata with the new avatar URL,
 * and returns the public URL.
 *
 * Accepts multipart/form-data with a single "file" field.
 * Max file size: 2 MB. Allowed types: image/jpeg, image/png, image/webp.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`avatar-upload:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 2 MB." },
      { status: 400 }
    );
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filePath = `${user.id}/avatar.${ext}`;

  // Upload to Supabase Storage (upsert overwrites existing)
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    logger.error("POST /api/account/avatar: upload failed", {
      userId: user.id,
      error: uploadError.message,
    });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Append timestamp to bust caches
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  // Update user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (updateError) {
    logger.error("POST /api/account/avatar: metadata update failed", {
      userId: user.id,
      error: updateError.message,
    });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  logger.info("POST /api/account/avatar: avatar updated", { userId: user.id });

  return NextResponse.json({ avatar_url: avatarUrl });
}
