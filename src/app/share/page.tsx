"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import Button from "@/components/ui/Button";
import { BRAND } from "@/lib/copy";

/** The text the sms: link pre-fills, shown as a fallback where sms: cannot open. */
export const SHARE_MESSAGE = "Hey, you should try this. It is free for life right now: https://caltodo.me";

/** The sms: URL. Encoded from SHARE_MESSAGE so the two can never drift. */
export const SHARE_SMS_URL = `sms:?body=${encodeURIComponent(SHARE_MESSAGE)}`;

/** How long to wait for Messages before showing the copy fallback. */
export const FALLBACK_AFTER_MS = 1500;

/**
 * Whether this device can plausibly open an sms: link. Desktop browsers
 * without a paired Messages app leave the page sitting on "opening" forever.
 *
 * @param userAgent - navigator.userAgent
 * @returns True for phones and tablets
 */
export function canOpenSms(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}

/**
 * Share page used in email campaigns, where sms: links are blocked. On a
 * phone it opens Messages with the text pre-filled. Anywhere else, or if
 * Messages has not opened after a moment, it shows the text with a copy
 * button instead of "opening" forever.
 */
export default function SharePage() {
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    const mobile = canOpenSms(navigator.userAgent);
    if (mobile) window.location.href = SHARE_SMS_URL;
    // On desktop the fallback is the point; on mobile it is the safety net
    // for a device that has no Messages app.
    const timer = setTimeout(() => setShowFallback(true), mobile ? FALLBACK_AFTER_MS : 0);
    return () => clearTimeout(timer);
  }, []);

  async function copyMessage() {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(SHARE_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[share] clipboard write failed", err);
      setCopyError("Could not copy. Select the text and copy it yourself.");
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-12 bg-white text-black force-light">
      <div className="w-full max-w-md text-center">
        <img src="/logo.png" alt={BRAND} className="h-10 w-auto mx-auto mb-6" />
        {!showFallback ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">Opening Messages...</p>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground mb-2">Share {BRAND}</h1>
            <p className="text-sm text-muted-foreground mb-5">Send this to a friend.</p>
            <blockquote className="rounded-xl border border-border bg-muted p-4 text-left text-sm text-foreground select-all mb-4">
              {SHARE_MESSAGE}
            </blockquote>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="inverted" size="lg" onClick={copyMessage} leadingIcon={copied ? <Check size={16} /> : <Copy size={16} />}>
                {copied ? "Copied" : "Copy message"}
              </Button>
              <a href={SHARE_SMS_URL} className="inline-flex items-center px-5 py-3 min-h-11 text-sm font-medium text-blue-500 hover:text-blue-600 rounded">
                Open in Messages
              </a>
            </div>
            {copyError && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{copyError}</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
