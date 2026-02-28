"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useTour } from "@/components/ui/AppTour";

interface CalChatLockedModalProps {
  /** Whether the modal is currently visible. */
  open: boolean;
  /** Called when the user dismisses the modal. */
  onClose: () => void;
}

/**
 * Modal shown when a user tries to access CalChat without completing onboarding.
 * CalChat requires at least one integration (Canvas, Gradescope, or Pensieve)
 * to be configured.
 *
 * When the tour is active, renders without its own backdrop so the tour overlay
 * provides the dimming instead.
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback to close the modal
 */
export default function CalChatLockedModal({ open, onClose }: CalChatLockedModalProps) {
  const router = useRouter();
  const { isActive: isTourActive } = useTour();

  /**
   * Navigates to Settings/Integrations to sync classes.
   */
  const handleSync = useCallback(() => {
    onClose();
    router.push("/app/settings?section=integrations");
  }, [router, onClose]);

  if (!open) return null;

  /** Card content shared between tour and non-tour rendering. */
  const cardContent = (
    <>
      {/* Icon */}
      <div
        className="flex justify-center mb-4 animate-drop-in"
        style={{ animationDelay: "150ms" }}
      >
        <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Lock size={28} className="text-orange-500" />
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-lg font-semibold text-foreground text-center mb-2 animate-drop-in"
        style={{ animationDelay: "220ms" }}
      >
        CalChat is locked
      </h3>

      {/* Description */}
      <p
        className="text-sm text-muted-foreground text-center mb-5 animate-drop-in"
        style={{ animationDelay: "290ms" }}
      >
        Sync your classes to unlock CalChat. Connect bCourses, Gradescope, or Pensieve to get started.
      </p>

      {/* CTA button */}
      <div
        className="animate-drop-in"
        style={{ animationDelay: "360ms" }}
      >
        <button
          onClick={handleSync}
          className="w-full px-4 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95 transition-transform duration-150"
        >
          Sync classes
        </button>
      </div>

      {/* Close link */}
      <div
        className="animate-drop-in text-center mt-3"
        style={{ animationDelay: "410ms" }}
      >
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </>
  );

  // During tour: render without backdrop so tour overlay provides dimming
  if (isTourActive) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div
          id="tour-calchat-page"
          className="bg-popover rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-6 pointer-events-auto animate-announce-card-in"
          onClick={(e) => e.stopPropagation()}
        >
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-announce-backdrop-in"
      onClick={onClose}
    >
      <div
        id="tour-calchat-page"
        className="bg-popover rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-6 animate-announce-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {cardContent}
      </div>
    </div>
  );
}
