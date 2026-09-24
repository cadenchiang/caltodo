"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CalendarSync, Settings, ChevronRight } from "lucide-react";
import { useDismissedModals } from "@/hooks/useDismissedModals";

/**
 * Official Google Calendar SVG logo icon.
 * Rendered at 40x40 for the announcement modal header.
 */
function GoogleCalendarLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M152.637 43.363H47.363v109.274h105.274V43.363z" fill="#fff" />
      <path d="M152.637 200L200 152.637h-47.363V200z" fill="#1A73E8" />
      <path d="M200 47.363h-47.363v105.274H200V47.363z" fill="#4285F4" />
      <path d="M152.637 152.637H47.363V200h105.274v-47.363z" fill="#34A853" />
      <path d="M0 152.637v31.576A15.79 15.79 0 0015.789 200H47.363v-47.363H0z" fill="#188038" />
      <path d="M200 47.363V15.789A15.79 15.79 0 00184.211 0H152.637v47.363H200z" fill="#1967D2" />
      <path d="M152.637 0H15.789A15.79 15.79 0 000 15.789V152.637h47.363V47.363h105.274V0z" fill="#4285F4" />
      <path d="M75.207 131.256a24.83 24.83 0 01-10.664-7.59l7.426-6.226a16.727 16.727 0 006.721 5.415 19.89 19.89 0 008.828 2.045c3.418 0 6.39-.843 8.828-2.535a8.06 8.06 0 003.665-6.883 8.352 8.352 0 00-3.828-7.21c-2.551-1.692-5.883-2.535-9.992-2.535h-6.226v-8.992h5.57c3.582 0 6.553-.762 8.91-2.29a7.538 7.538 0 003.5-6.636c0-2.96-1.14-5.25-3.418-6.883-2.278-1.63-5.168-2.453-8.665-2.453-3.254 0-6.062.68-8.418 2.043a14.18 14.18 0 00-5.332 5.25l-7.344-6.062a22.316 22.316 0 019.336-8.336c3.91-1.938 8.336-2.879 13.274-2.879 3.91 0 7.426.68 10.5 2.043a17.278 17.278 0 017.344 5.66 14.04 14.04 0 012.7 8.5 13.39 13.39 0 01-2.7 8.336 16.48 16.48 0 01-7.098 5.414v.574a18.19 18.19 0 018.5 5.906 15.12 15.12 0 013.172 9.648c0 3.664-.926 6.883-2.781 9.648a19.14 19.14 0 01-7.836 6.64c-3.336 1.61-7.18 2.4-11.5 2.4-4.89.082-9.403-.844-13.497-2.863z" fill="#4285F4" />
      <path d="M128.625 73.844l-8.174 6.308-4.84-7.344 16.336-11.746h6.637v72.176h-9.96V73.844z" fill="#4285F4" />
    </svg>
  );
}

/**
 * One-time announcement modal shown on the calendar page to introduce
 * Google Calendar sync integration.
 *
 * **Tracking:** Server-persisted via `dismissed_modals.gcal_announce`
 * with localStorage fallback for instant reads.
 */
export default function GCalAnnouncementModal() {
  const router = useRouter();
  const { isDismissed, dismiss, loaded } = useDismissedModals();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (isDismissed("gcal_announce")) return;
    setVisible(true);
  }, [loaded, isDismissed]);

  /**
   * Dismisses the modal with exit animation and persists to server.
   */
  const handleDismiss = useCallback(() => {
    dismiss("gcal_announce");
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 250);
  }, [dismiss]);

  if (!visible) return null;

  const backdropClass = exiting
    ? "animate-announce-backdrop-out"
    : "animate-announce-backdrop-in";

  const cardClass = exiting
    ? "animate-announce-card-out"
    : "animate-announce-card-in";

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm ${backdropClass}`}
      onClick={handleDismiss}
    >
      <div
        className={`bg-popover rounded-2xl shadow-2xl w-full w-[calc(100%-2rem)] max-w-md p-8 ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-1 w-16 rounded-full bg-foreground" />
        </div>

        {/* Google Calendar logo */}
        <div
          className="mb-4 animate-drop-in"
          style={{ animationDelay: "100ms" }}
        >
          <img src="/gcal-logo.png" alt="Google Calendar" width={40} height={40} />
        </div>

        {/* Title */}
        <h3
          className="text-xl font-semibold text-foreground mb-2 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          google calendar sync
        </h3>

        {/* Description */}
        <p
          className="text-sm text-muted-foreground mb-6 leading-relaxed animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          your google calendar events now show up directly in your cal2do calendar. see classes, meetings, and events alongside your assignments.
        </p>

        {/* Items */}
        <div
          className="mb-8 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          {/* Item 1: Connect Google Calendar — navigates to settings */}
          <button
            type="button"
            onClick={() => { handleDismiss(); router.push("/app/settings?section=integrations"); }}
            className="flex items-center gap-3.5 py-4 border-t border-border w-full text-left rounded-lg hover:bg-accent/50 transition-colors px-1 -mx-1 group"
          >
            <Settings size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">connect your calendar</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                link your google account in settings to start syncing events.
              </p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Item 2: Two-way sync */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border px-1 -mx-1">
            <CalendarSync size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">two-way sync</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                create and manage events directly from the calendar. changes sync back to google calendar.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="flex justify-end animate-drop-in"
          style={{ animationDelay: "360ms" }}
        >
          <button
            onClick={handleDismiss}
            className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-95"
          >
            got it &rarr;
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
