"use client";

/**
 * One-time announcement modal letting users know the Notes feature is
 * being sunset in 30 days. Shows once per account, then never again
 * (server-persisted via useDismissedModals + localStorage cache).
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NotebookPen, X } from "lucide-react";
import { useDismissedModals } from "@/hooks/useDismissedModals";

/** ISO date 30 days from when this announcement is shipping. */
const SUNSET_DATE_LABEL = "in 30 days";

export default function NotesSunsetModal() {
  const { isDismissed, dismiss, loaded } = useDismissedModals();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // Open exactly once: after dismissed-modals state finishes loading and
  // the user hasn't seen this announcement before.
  useEffect(() => {
    if (!loaded) return;
    if (isDismissed("notes_sunset")) return;
    setOpen(true);
  }, [loaded, isDismissed]);

  function handleDismiss() {
    setClosing(true);
    dismiss("notes_sunset");
    // Match the close animation duration so the DOM unmounts after the
    // fade-out finishes rather than snapping away.
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center px-4 ${closing ? "" : "animate-fade-in"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-sunset-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden
      />
      <div
        className={`relative w-full max-w-md rounded-2xl bg-popover border border-border shadow-2xl overflow-hidden ${closing ? "animate-popover-out" : "animate-popover-in"}`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Dismiss announcement"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 mb-4">
            <NotebookPen size={22} className="text-amber-600 dark:text-amber-400" />
          </div>

          <h2 id="notes-sunset-title" className="text-lg font-semibold text-foreground mb-2">
            Notes is going away
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            We&apos;re retiring the Notes feature {SUNSET_DATE_LABEL}. If you have notes you want to keep, please copy them out before then.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;re focusing the app on what students actually use most: assignments, calendar, and chat.
          </p>

          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
