"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { trackAuthSubmitted, trackAuthError, type AuthMode } from "@/lib/auth-analytics";
import { classifyPopupUrl } from "@/lib/oauth-popup";

/** Shown when the callback bounced the popup to /login or no session appeared. */
export const POPUP_ERROR_MESSAGE = "Sign-in failed. Please try again.";

/** How long to wait for the popup's cookies to become visible in this window. */
const SESSION_WAIT_MS = 5000;

/**
 * Reusable hook for Google OAuth sign-in via Supabase.
 * Desktop: opens Google consent in a centered popup, polls for completion.
 * Mobile: full-page redirect to Google, then back to /auth/callback.
 *
 * Emits the funnel step for the handoff (`sign_up_submitted` or
 * `sign_in_submitted`) and `auth_error` on failure, so an abandoned or broken
 * consent screen is visible rather than showing up only as a missing
 * `$identify`.
 *
 * @param mode - Which side of the funnel this button belongs to. Defaults to
 *               "sign_in" so an existing caller that omits it still records a
 *               step instead of silently dropping one.
 * @returns {{ handleGoogleSignIn: () => Promise<void>, error: string | null }}
 *   - handleGoogleSignIn: call from a click handler (must be synchronous user gesture for popup)
 *   - error: OAuth error message, or null
 */
export function useGoogleSignIn(mode: AuthMode = "sign_in") {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    trackEvent("google_oauth_clicked");
    trackAuthSubmitted(mode, "google");
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
        trackAuthError("oauth_start", mode, oauthError.message);
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
         * origin (after the OAuth callback redirect). A landing on /login is the
         * callback's failure branch: the popup is closed, the error is shown
         * here, and nothing navigates. A landing in /app waits for the auth
         * cookies to actually appear in this window's session before
         * navigating; without this, the main window can race ahead of the
         * popup's Set-Cookie write and bounce off the protected route back to
         * /login. It never navigates without a session.
         */
        const pollId = setInterval(async () => {
          try {
            if (!popup || popup.closed) {
              clearInterval(pollId);
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (session) {
                // Bounce through /; the proxy picks /app/home for Pro,
                // /app/inbox for free, respecting hidden_nav_items.
                window.location.href = "/";
              }
              return;
            }

            const outcome = classifyPopupUrl(popup.location.href, window.location.origin);
            if (outcome.kind === "pending") return;
            clearInterval(pollId);

            if (outcome.kind === "error") {
              popup.close();
              trackAuthError("callback", mode, outcome.reason);
              setError(POPUP_ERROR_MESSAGE);
              return;
            }

            // Non-onboarding destinations go through / so the proxy can
            // pick /app/home (Pro) vs /app/inbox (free) per entitlement.
            const destination = outcome.destination;
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
              if (Date.now() - start > SESSION_WAIT_MS) {
                clearInterval(sessionPoll);
                popup.close();
                // The callback landed in the app but this window never saw
                // the session cookie. Navigating anyway would bounce off the
                // protected layout back here, so report it instead.
                console.warn("useGoogleSignIn: popup reached the app but no session appeared", {
                  destination,
                  waitedMs: SESSION_WAIT_MS,
                });
                trackAuthError("callback", mode, "session_not_visible_after_popup");
                setError(POPUP_ERROR_MESSAGE);
              }
            }, 100);
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
        trackAuthError("oauth_start", mode, oauthError.message);
        setError(oauthError.message);
      }
    }
  }, [mode]);

  return { handleGoogleSignIn, error };
}
