"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Undo2, Smile, CornerUpLeft, Flag } from "lucide-react";

/** iMessage tapback emoji options. */
export const TAPBACK_EMOJI = ["❤️", "👍", "👎", "😂", "‼️", "❓"];

/**
 * Props for MessageToolbar.
 *
 * @param isOwn - Whether the viewer sent the message
 * @param myReactions - Emoji the viewer already reacted with
 * @param onReact - Toggle a reaction
 * @param onReply - Start a reply
 * @param onDelete - Unsend (own messages)
 * @param onReport - Report (others' messages)
 */
interface MessageToolbarProps {
  isOwn: boolean;
  myReactions: Set<string>;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

const ICON_BTN =
  "w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer";

/**
 * Per-message actions: react, reply, and a "..." menu with unsend or
 * report. The parent shows the toolbar on hover, on focus-within, and
 * always on coarse pointers, so every action is reachable by touch and by
 * keyboard. Both popovers close on Escape and outside click.
 */
export default function MessageToolbar({ isOwn, myReactions, onReact, onReply, onDelete, onReport }: MessageToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactPicker, setShowReactPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reactPickerRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click or Escape
  useEffect(() => {
    if (!showMenu && !showReactPicker) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (showMenu && menuRef.current && !menuRef.current.contains(target)) setShowMenu(false);
      if (showReactPicker && reactPickerRef.current && !reactPickerRef.current.contains(target)) setShowReactPicker(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowMenu(false);
        setShowReactPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showMenu, showReactPicker]);

  const menuItems = [
    onReply && { label: "Reply", icon: CornerUpLeft, onClick: onReply, destructive: false },
    isOwn && onDelete && { label: "Unsend", icon: Undo2, onClick: onDelete, destructive: true },
    !isOwn && onReport && { label: "Report", icon: Flag, onClick: onReport, destructive: true },
  ].filter(Boolean) as Array<{ label: string; icon: typeof Undo2; onClick: () => void; destructive: boolean }>;

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {onReact && (
        <div className="relative" ref={reactPickerRef}>
          <button
            type="button"
            onClick={() => setShowReactPicker((v) => !v)}
            className={ICON_BTN}
            aria-label="React"
            aria-haspopup="true"
            aria-expanded={showReactPicker}
          >
            <Smile size={14} aria-hidden="true" />
          </button>
          {showReactPicker && (
            <div
              role="group"
              aria-label="Reactions"
              className={`absolute bottom-8 z-30 bg-popover border border-border rounded-full shadow-lg px-1.5 py-1 flex items-center gap-0.5 animate-popover-in motion-reduce:animate-none ${isOwn ? "right-0" : "left-0"}`}
            >
              {TAPBACK_EMOJI.map((emoji) => {
                const active = myReactions.has(emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(emoji);
                      setShowReactPicker(false);
                    }}
                    aria-label={`React with ${emoji}`}
                    aria-pressed={active}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-base ${
                      active ? "bg-blue-500/15 ring-1 ring-blue-500" : "hover:bg-muted"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {onReply && (
        <button type="button" onClick={onReply} className={ICON_BTN} aria-label="Reply">
          <CornerUpLeft size={14} aria-hidden="true" />
        </button>
      )}

      {menuItems.length > 0 && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className={ICON_BTN}
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={showMenu}
          >
            <MoreHorizontal size={14} aria-hidden="true" />
          </button>
          {showMenu && (
            <div
              role="menu"
              className={`absolute top-8 z-20 bg-popover border border-border rounded-xl shadow-lg py-1 min-w-[140px] animate-popover-in motion-reduce:animate-none ${isOwn ? "right-0" : "left-0"}`}
            >
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    item.onClick();
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-[13px] hover:bg-muted transition-colors cursor-pointer ${
                    item.destructive ? "text-red-500" : "text-foreground"
                  }`}
                >
                  <item.icon size={13} aria-hidden="true" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
