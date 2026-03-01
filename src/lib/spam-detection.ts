/**
 * Burst spam detection with escalating timeouts for chat messages.
 * Tracks per-user message timestamps in a sliding window and applies
 * escalating cooldowns when burst thresholds are exceeded.
 *
 * Separate from rate-limit.ts: rate limiting guards against API abuse,
 * while spam detection handles rapid-fire chat UX.
 *
 * @module spam-detection
 */

import { logger } from "@/lib/logger";

/** Maximum messages allowed within the burst window before triggering a timeout. */
const BURST_THRESHOLD = 5;

/** Burst detection window in milliseconds (10 seconds). */
const BURST_WINDOW_MS = 10_000;

/** Timeout durations per strike level in milliseconds. */
const TIMEOUT_DURATIONS_MS: Record<number, number> = {
  1: 30_000,       // 30 seconds
  2: 2 * 60_000,   // 2 minutes
  3: 10 * 60_000,  // 10 minutes
};

/** Time after which strikes reset if no new violations occur (30 minutes). */
const STRIKE_RESET_MS = 30 * 60_000;

/** Cleanup interval for expired entries (60 seconds). */
const CLEANUP_INTERVAL_MS = 60_000;

interface SpamEntry {
  /** Timestamps of recent messages within the burst window. */
  timestamps: number[];
  /** Unix timestamp (ms) until which the user is timed out. 0 = not timed out. */
  timeoutUntil: number;
  /** Number of accumulated burst violations. */
  strikes: number;
  /** Timestamp of the last violation for strike reset tracking. */
  lastViolation: number;
}

/** In-memory store of spam tracking entries keyed by user ID. */
const store = new Map<string, SpamEntry>();

/** Maximum identical messages allowed within the duplicate window before blocking. */
const DUPLICATE_THRESHOLD = 3;

/** Time window for duplicate detection in milliseconds (30 seconds). */
const DUPLICATE_WINDOW_MS = 30_000;

/** Maximum recent messages tracked per user for duplicate detection. */
const DUPLICATE_HISTORY_SIZE = 10;

interface DuplicateEntry {
  /** Normalized message body. */
  body: string;
  /** Timestamp when the message was sent. */
  sentAt: number;
}

/** In-memory store of recent message bodies keyed by user ID. */
const duplicateStore = new Map<string, DuplicateEntry[]>();

/** Periodically removes expired entries from both stores. */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    const isTimedOut = now < entry.timeoutUntil;
    const hasRecentTimestamps = entry.timestamps.some(
      (ts) => now - ts < BURST_WINDOW_MS
    );
    if (!isTimedOut && !hasRecentTimestamps) {
      store.delete(key);
    }
  }
  for (const [key, entries] of duplicateStore) {
    const fresh = entries.filter((e) => now - e.sentAt < DUPLICATE_WINDOW_MS);
    if (fresh.length === 0) {
      duplicateStore.delete(key);
    } else {
      duplicateStore.set(key, fresh);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow Node.js to exit without waiting for the cleanup timer.
if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
  cleanupInterval.unref();
}

/**
 * Checks whether a user is allowed to send a message or is spam-blocked.
 * Tracks message burst frequency and applies escalating timeouts.
 *
 * @param userId - The unique identifier of the user sending the message
 * @returns Object with `allowed` boolean and optional `retryAfter` (seconds until timeout expires)
 *
 * @example
 * ```ts
 * const result = checkSpam("user-123");
 * if (!result.allowed) {
 *   return res.status(429).json({ error: "Slow down", retryAfter: result.retryAfter });
 * }
 * ```
 */
export function checkSpam(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let entry = store.get(userId);

  if (!entry) {
    entry = { timestamps: [], timeoutUntil: 0, strikes: 0, lastViolation: 0 };
    store.set(userId, entry);
  }

  // Reset strikes if no violations in the last 30 minutes
  if (entry.strikes > 0 && entry.lastViolation > 0 && now - entry.lastViolation >= STRIKE_RESET_MS) {
    entry.strikes = 0;
    entry.lastViolation = 0;
  }

  // Check if user is currently timed out
  if (now < entry.timeoutUntil) {
    const retryAfter = Math.ceil((entry.timeoutUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Prune timestamps older than the burst window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < BURST_WINDOW_MS);

  // Record current message timestamp
  entry.timestamps.push(now);

  // Check if burst threshold exceeded
  if (entry.timestamps.length >= BURST_THRESHOLD) {
    entry.strikes += 1;
    entry.lastViolation = now;

    const timeoutMs = TIMEOUT_DURATIONS_MS[Math.min(entry.strikes, 3)] ?? TIMEOUT_DURATIONS_MS[3];
    entry.timeoutUntil = now + timeoutMs;

    // Clear timestamps so they don't carry over after timeout
    entry.timestamps = [];

    const retryAfter = Math.ceil(timeoutMs / 1000);

    logger.warn("Spam detection: user timed out", {
      userId,
      strikes: entry.strikes,
      timeoutSeconds: retryAfter,
    });

    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Normalizes a message body for duplicate comparison.
 * Lowercases and collapses consecutive whitespace into a single space.
 *
 * @param body - The raw message body
 * @returns Normalized string for comparison
 */
function normalizeBody(body: string): string {
  return body.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Checks whether a message is a duplicate of a recently sent message by the same user.
 * Blocks the message if the same normalized text has been sent 3+ times within 30 seconds.
 *
 * @param userId - The unique identifier of the user sending the message
 * @param body - The raw message body to check
 * @returns Object with `allowed` boolean and optional `error` string
 *
 * @example
 * ```ts
 * const result = checkDuplicate("user-123", "Hello world");
 * if (!result.allowed) {
 *   return res.status(429).json({ error: result.error });
 * }
 * ```
 */
export function checkDuplicate(userId: string, body: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const normalized = normalizeBody(body);

  let entries = duplicateStore.get(userId) ?? [];

  // Prune entries outside the duplicate window
  entries = entries.filter((e) => now - e.sentAt < DUPLICATE_WINDOW_MS);

  // Count how many times this exact normalized body appears in the window
  const dupeCount = entries.filter((e) => e.body === normalized).length;

  if (dupeCount >= DUPLICATE_THRESHOLD) {
    logger.warn("Duplicate detection: message blocked", {
      userId,
      duplicateCount: dupeCount,
      windowSeconds: DUPLICATE_WINDOW_MS / 1000,
    });
    return { allowed: false, error: "Duplicate message — please don't repeat yourself" };
  }

  // Record this message and cap history size
  entries.push({ body: normalized, sentAt: now });
  if (entries.length > DUPLICATE_HISTORY_SIZE) {
    entries = entries.slice(-DUPLICATE_HISTORY_SIZE);
  }
  duplicateStore.set(userId, entries);

  return { allowed: true };
}

/**
 * Resets spam tracking state for a user. Primarily for testing.
 *
 * @param userId - The user ID to reset, or undefined to reset all entries
 */
export function resetSpamState(userId?: string): void {
  if (userId) {
    store.delete(userId);
    duplicateStore.delete(userId);
  } else {
    store.clear();
    duplicateStore.clear();
  }
}
