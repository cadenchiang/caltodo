import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Ensures the Supabase Realtime WebSocket connection carries the user's JWT.
 *
 * supabase-js@2.x only propagates the auth token to Realtime on SIGNED_IN
 * and TOKEN_REFRESHED events, but NOT on INITIAL_SESSION (cookie-restored
 * sessions on page load). This helper awaits session initialization, then
 * explicitly calls realtime.setAuth() so RLS-protected subscriptions work.
 *
 * Works in tandem with the onAuthStateChange listener registered in
 * client.ts — this function provides a synchronization point that hooks
 * can await before calling channel.subscribe().
 *
 * Must be called (and awaited) BEFORE any `channel.subscribe()`.
 *
 * @param supabase - The Supabase browser client
 */
export async function ensureRealtimeAuth(supabase: SupabaseClient): Promise<void> {
  try {
    // getSession() internally awaits initializePromise, so by the time it
    // returns the session has been restored from cookies (if available).
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      supabase.realtime.setAuth(session.access_token);
      return;
    }

    // Fallback: getUser() makes a server call which may trigger token refresh.
    // After it completes, getSession() should return the refreshed session.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      if (retrySession?.access_token) {
        supabase.realtime.setAuth(retrySession.access_token);
      }
    }
  } catch (err) {
    console.error("[realtime-auth] ensureRealtimeAuth failed:", err);
  }
}
