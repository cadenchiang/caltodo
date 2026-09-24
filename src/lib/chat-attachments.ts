/**
 * Chat attachment URLs.
 *
 * Attachments are lines in the message body that are public URLs in the
 * app's own storage bucket. Only those URLs are ever auto-rendered as
 * images (audit H3: a foreign image URL is a tracking pixel that collects
 * viewer IPs); any other URL is shown as a link. This module is pure so
 * the renderer, the notifier preview and the unsend cleanup agree on what
 * an attachment is.
 *
 * @module chat-attachments
 */

/** Storage bucket for chat uploads. */
export const CHAT_ATTACHMENTS_BUCKET = "chat-attachments";

/** Prefix used to mark an image the NSFW classifier flagged. */
export const SENSITIVE_PREFIX = "[sensitive]";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)$/i;
const PDF_EXT = /\.pdf$/i;

/** One parsed line of a message body. */
export type BodyPart =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string; path: string; sensitive: boolean }
  | { kind: "file"; url: string; path: string; name: string };

/**
 * Public URL prefix of the attachments bucket.
 *
 * @param supabaseUrl - The project URL (NEXT_PUBLIC_SUPABASE_URL)
 */
export function attachmentUrlPrefix(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${CHAT_ATTACHMENTS_BUCKET}/`;
}

/**
 * Parses one body line into text, an own-storage image, or an own-storage
 * file. A URL outside the bucket is text (rendered as a link).
 *
 * @param line - One line of the body
 * @param prefix - From attachmentUrlPrefix()
 */
export function classifyLine(line: string, prefix: string): BodyPart {
  const raw = line.trim();
  const sensitive = raw.startsWith(SENSITIVE_PREFIX);
  const candidate = sensitive ? raw.slice(SENSITIVE_PREFIX.length) : raw;
  if (!candidate.startsWith(prefix)) return { kind: "text", text: line };
  let path: string;
  try {
    path = decodeURIComponent(new URL(candidate).pathname.slice(new URL(prefix).pathname.length));
  } catch {
    return { kind: "text", text: line };
  }
  if (IMAGE_EXT.test(path)) return { kind: "image", url: candidate, path, sensitive };
  if (PDF_EXT.test(path)) return { kind: "file", url: candidate, path, name: path.split("/").pop() ?? "file.pdf" };
  return { kind: "text", text: line };
}

/**
 * Splits a message body into renderable parts.
 *
 * @param body - The message body
 * @param prefix - From attachmentUrlPrefix()
 */
export function parseBody(body: string, prefix: string): BodyPart[] {
  return body.split("\n").map((line) => classifyLine(line, prefix));
}

/**
 * Storage object paths referenced by a body, for deletion on unsend.
 *
 * @param body - The message body
 * @param prefix - From attachmentUrlPrefix()
 * @returns Bucket-relative paths, deduped
 */
export function attachmentPaths(body: string, prefix: string): string[] {
  const paths = new Set<string>();
  for (const part of parseBody(body, prefix)) {
    if (part.kind !== "text") paths.add(part.path);
  }
  return Array.from(paths);
}

/**
 * Summarizes a body for previews: text, then "N attachment(s)".
 *
 * @param body - The message body
 * @param prefix - From attachmentUrlPrefix()
 */
export function summarizeAttachments(body: string, prefix: string): string {
  const parts = parseBody(body, prefix);
  const text = parts.filter((p): p is { kind: "text"; text: string } => p.kind === "text").map((p) => p.text).join(" ").trim();
  const count = parts.length - parts.filter((p) => p.kind === "text").length;
  if (text && count > 0) return `${text} + ${count} attachment${count > 1 ? "s" : ""}`;
  if (count > 0) return `${count} attachment${count > 1 ? "s" : ""}`;
  return text;
}
