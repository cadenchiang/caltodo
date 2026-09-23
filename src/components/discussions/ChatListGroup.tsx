"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/**
 * Collapsed group at the bottom of the chat list ("Past classes",
 * "Hidden chats"). Starts collapsed; the toggle is a real button with
 * aria-expanded / aria-controls so it works with a keyboard and a reader.
 *
 * @param label - Group heading
 * @param count - Number of rooms inside, shown beside the label
 * @param children - The rows
 */
export default function ChatListGroup({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <ChevronRight
          size={14}
          className={`text-muted-foreground transition-transform motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        />
        <span>{label}</span>
        <span className="text-muted-foreground">({count})</span>
      </button>
      <div id={panelId} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
