"use client";

/**
 * Uploads chat attachments to Supabase Storage.
 *
 * Objects go under `<user_id>/<course_id>/...` so the storage policy
 * (migration 20260923000004) can scope inserts and deletes to the owner's
 * prefix. Images are compressed client-side and run through the NSFW
 * classifier; a flagged image is stored as-is and its URL is prefixed with
 * [sensitive] in the message body so the renderer blurs it.
 *
 * @module chat-upload
 */

import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { classifyImage } from "@/lib/nsfw-check";
import { CHAT_ATTACHMENTS_BUCKET, SENSITIVE_PREFIX } from "@/lib/chat-attachments";

/** Max file size accepted by the composer and the bucket (10 MB). */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
/** MIME types accepted by the composer and the bucket. */
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
/** Max number of attachments per message. */
export const MAX_ATTACHMENTS = 10;

/**
 * Uploads files and returns the body lines that reference them.
 *
 * @param userId - The uploading user (first path segment)
 * @param courseId - The room (second path segment)
 * @param files - Files to upload
 * @returns Public URLs, [sensitive]-prefixed where flagged, in input order
 * @throws Error with a student-readable message when an upload fails
 */
export async function uploadChatFiles(userId: string, courseId: string, files: File[]): Promise<string[]> {
  const supabase = createClient();
  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error(`${file.name} is not a supported file type.`);
    if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 10 MB.`);

    const processed = await compressImage(file);

    let isSensitive = false;
    if (processed.type.startsWith("image/")) {
      const result = await classifyImage(processed);
      isSensitive = result.isSensitive;
    }

    const ext = processed.name.split(".").pop() ?? "bin";
    const path = `${userId}/${courseId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(CHAT_ATTACHMENTS_BUCKET)
      .upload(path, processed, { cacheControl: "3600", upsert: false });
    if (error) {
      throw new Error(`We couldn't upload ${file.name}. Try again.`);
    }
    const { data } = supabase.storage.from(CHAT_ATTACHMENTS_BUCKET).getPublicUrl(path);
    urls.push(isSensitive ? `${SENSITIVE_PREFIX}${data.publicUrl}` : data.publicUrl);
  }
  return urls;
}
