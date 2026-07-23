"use client";

import type { User } from "@supabase/supabase-js";
import { createClient } from "./client";

/**
 * Shared, cached, deduped current-user lookup for CLIENT components.
 *
 * Why this exists: `supabase.auth.getUser()` makes a network round-trip to
 * `/auth/v1/user`, AND supabase-js serializes concurrent auth calls behind an
 * internal lock. So when N components each call `getUser()` on mount (the home
 * board alone had TaskContext + useWidgetLayout + HomeBoard + several widgets
 * doing this), they run one-after-another — a production Performance trace
 * showed ~6 sequential calls costing ~1s before the board data even started
 * loading.
 *
 * `getSession()` reads the in-memory / cookie session with no network call.
 * That's safe for client-side needs (scoping queries by user id): RLS enforces
 * security on the server regardless, and the session token is validated
 * server-side by middleware on every navigation. So we resolve the user once
 * from the local session, cache it at module scope, and keep it fresh via
 * onAuthStateChange — turning N serial network calls into one local read.
 *
 * Use this instead of `supabase.auth.getUser()` in client components whenever
 * you just need the current user's identity. Keep using `getUser()` on the
 * server (route handlers, middleware, server components) where token
 * validation is the point.
 */

let cached: User | null | undefined; // undefined = not yet resolved
let inflight: Promise<User | null> | null = null;
let subscribed = false;

function ensureSubscribed(supabase: ReturnType<typeof createClient>): void {
  if (subscribed) return;
  subscribed = true;
  // Keep the cache in lockstep with sign-in / sign-out / token refresh.
  supabase.auth.onAuthStateChange((_event, session) => {
    cached = session?.user ?? null;
  });
}

/**
 * Resolves the current user from the local session (cached + deduped).
 * Returns null when signed out.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (cached !== undefined) return cached;
  if (inflight) return inflight;

  const supabase = createClient();
  ensureSubscribed(supabase);

  inflight = supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      cached = session?.user ?? null;
      return cached;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/**
 * Best-effort synchronous read of the cached user. Returns null if the cache
 * hasn't resolved yet (call getCurrentUser() to populate it). Handy when a
 * component wants the id without awaiting.
 */
export function getCachedUser(): User | null {
  return cached ?? null;
}
