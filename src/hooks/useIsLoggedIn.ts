"use client";

/**
 * Client-side auth check for the landing pages.
 *
 * The marketing pages are statically generated and edge-cached, so they
 * cannot read the session on the server without giving that up. Each page
 * renders its signed-out state first and swaps the calls to action once this
 * resolves, which is only ever the buttons, never layout.
 *
 * @module useIsLoggedIn
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Reports whether the visitor has a Supabase session.
 *
 * @param override - Skips the lookup when the caller already knows. Pass
 *                   undefined (the normal case) to have the hook check.
 * @returns False until the check resolves, then the real answer
 * @remarks Uses getSession rather than getUser: it reads the cached session
 *          without a network round trip, which is all a button label needs.
 *          A stale session only means the visitor lands on the app and is
 *          redirected to sign in, which is where the other branch sends them
 *          anyway.
 */
export function useIsLoggedIn(override?: boolean): boolean {
  const [loggedIn, setLoggedIn] = useState<boolean>(override ?? false);

  useEffect(() => {
    if (override !== undefined) return; // The caller already decided.
    let cancelled = false;

    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) setLoggedIn(!!session);
      })
      .catch(() => {
        // Offline or misconfigured: the signed-out state is the safe default,
        // and it is already what is on screen.
      });

    return () => {
      cancelled = true;
    };
  }, [override]);

  return override ?? loggedIn;
}
