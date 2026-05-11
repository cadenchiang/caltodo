"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

/**
 * Reusable hook for Google OAuth sign-in via Supabase.
 * Desktop: opens Google consent in a centered popup, polls for completion.
 * Mobile: full-page redirect to Google, then back to /auth/callback.
 *
 * @returns {{ handleGoogleSignIn: () => Promise<void>, error: string | null }}
 *   - handleGoogleSignIn: call from a click handler (must be synchronous user gesture for popup)
 *   - error: OAuth error message, or null
 */
export function useGoogleSignIn() {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    trackEvent("google_oauth_clicked");
    const supabase = createClient();

    const isDesktop =
      typeof window !== "undefined" && window.innerWidth >= 768;

    if (isDesktop) {
      // Open popup immediately (in the click handler) to avoid browser blocking.
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        "about:blank",
        "google-auth",
        `width=${width},height=${height},left=${left},top=${top},popup=true`
      );

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
          queryParams: { prompt: "select_account" },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        popup?.close();
        return;
      }

      if (data?.url) {
        if (!popup || popup.closed) {
          // Popup was closed before URL was ready — fall back to full redirect
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: { prompt: "select_account" },
            },
          });
          return;
        }

        popup.location.href = data.url;

        /**
         * Polls the popup window until it either closes or navigates back to our
         * origin (after the OAuth callback redirect). Once detected, waits for
         * the auth cookies to actually appear in the main window's session before
         * navigating — without this, the main window can race ahead of the
         * popup's Set-Cookie write and bounce off the protected route back to
         * /login.
         */
        const pollId = setInterval(async () => {
          try {
            if (!popup || popup.closed) {
              clearInterval(pollId);
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (session) {
                // Bounce through /; middleware picks /app/home for Pro,
                // /app/inbox for free, respecting hidden_nav_items.
                window.location.href = "/";
              }
              return;
            }

            const popupUrl = popup.location.href;

            if (popupUrl.includes("/app/") || popupUrl.includes("/login")) {
              clearInterval(pollId);
              // Non-onboarding destinations go through / so middleware can
              // pick /app/home (Pro) vs /app/inbox (free) per entitlement.
              const destination = popupUrl.includes("/app/onboarding")
                ? "/app/onboarding"
                : "/";

              // Wait for the popup's Set-Cookie write to land before navigating.
              // We re-check getSession() until it resolves with a session, up to
              // ~3s. Without this, the main window's request to /app/* arrives
              // without cookies and the layout bounces it to /login.
              const start = Date.now();
              const sessionPoll = setInterval(async () => {
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                if (session) {
                  clearInterval(sessionPoll);
                  popup.close();
                  window.location.href = destination;
                  return;
                }
                if (Date.now() - start > 3000) {
                  clearInterval(sessionPoll);
                  popup.close();
                  // Fall back: go anyway. Layout will handle re-auth if needed.
                  window.location.href = destination;
                }
              }, 100);
            }
          } catch {
            // Cross-origin — popup is still on Google/Supabase domain, keep polling
          }
        }, 300);
      }
    } else {
      // Mobile: use full-page redirect
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    }
  }, []);

  return { handleGoogleSignIn, error };
}
