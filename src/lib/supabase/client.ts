import { createBrowserClient } from "@supabase/ssr";

/**
 * Guard: ensures the Realtime auth listener is registered exactly once.
 * createBrowserClient already returns a singleton, so this flag prevents
 * duplicate onAuthStateChange subscriptions across repeated createClient() calls.
 */
let realtimeAuthListenerRegistered = false;

/**
 * Creates a Supabase client for use in browser/client components.
 *
 * Registers a one-time onAuthStateChange listener that propagates the user's
 * JWT to the Realtime WebSocket on INITIAL_SESSION. supabase-js@2.x only
 * calls realtime.setAuth() on SIGNED_IN and TOKEN_REFRESHED but ignores
 * INITIAL_SESSION, which is the event fired when a session is restored from
 * cookies on page load. Without this, RLS-protected Realtime subscriptions
 * silently receive no events.
 *
 * @returns Supabase browser client instance
 */
export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!realtimeAuthListenerRegistered) {
    realtimeAuthListenerRegistered = true;
    client.auth.onAuthStateChange((event, session) => {
      if (
        (event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED") &&
        session?.access_token
      ) {
        client.realtime.setAuth(session.access_token);
      }
    });
  }

  return client;
}
