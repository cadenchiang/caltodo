"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { authModeForParams, trackAuthError } from "@/lib/auth-analytics";
import { AUTH, BRAND } from "@/lib/copy";
import Button from "@/components/ui/Button";

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
 * Google-only login form.
 * Supports desktop popup and mobile redirect OAuth flows.
 */
export default function LoginForm() {
  const searchParams = useSearchParams();
  // Resolved once, then shared by the OAuth hook and the callback-error
  // effect, so the funnel step and any failure agree on which side of the
  // funnel the user was on.
  const mode = authModeForParams(searchParams);
  const { handleGoogleSignIn, error: oauthError, pending } = useGoogleSignIn(mode);
  const [error, setError] = useState<string | null>(null);
  const [inAppBrowser, setInAppBrowser] = useState(() =>
    typeof navigator !== "undefined" ? isMobileInAppBrowser() : false
  );
  const [copied, setCopied] = useState(false);

  // Mirror the hook's error in both directions, so a retry that clears it
  // in the hook also clears the banner here.
  useEffect(() => {
    setError(oauthError);
  }, [oauthError]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      // Google bounced the user back to /login. The generic copy below is all
      // the user sees, so the raw reason only survives on the event.
      trackAuthError("callback", mode, errorParam);
      setError("Sign-in failed. Please try again.");
    }
  }, [searchParams, mode]);

  /**
   * Starts Google sign-in, clearing any banner from a previous attempt (a
   * callback `?error=` or an earlier popup failure) so the user is not
   * looking at stale text while the new attempt runs.
   */
  function handleRetry() {
    setError(null);
    void handleGoogleSignIn();
  }

  /**
   * Copies the login URL to clipboard and shows a brief "copied" confirmation.
   */
  function handleCopyLink() {
    navigator.clipboard.writeText("https://caltodo.me/login");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* Full-page interstitial for mobile in-app browsers */
  if (inAppBrowser) {
    return (
      <div className="flex flex-col items-center gap-6 w-full text-center">
        <h1 className="text-xl font-bold text-foreground animate-drop-in">
          Thanks for checking out {BRAND}!
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed animate-drop-in delay-100">
          This app uses Google sign-in, which does not work in in-app browsers.
        </p>

        <ol className="w-full text-left bg-muted rounded-xl p-4 space-y-3 animate-drop-in delay-200 list-none m-0">
          <li className="flex items-start gap-3">
            <span aria-hidden="true" className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">1</span>
            <p className="text-sm text-foreground">
              Tap <strong>&#8943;</strong> in the top-right corner
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden="true" className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">2</span>
            <p className="text-sm text-foreground">
              Select <strong>&quot;Open in browser&quot;</strong>
            </p>
          </li>
        </ol>

        <div className="flex items-center gap-3 w-full animate-drop-in delay-300" aria-hidden="true">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="inverted" size="lg" className="w-full animate-drop-in delay-400" onClick={handleCopyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>

        <p className="text-xs text-muted-foreground animate-drop-in delay-500" aria-live="polite">
          Paste it into Safari or Chrome to sign in.
        </p>
      </div>
    );
  }

  const isSignup = mode === "sign_up";
  const heading = isSignup ? "Sign up" : "Welcome back";
  const subheading = isSignup
    ? "Create your caltodo account to get started."
    : "Sign in to pick up where you left off.";
  const buttonLabel = isSignup ? "Sign up with Google" : AUTH.signInWithGoogle;
  const altPromptText = isSignup ? "Already have an account?" : "Don't have an account?";
  const altPromptLink = isSignup ? AUTH.signIn : "Sign up";
  const altPromptHref = isSignup ? "/login" : "/login?signup=true";

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{heading}</h1>
        <p className="text-sm text-muted-foreground mt-1.5">{subheading}</p>
      </div>

      {/* Error message */}
      {error && (
        <div role="alert" className="bg-danger-tint text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Google OAuth button. Disabled with a pending label from the click
          until the popup fails or this window navigates away. */}
      <button
        type="button"
        onClick={handleRetry}
        disabled={pending}
        aria-busy={pending || undefined}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 min-h-11 rounded-xl bg-card border border-input-border text-foreground text-sm font-medium shadow-sm hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {pending ? "Opening Google..." : buttonLabel}
      </button>

      {/* Alt prompt link, padded to a 44px tap target without larger type. */}
      <p className="text-center text-xs text-muted-foreground mt-1">
        {altPromptText}{" "}
        <a
          href={altPromptHref}
          className="inline-flex items-center min-h-11 px-2 -mx-1 font-semibold text-blue-500 hover:text-blue-600 transition-colors rounded"
        >
          {altPromptLink}
        </a>
      </p>
    </div>
  );
}
