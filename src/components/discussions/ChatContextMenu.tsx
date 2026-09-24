"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, BellOff, CircleDot, Pin, PinOff, EyeOff } from "lucide-react";

/**
 * Props for the ChatContextMenu component.
 *
 * @param position - Viewport coordinates where the menu should appear
 * @param isMuted - Whether the chat is currently muted
 * @param isPinned - Whether the chat is currently pinned
 * @param onMute - Callback when Mute/Unmute is clicked
 * @param onMarkUnread - Callback when Mark as unread is clicked
 * @param onPin - Callback when Pin/Unpin is clicked
 * @param onHide - Callback when Hide chat is clicked
 * @param onClose - Callback to dismiss the menu; focus returns to the opener
 */
interface ChatContextMenuProps {
  position: { x: number; y: number };
  isMuted: boolean;
  isPinned: boolean;
  onMute: () => void;
  onMarkUnread: () => void;
  onPin: () => void;
  onHide: () => void;
  onClose: () => void;
}

/** Menu width for viewport clamping. */
const MENU_WIDTH = 180;
/** Menu height estimate for viewport clamping. */
const MENU_HEIGHT = 180;

const ITEM_CLASS =
  "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted focus-visible:bg-muted outline-none transition-colors cursor-pointer";

/**
 * Portal-based menu for a chat row, opened by right-click or the row's
 * "..." button. Renders to document.body behind a full-screen invisible
 * backdrop that catches outside clicks, clamps to the viewport, moves
 * focus to the first item on open, supports arrow keys, and closes on
 * Escape with focus restored to whatever opened it.
 */
export default function ChatContextMenu({
  position,
  isMuted,
  isPinned,
  onMute,
  onMarkUnread,
  onPin,
  onHide,
  onClose,
}: ChatContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Clamp position so menu stays within viewport
  const x = Math.min(position.x, window.innerWidth - MENU_WIDTH - 8);
  const y = Math.min(position.y, window.innerHeight - MENU_HEIGHT - 8);

  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    const first = menuRef.current?.querySelector<HTMLElement>("[role='menuitem']");
    first?.focus();
    return () => {
      openerRef.current?.focus?.();
    };
  }, []);

  /**
   * Keyboard handling for the menu: arrows move, Escape closes.
   */
  function handleKeyDown(e: React.KeyboardEvent) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
  }

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
        aria-hidden="true"
      />
      {/* Menu card */}
      <div
        ref={menuRef}
        role="menu"
        aria-label="Chat options"
        onKeyDown={handleKeyDown}
        className="fixed z-50 bg-popover rounded-xl shadow-lg border border-border py-1 min-w-[180px] animate-popover-in motion-reduce:animate-none"
        style={{ top: y, left: x }}
      >
        <button role="menuitem" onClick={() => { onMute(); onClose(); }} className={ITEM_CLASS}>
          {isMuted ? <BellOff size={14} aria-hidden="true" /> : <Bell size={14} aria-hidden="true" />}
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button role="menuitem" onClick={() => { onMarkUnread(); onClose(); }} className={ITEM_CLASS}>
          <CircleDot size={14} aria-hidden="true" />
          Mark as unread
        </button>

        <button role="menuitem" onClick={() => { onPin(); onClose(); }} className={ITEM_CLASS}>
          {isPinned ? <PinOff size={14} aria-hidden="true" /> : <Pin size={14} aria-hidden="true" />}
          {isPinned ? "Unpin" : "Pin"}
        </button>

        <div className="border-t border-border my-1" role="separator" />
        <button role="menuitem" onClick={() => { onHide(); onClose(); }} className={ITEM_CLASS}>
          <EyeOff size={14} aria-hidden="true" />
          Hide chat
        </button>
      </div>
    </>,
    document.body
  );
}
