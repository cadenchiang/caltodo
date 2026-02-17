/**
 * In-memory rate limiter for API routes.
 *
 * Uses a Map to track request counts per key within sliding windows.
 * Automatically cleans up expired entries every 60 seconds.
 *
 * @module rate-limit
 */

import { logger } from "@/lib/logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** Store of rate limit entries keyed by identifier. */
const store = new Map<string, RateLimitEntry>();

/** Cleanup interval in milliseconds (60 seconds). */
const CLEANUP_INTERVAL_MS = 60_000;

/** Periodically removes expired entries from the store. */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow Node.js to exit without waiting for the cleanup timer.
if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
  cleanupInterval.unref();
}

/**
 * Checks whether a request is allowed under the rate limit.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g. user ID or IP).
 * @param maxRequests - Maximum number of requests allowed within the window.
 * @param windowMs - Duration of the rate limit window in milliseconds.
 * @returns Object with `allowed` boolean indicating if the request should proceed.
 *
 * @example
 * ```ts
 * const { allowed } = rateLimit(`user:${userId}`, 30, 60_000);
 * if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 * ```
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean } {
  const now = Date.now();
  const entry = store.get(key);

  // Window expired or first request — start a new window
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  // Within window — increment and check
  entry.count += 1;

  if (entry.count > maxRequests) {
    logger.warn("Rate limit exceeded", { key, count: entry.count, maxRequests });
    return { allowed: false };
  }

  return { allowed: true };
}
