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
 * On successful credential selection, signs in via Supabase signInWithIdToken
 * and redirects to onboarding (new user) or inbox (returning user).
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
        const { data: creds } = await supabase
          .from("integration_credentials")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (creds) {
          router.push("/app/inbox");
        } else {
          router.push("/app/onboarding");
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

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google) return;

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

    return () => {
      if (window.google) {
        window.google.accounts.id.cancel();
      }
    };
  }, [handleCredential]);

  return null;
}
