"use client";

/**
 * Primes the shared credentials cache with what the server already loaded.
 *
 * Six components ask for /api/credentials on mount. The client module dedupes
 * them into one request, but that request still cannot start until the app
 * has hydrated, ~0.5s after the HTML arrived. The /app layout loads the same
 * row on the server and passes it here, so every consumer's first call is
 * answered from cache and the round trip never happens on load.
 */

import { useLayoutEffect } from "react";
import { seedCredentials } from "@/lib/credentials-client";
import type { IntegrationCredentials } from "@/lib/types";

/**
 * Seeds the cache, rendering nothing.
 *
 * @param credentials - The row as the server loaded it, or null when the
 *                      server could not (the consumers then fetch as before)
 * @remarks A layout effect rather than an effect: React runs every layout
 *          effect in the tree before any passive effect, so the seed lands
 *          before the first consumer's `useEffect` asks for credentials, as
 *          long as this is mounted anywhere in the same tree.
 */
export default function CredentialsSeed({ credentials }: { credentials: IntegrationCredentials | null }) {
  useLayoutEffect(() => {
    if (credentials) seedCredentials(credentials);
  }, [credentials]);
  return null;
}
