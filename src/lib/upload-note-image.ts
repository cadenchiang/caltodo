/**
 * Uploads an image file to Supabase storage for use in notes.
 * Compresses the image first, then uploads to the avatars bucket.
 */

import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";

/** Maximum file size in bytes (10 MB). */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types for note images. */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * Compresses and uploads an image for a note, returning its public URL.
 *
 * @param file - The image File to upload.
 * @param noteId - The note this image belongs to (used in storage path).
 * @returns The public URL of the uploaded image, or null on failure.
 *
 * @edge_cases
 * - Returns null if user is not authenticated.
 * - Returns null if Supabase upload fails (logs error).
 * - Non-compressible file types (e.g. GIF) are uploaded as-is.
 */
export async function uploadNoteImage(
  file: File,
  noteId: string,
): Promise<string | null> {
  try {
    if (file.size > MAX_FILE_SIZE) {
      console.warn("[uploadNoteImage] File too large:", file.size, "bytes (max", MAX_FILE_SIZE, ")");
      return null;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      console.warn("[uploadNoteImage] Invalid MIME type:", file.type);
      return null;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("[uploadNoteImage] No authenticated user");
      return null;
    }

    const compressed = await compressImage(file);
    const ext =
      compressed.type.split("/")[1] === "jpeg"
        ? "jpg"
        : compressed.type.split("/")[1];
    const path = `${user.id}/note-img-${noteId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, compressed, {
        cacheControl: "3600",
        upsert: true,
        contentType: compressed.type,
      });

    if (error) {
      console.error("[uploadNoteImage] Upload failed:", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    return `${urlData.publicUrl}?t=${Date.now()}`;
  } catch (err) {
    console.error("[uploadNoteImage] Unexpected error:", err);
    return null;
  }
}
