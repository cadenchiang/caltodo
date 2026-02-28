"use client";

import { useState, useCallback, useEffect } from "react";
import { X, EyeOff } from "lucide-react";

/**
 * A single reaction entry with user info for the detail modal.
 */
export interface ReactionDetail {
  userId: string;
  emoji: string;
  userName: string | null;
  userAvatar: string | null;
}

/**
 * Props for the reactions detail modal.
 *
 * @param open - Whether the modal is visible
 * @param reactions - Flat list of reaction entries with user info
 * @param onClose - Fires when user closes the modal
 */
interface ReactionsDetailModalProps {
  open: boolean;
  reactions: ReactionDetail[];
  onClose: () => void;
}

/**
 * Modal showing all users who reacted to a message.
 * Displays each reactor's avatar, name, and the emoji they used.
 * Uses subtle fade + scale entrance animation.
 *
 * @param open - Controls visibility
 * @param reactions - List of { userId, emoji, userName, userAvatar }
 * @param onClose - Fires on X click, backdrop click, or Escape
 */
export default function ReactionsDetailModal({
  open,
  reactions,
  onClose,
}: ReactionsDetailModalProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setExiting(false);
    }
  }, [open]);

  /**
   * Triggers exit animation then fires the close callback.
   */
  const animateOut = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") animateOut();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, animateOut]);

  if (!visible) return null;

  const backdropClass = exiting
    ? "animate-unsend-backdrop-out"
    : "animate-unsend-backdrop-in";

  const cardClass = exiting
    ? "animate-unsend-card-out"
    : "animate-unsend-card-in";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] ${backdropClass}`}
      onClick={animateOut}
    >
      <div
        className={`bg-popover rounded-2xl border border-border shadow-xl w-full max-w-[340px] mx-4 overflow-hidden ${cardClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <button
            onClick={animateOut}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          <h3 className="text-[15px] font-semibold text-foreground">
            Reactions
          </h3>
          {/* Spacer to center the title */}
          <div className="w-7" />
        </div>

        {/* Reaction list */}
        <div className="max-h-[320px] overflow-y-auto">
          {reactions.map((r, i) => (
            <div
              key={`${r.userId}-${r.emoji}-${i}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0"
            >
              {/* Avatar */}
              {r.userAvatar ? (
                <img
                  src={r.userAvatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : r.userName ? (
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium text-muted-foreground shrink-0">
                  {r.userName[0]?.toUpperCase()}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                  <EyeOff size={14} className="text-zinc-500 dark:text-zinc-400" />
                </div>
              )}

              {/* Name */}
              <span className="flex-1 text-[14px] font-medium text-foreground truncate">
                {r.userName ?? "Anonymous"}
              </span>

              {/* Emoji */}
              <span className="text-[18px] shrink-0">{r.emoji}</span>
            </div>
          ))}

          {reactions.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No reactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
