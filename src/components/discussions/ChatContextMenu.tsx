"use client";

import { createPortal } from "react-dom";
import { Bell, BellOff, CircleDot, Pin, PinOff, LogOut } from "lucide-react";

/**
 * Props for the ChatContextMenu component.
 *
 * @param position - Viewport coordinates where the menu should appear
 * @param isMuted - Whether the chat is currently muted
 * @param isPinned - Whether the chat is currently pinned
 * @param isSystemCourse - If true, hides Leave Group option
 * @param onMute - Callback when Mute/Unmute is clicked
 * @param onMarkUnread - Callback when Mark as Unread is clicked
 * @param onPin - Callback when Pin/Unpin is clicked
 * @param onLeave - Callback when Leave Group is clicked
 * @param onClose - Callback to dismiss the menu
 */
interface ChatContextMenuProps {
  position: { x: number; y: number };
  isMuted: boolean;
  isPinned: boolean;
  isSystemCourse: boolean;
  onMute: () => void;
  onMarkUnread: () => void;
  onPin: () => void;
  onLeave: () => void;
  onClose: () => void;
}

/** Menu width for viewport clamping. */
const MENU_WIDTH = 180;
/** Menu height estimate for viewport clamping. */
const MENU_HEIGHT = 180;

/**
 * Portal-based right-click context menu for chat rows.
 * Renders to document.body with a full-screen invisible backdrop
 * that catches outside clicks. Clamps position to viewport bounds.
 */
export default function ChatContextMenu({
  position,
  isMuted,
  isPinned,
  isSystemCourse,
  onMute,
  onMarkUnread,
  onPin,
  onLeave,
  onClose,
}: ChatContextMenuProps) {
  // Clamp position so menu stays within viewport
  const x = Math.min(position.x, window.innerWidth - MENU_WIDTH - 8);
  const y = Math.min(position.y, window.innerHeight - MENU_HEIGHT - 8);

  return createPortal(
    <>
      {/* Invisible backdrop to catch outside clicks */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      {/* Menu card */}
      <div
        className="fixed z-50 bg-popover rounded-lg shadow-xl border border-border py-1 min-w-[180px]"
        style={{ top: y, left: x }}
      >
        <button
          onClick={() => { onMute(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
        >
          {isMuted ? <BellOff size={14} /> : <Bell size={14} />}
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={() => { onMarkUnread(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
        >
          <CircleDot size={14} />
          Mark as Unread
        </button>

        <button
          onClick={() => { onPin(); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
        >
          {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          {isPinned ? "Unpin" : "Pin"}
        </button>

        {!isSystemCourse && (
          <>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { onLeave(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut size={14} />
              Leave Group
            </button>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
