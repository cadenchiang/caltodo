"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IntegrationProvider } from "@/components/settings/IntegrationSettings";
import IntegrationsSection from "@/components/settings/sections/IntegrationsSection";

/**
 * Popup modal that surfaces the full Integrations panel (Google Calendar,
 * Canvas, Gradescope, Pensive, Syllabus) without leaving the calendar.
 * Replaces the old behavior where the "Sync Classes" badge navigated to
 * /app/settings?section=integrations.
 *
 * Closes on Escape and on backdrop click. Content scrolls when the list of
 * integrations exceeds the viewport height.
 */
export default function SyncClassesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 py-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 my-auto animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <IntegrationProvider>
          <IntegrationsSection />
        </IntegrationProvider>
      </div>
    </div>,
    document.body,
  );
}
