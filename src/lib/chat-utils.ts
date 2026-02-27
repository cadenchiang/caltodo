/**
 * Pure helper functions extracted from ChatSidebar to keep components
 * under 300 lines. All functions are stateless and framework-agnostic.
 */

/** Image file extensions to detect in message body URLs. */
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

/** sessionStorage key prefix for cached chat messages. */
const CACHE_PREFIX = "chat_messages_cache_";

/** sessionStorage key prefix for cached chat members. */
const MEMBERS_CACHE_PREFIX = "chat_members_cache_";

/** Cache time-to-live in milliseconds (5 minutes). */
const CACHE_TTL = 5 * 60_000;

/**
 * Strips parenthetical content from a course name.
 * e.g. "CS 61A (Spring 2026)" → "CS 61A"
 *
 * @param name - Raw course name
 * @returns Cleaned name without parentheses
 */
export function stripParentheses(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Summarizes a message body for preview: replaces image URLs with a label.
 *
 * @param body - The raw message body
 * @returns Human-readable preview string
 */
export function summarizeBody(body: string): string {
  const lines = body.split("\n");
  const textLines: string[] = [];
  let imageCount = 0;
  for (const line of lines) {
    const t = line.trim();
    if (
      (t.startsWith("http://") || t.startsWith("https://")) &&
      (() => {
        try {
          return IMAGE_EXT.test(new URL(t).pathname);
        } catch {
          return false;
        }
      })()
    ) {
      imageCount++;
    } else {
      textLines.push(line);
    }
  }
  const text = textLines.join(" ").trim();
  if (text && imageCount > 0)
    return `${text} · ${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
  if (imageCount > 0)
    return `${imageCount} attachment${imageCount > 1 ? "s" : ""}`;
  return text;
}

/**
 * Formats a timestamp as a relative time string.
 *
 * @param dateStr - ISO date string
 * @returns Short relative time like "now", "2m", "1h", "3d", or formatted date
 */
export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Generates initials for a course name (first letter of first two words).
 *
 * @param name - Course display name
 * @returns 1-2 character initials string
 */
export function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Checks if a fresh sessionStorage cache exists for a course's messages.
 *
 * @param courseId - The course UUID
 * @returns true if a valid (non-expired) cache exists
 */
export function hasFreshCache(courseId: string): boolean {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + courseId);
    if (!raw) return false;
    const entry = JSON.parse(raw);
    return Date.now() - entry.timestamp < CACHE_TTL;
  } catch {
    return false;
  }
}

/**
 * Prefetches messages for a course and stores them in sessionStorage.
 * Fails silently on network or storage errors.
 *
 * @param courseId - The course UUID to prefetch
 */
export async function prefetchMessages(courseId: string): Promise<void> {
  try {
    const res = await fetch(
      `/api/discussions/messages?courseId=${encodeURIComponent(courseId)}&limit=50`
    );
    if (!res.ok) return;
    const data = await res.json();
    const sorted = [...data].reverse();
    sessionStorage.setItem(
      CACHE_PREFIX + courseId,
      JSON.stringify({ messages: sorted.slice(0, 200), timestamp: Date.now() })
    );
  } catch {
    // Silent failure for prefetch
  }
}

/**
 * Prefetches members for a course and stores them in sessionStorage.
 * Skips the fetch if a fresh cache already exists.
 * Fails silently on network or storage errors.
 *
 * @param courseId - The course UUID to prefetch
 */
export async function prefetchMembers(courseId: string): Promise<void> {
  try {
    const existing = sessionStorage.getItem(MEMBERS_CACHE_PREFIX + courseId);
    if (existing) {
      const entry = JSON.parse(existing);
      if (Date.now() - entry.timestamp < CACHE_TTL) return;
    }
    const res = await fetch(
      `/api/discussions/members?courseId=${encodeURIComponent(courseId)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    sessionStorage.setItem(
      MEMBERS_CACHE_PREFIX + courseId,
      JSON.stringify({ members: data, timestamp: Date.now() })
    );
  } catch {
    // Silent failure
  }
}
