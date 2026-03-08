"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { FolderOpen, FileText, Palette, ChevronRight } from "lucide-react";

/** localStorage key to permanently dismiss the notes welcome modal. */
const WELCOME_KEY = "caltodo_notes_welcome_seen";

/**
 * Module-level flag to prevent re-showing the modal on component re-mounts
 * within the same page session.
 */
let seenThisSession = false;

/**
 * Checks if the notes welcome has already been seen.
 *
 * @returns true if the modal should not be shown
 */
function isAlreadySeen(): boolean {
  if (seenThisSession) return true;
  try {
    return localStorage.getItem(WELCOME_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the notes welcome as permanently seen in localStorage
 * and sets the module-level flag to prevent re-show on re-mount.
 */
function markSeen(): void {
  seenThisSession = true;
  try {
    localStorage.setItem(WELCOME_KEY, "true");
  } catch {
    /* non-critical */
  }
}

/**
 * One-time welcome modal shown when a user first visits the Notes page.
 * Introduces folders, rich text editing, and customization features.
 *
 * **Tracking:** Uses localStorage key `caltodo_notes_welcome_seen`.
 * Once "true", the modal never shows again.
 */
interface NotesWelcomeModalProps {
  /** Callback to create a new note (opens editor). */
  onCreateNote?: () => void;
}

export default function NotesWelcomeModal({ onCreateNote }: NotesWelcomeModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (isAlreadySeen()) return;
    seenThisSession = true;
    setVisible(true);
  }, []);

  /**
   * Dismisses the modal with exit animation and marks as seen.
   */
  const handleDismiss = useCallback(() => {
    markSeen();
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 250);
  }, []);

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
        className={`bg-popover rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-1 w-16 rounded-full bg-foreground" />
        </div>

        {/* Title */}
        <h3
          className="text-xl font-semibold text-foreground mb-2 animate-drop-in"
          style={{ animationDelay: "150ms" }}
        >
          your notes
        </h3>

        {/* Description */}
        <p
          className="text-sm text-muted-foreground mb-6 leading-relaxed animate-drop-in"
          style={{ animationDelay: "220ms" }}
        >
          organize your class notes in one place. folders are automatically created from your synced courses.
        </p>

        {/* Items */}
        <div
          className="mb-8 animate-drop-in"
          style={{ animationDelay: "290ms" }}
        >
          {/* Item 1: Sync classes — navigates to integrations settings */}
          <button
            type="button"
            onClick={() => { handleDismiss(); router.push("/app/settings?section=integrations"); }}
            className="flex items-center gap-3.5 py-4 border-t border-border w-full text-left rounded-lg hover:bg-accent/50 transition-colors px-1 -mx-1 group"
          >
            <FolderOpen size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">sync your classes</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                connect bCourses or Gradescope to create folders automatically.
              </p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Item 2: Rich editing — creates a new note */}
          <button
            type="button"
            onClick={() => { handleDismiss(); onCreateNote?.(); }}
            className="flex items-center gap-3.5 py-4 border-t border-border w-full text-left rounded-lg hover:bg-accent/50 transition-colors px-1 -mx-1 group"
          >
            <FileText size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">start writing</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                rich text with headings, lists, code blocks, images, and more.
              </p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Item 3: Customization — stays on notes page */}
          <div className="flex items-start gap-3.5 py-4 border-t border-border px-1 -mx-1">
            <Palette size={18} className="text-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">make it yours</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                customize folder covers with colors or images. add icons and descriptions.
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
            get started &rarr;
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
