"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, X, MoreVertical, Trash2, ExternalLink } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Props for the shared header action bar used in task detail views.
 */
interface TaskActionBarProps {
  /** Called when the edit (pencil) button is clicked. */
  onEdit: () => void;
  /** Called when the delete (trash) button is clicked. Optional. */
  onDelete?: () => void;
  /** Called when the close (X) button is clicked. */
  onClose: () => void;
  /** If provided, shows "Open assignment" in the overflow menu. */
  sourceUrl?: string | null;
}

/**
 * Horizontal row of action buttons for task detail/preview headers.
 * Renders Pencil (edit), three-dot overflow menu (delete + open assignment), and X (close).
 *
 * @param onEdit - Edit button handler
 * @param onDelete - Delete button handler (omit to hide in menu)
 * @param onClose - Close button handler
 * @param sourceUrl - URL for "Open assignment" menu item (omit/null to hide)
 */
export default function TaskActionBar({
  onEdit,
  onDelete,
  onClose,
  sourceUrl,
}: TaskActionBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /** Close menu on outside click. */
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const hasMenuItems = !!onDelete || !!sourceUrl;

  return (
    <div className="flex items-center justify-end gap-1 px-5 pt-4 pb-2">
      <Tooltip label="Edit task">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil size={18} />
        </button>
      </Tooltip>
      {hasMenuItems && (
        <div ref={menuRef} className="relative flex items-center">
          <Tooltip label="More options">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <MoreVertical size={18} />
            </button>
          </Tooltip>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-popover shadow-lg p-1 z-10">
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink size={14} className="text-muted-foreground" />
                  Open assignment
                </a>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Delete task
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <Tooltip label="Close">
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X size={18} />
        </button>
      </Tooltip>
    </div>
  );
}
