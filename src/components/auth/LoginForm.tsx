"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

/**
 * Detects if the current browser is an in-app/embedded webview on mobile.
 * Google blocks OAuth from these user agents (error 403: disallowed_useragent).
 *
 * @returns true if running inside LinkedIn, Instagram, Facebook, TikTok,
 *          Snapchat, Twitter, or a generic WebView on a mobile device.
 */
function isMobileInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isInApp = /LinkedIn|FBAN|FBAV|Instagram|TikTok|Snapchat|Twitter|WebView|wv\)/i.test(ua);
  return isMobile && isInApp;
}

/**
 * Google-only login form with @berkeley.edu restriction.
 * Supports desktop popup and mobile redirect OAuth flows.
 * Shows an error if a non-berkeley.edu account attempts to sign in.
 */
export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInAppBrowser(isMobileInAppBrowser());
  }, []);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "berkeley-only") {
      setError("caltodo is currently only available for @berkeley.edu accounts");
    }
  }, [searchParams]);

  /**
   * Copies the login URL to clipboard and shows a brief "copied" confirmation.
   */
  function handleCopyLink() {
    navigator.clipboard.writeText("https://caltodo.me/login");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /**
   * Initiates Google OAuth sign-in via Supabase with @berkeley.edu restriction.
   * Desktop: opens Google consent in a centered popup, polls for completion.
   * Mobile: full-page redirect to Google, then back to /auth/callback.
   * Falls back to redirect if popup is blocked by browser.
   *
   * The hd query param hints Google to only show @berkeley.edu accounts.
   * Server-side validation in /auth/callback enforces this as a hard check.
   */
  async function handleGoogleSignIn() {
    setError(null);
    trackEvent("google_oauth_clicked");
    const supabase = createClient();

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

    if (isDesktop) {
      // Open popup immediately (in the click handler) to avoid browser blocking.
      // Navigating it after the async call preserves the user-gesture trust.
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
          queryParams: { hd: "berkeley.edu", prompt: "select_account" },
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
              queryParams: { hd: "berkeley.edu", prompt: "select_account" },
            },
          });
          return;
        }

        popup.location.href = data.url;

        /**
         * Polls the popup window until it either closes or navigates back to our
         * origin (after the OAuth callback redirect). Once detected, closes the
         * popup and navigates the main window to the destination.
         */
        const pollId = setInterval(async () => {
          try {
            if (!popup || popup.closed) {
              clearInterval(pollId);
              // Popup was closed — check if session was established via shared cookies
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                window.location.href = "/app/inbox";
              }
              return;
            }

            // Reading popup.location.href throws while on external domains (cross-origin).
            // Once the callback redirects back to our origin, this succeeds.
            const popupUrl = popup.location.href;

            if (popupUrl.includes("/app/") || popupUrl.includes("/login")) {
              clearInterval(pollId);
              // Capture destination before closing
              const destination = popupUrl.includes("/app/onboarding")
                ? "/app/onboarding"
                : "/app/inbox";
              popup.close();
              window.location.href = destination;
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
          queryParams: { hd: "berkeley.edu", prompt: "select_account" },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    }
  }

  /* Full-page interstitial for mobile in-app browsers */
  if (inAppBrowser) {
    return (
      <div className="flex flex-col items-center gap-6 w-full text-center">
        <h1 className="text-xl font-bold text-gray-800 animate-drop-in">
          thanks for checking out caltodo!
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed animate-drop-in delay-100">
          this app uses Google sign-in, which doesn&apos;t work in in-app browsers.
        </p>

        <div className="w-full text-left bg-gray-50 rounded-xl p-4 space-y-3 animate-drop-in delay-200">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center">1</span>
            <p className="text-sm text-gray-700">
              Tap <strong>&#8943;</strong> in the top-right corner
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center">2</span>
            <p className="text-sm text-gray-700">
              Select <strong>&quot;Open in browser&quot;</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full animate-drop-in delay-300">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold text-sm animate-drop-in delay-400 active:scale-[0.97] transition-transform"
        >
          {copied ? "copied!" : "copy link"}
        </button>

        <p className="text-xs text-gray-400 animate-drop-in delay-500">
          paste it into Safari or Chrome to sign in
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 animate-drop-in">
          welcome to caltodo
        </h1>
        <p className="text-sm text-gray-500 mt-2 animate-drop-in delay-100">
          all your deadlines, one calendar
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl animate-drop-in">
          {error}
        </div>
      )}

      {/* Google OAuth button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-gray-500 text-sm font-medium animate-drop-in delay-150 btn-elevated-secondary"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
        </svg>
        continue with google
      </button>
    </div>
  );
}
