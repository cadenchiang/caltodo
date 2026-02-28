"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTour } from "@/components/ui/AppTour";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

/** localStorage key to permanently dismiss the CalChat announcement. */
const ANNOUNCEMENT_KEY = "calchat_announcement_seen";
/** localStorage key set when user has visited CalChat (via CalChatWelcomeModal). */
const WELCOME_KEY = "calchat_welcome_accepted";

/**
 * Module-level flag to prevent re-showing the modal on component re-mounts
 * within the same page session.
 */
let seenThisSession = false;

/**
 * Checks if the announcement has already been dismissed or is not applicable.
 * Returns true if the modal should NOT be shown.
 *
 * @returns true if already seen, or user has already visited CalChat
 */
function shouldSkip(): boolean {
  if (seenThisSession) return true;
  try {
    if (localStorage.getItem(ANNOUNCEMENT_KEY) === "true") return true;
    if (localStorage.getItem(WELCOME_KEY) === "true") return true;
  } catch {
    return true;
  }
  return false;
}

/**
 * Marks the announcement as permanently dismissed in localStorage.
 */
function markSeen(): void {
  seenThisSession = true;
  try {
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
  } catch {
    /* non-critical */
  }
}

/**
 * One-time announcement modal shown to existing users who haven't tried CalChat yet.
 * Appears once with a 1-second delay, then never again.
 * CTA button navigates to /app/discussions.
 *
 * **Tracking:** Uses localStorage key `calchat_announcement_seen`.
 * Skips if `calchat_welcome_accepted` is already set (user already visited CalChat).
 */
export default function CalChatAnnouncementModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { isActive: isTourActive } = useTour();
  const { hasCompletedOnboarding } = useOnboardingStatus();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isTourActive) return;
    if (!hasCompletedOnboarding) return;
    if (shouldSkip()) return;
    // Skip on onboarding pages
    if (pathname?.startsWith("/app/onboarding")) return;

    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [isTourActive, pathname, hasCompletedOnboarding]);

  /**
   * Dismisses the modal with exit animation.
   */
  const handleDismiss = useCallback(() => {
    markSeen();
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 250);
  }, []);

  /**
   * Navigates to CalChat and dismisses the modal.
   */
  const handleTryCalChat = useCallback(() => {
    markSeen();
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      router.push("/app/discussions");
    }, 250);
  }, [router]);

  if (!visible) return null;

  const backdropClass = exiting
    ? "animate-announce-backdrop-out"
    : "animate-announce-backdrop-in";

  const cardClass = exiting
    ? "animate-announce-card-out"
    : "animate-announce-card-in";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`}
      onClick={handleDismiss}
    >
      <div
        className={`bg-popover rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-6 ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          className="flex justify-center mb-4 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
            <MessageCircle size={28} className="text-[#007AFF]" />
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold text-foreground text-center mb-2 animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          CalChat is here!
        </h3>

        {/* Description */}
        <p
          className="text-sm text-muted-foreground text-center mb-5 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          Chat with your classmates in real time — anonymously or with your name. Give it a try!
        </p>

        {/* CTA button */}
        <div
          className="animate-drop-in"
          style={{ animationDelay: "360ms" }}
        >
          <button
            onClick={handleTryCalChat}
            className="w-full px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95 transition-transform duration-150"
          >
            Try CalChat
          </button>
        </div>

        {/* Dismiss link */}
        <div
          className="animate-drop-in text-center mt-3"
          style={{ animationDelay: "410ms" }}
        >
          <button
            onClick={handleDismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
