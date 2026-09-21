"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Type declarations for Google Identity Services (GIS) library.
 * Loaded dynamically via script tag from accounts.google.com/gsi/client.
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            itp_support?: boolean;
            context?: "signin" | "signup" | "use";
          }) => void;
          prompt: (callback?: (notification: { isSkippedMoment: () => boolean }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

/**
 * Renders Google One Tap sign-in prompt on the landing page (desktop only).
 * Loads the Google Identity Services script, initializes with the app's
 * Google Client ID, and shows the One Tap prompt automatically.
 *
 * On successful credential selection, signs in via Supabase signInWithIdToken,
 * runs the deferred-invite processing the OAuth callback would have run
 * (One Tap never passes through /auth/callback), and redirects to onboarding
 * (new user, with the callback's welcome flag) or inbox (returning user).
 *
 * Not mounted while a session already exists: with auto_select the prompt
 * would otherwise sign an already-signed-in visitor (on /?landing=1) in again.
 *
 * Renders nothing — Google controls the One Tap UI overlay.
 */
export default function GoogleOneTap() {
  const router = useRouter();
  const initializedRef = useRef(false);

  /**
   * Handles the credential response from Google One Tap.
   * Signs in with Supabase using the ID token and redirects.
   *
   * @param response - Contains the Google ID token (JWT credential)
   */
  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        console.error("[GoogleOneTap] signInWithIdToken failed:", error.message);
        router.push("/login");
        return;
      }

      if (data?.user) {
        // One Tap never passes through /auth/callback, so the deferred
        // invite activation the callback does has to happen here. The
        // browser client has set the session cookie by now, so the
        // endpoint sees a real session. Idempotent; a failure is logged and
        // does not block sign-in.
        try {
          const res = await fetch("/api/auth/process-deferred", { method: "POST" });
          if (!res.ok) {
            console.error("[GoogleOneTap] process-deferred failed", {
              status: res.status,
              impact: "deferred invites stay inactive until the next sign-in",
            });
          }
        } catch (err) {
          console.error("[GoogleOneTap] process-deferred request failed", {
            error: err instanceof Error ? err.message : String(err),
            impact: "deferred invites stay inactive until the next sign-in",
          });
        }

        const { data: creds } = await supabase
          .from("integration_credentials")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (creds) {
          router.push("/app/inbox");
        } else {
          // Same flag the callback sets for a first sign-in.
          router.push("/app/onboarding?welcome=1");
        }
      }
    },
    [router]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    // Desktop only — One Tap UI is designed for larger screens
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("[GoogleOneTap] NEXT_PUBLIC_GOOGLE_CLIENT_ID not set, skipping");
      return;
    }

    initializedRef.current = true;
    let cancelled = false;

    // Only prompt visitors who are signed out. The session check is async,
    // so the script is loaded after it rather than before.
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled || session) return;

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (cancelled || !window.google) return;

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredential,
            auto_select: true,
            itp_support: true,
            context: "signin",
          });

          window.google.accounts.id.prompt();
        };
        document.head.appendChild(script);
      })
      .catch((err) => {
        // Unknown session state: not prompting is the safe side.
        console.warn("[GoogleOneTap] session check failed, not prompting", {
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return () => {
      cancelled = true;
      if (window.google) {
        window.google.accounts.id.cancel();
      }
    };
  }, [handleCredential]);

  return null;
}
