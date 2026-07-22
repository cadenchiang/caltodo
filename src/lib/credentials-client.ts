/**
 * Session-shared client for GET /api/credentials.
 *
 * On every /app/* mount, four independent callers (TaskContext,
 * useOnboardingStatus, useDismissedModals, CanvasTokenExpiredModal) each fired
 * their own raw `fetch("/api/credentials")` in the same tick — 8 concurrent
 * requests to a slow endpoint (React StrictMode doubles it in dev). Their
 * per-hook caches only populate AFTER a response returns, so they never dedup
 * each other. This module collapses all callers into a single in-flight
 * request + a short shared cache.
 */

type Credentials = Record<string, unknown> | null;

let inflight: Promise<Credentials> | null = null;
let cached: Credentials = null;
let cachedAt = 0;

/** How long a fetched result is reused before a fresh fetch is allowed. */
const TTL_MS = 30_000;

/**
 * Fetches /api/credentials, deduping concurrent callers into one request and
 * serving a recent (<30s) cached result. Never throws — resolves null on error
 * so callers can treat it as "no credentials".
 *
 * @param force - Bypass the cache (use after a write) and refetch.
 */
export function getCredentials(force = false): Promise<Credentials> {
  if (!force && cached && Date.now() - cachedAt < TTL_MS) {
    return Promise.resolve(cached);
  }
  if (inflight) return inflight;

  inflight = fetch("/api/credentials")
    .then((r) => (r.ok ? r.json() : null))
    .then((data: Credentials) => {
      if (data) {
        cached = data;
        cachedAt = Date.now();
      }
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/**
 * Clears the cached credentials so the next getCredentials() refetches.
 * Call after any PUT/POST that mutates the credentials row.
 */
export function invalidateCredentials(): void {
  cached = null;
  cachedAt = 0;
}
