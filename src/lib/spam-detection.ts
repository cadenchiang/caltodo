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

/** Periodically removes expired entries from the store. */
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
 * Resets spam tracking state for a user. Primarily for testing.
 *
 * @param userId - The user ID to reset, or undefined to reset all entries
 */
export function resetSpamState(userId?: string): void {
  if (userId) {
    store.delete(userId);
  } else {
    store.clear();
  }
}
