/**
 * Deterministic obfuscation for anonymous message author IDs.
 * Replaces real UUIDs with opaque hashes so clients cannot call
 * /api/discussions/profile?userId=X to deanonymize senders.
 *
 * Same (authorId, courseId) always produces the same output,
 * preserving anonymous numbering and message grouping in the UI.
 */

/**
 * FNV-1a hash of a string, returning a 32-bit unsigned integer.
 *
 * @param str - Input string to hash
 * @returns 32-bit unsigned FNV-1a hash
 */
function fnv1a(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return hash >>> 0; // ensure unsigned
}

/**
 * Produces a deterministic opaque identifier for an anonymous author.
 * Uses dual-pass FNV-1a to generate 16 hex characters prefixed with "anon_".
 * Course-scoped: same author in different courses yields different IDs.
 *
 * @param authorId - The real author UUID
 * @param courseId - The course UUID (scoping key)
 * @returns Opaque string like "anon_a1b2c3d4e5f6a7b8"
 */
export function obfuscateAuthorId(authorId: string, courseId: string): string {
  const input = `${authorId}:${courseId}`;
  const hi = fnv1a(input);
  const lo = fnv1a(input + ":salt");
  return `anon_${hi.toString(16).padStart(8, "0")}${lo.toString(16).padStart(8, "0")}`;
}
