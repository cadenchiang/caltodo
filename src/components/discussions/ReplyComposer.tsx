"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import ChatInput from "./ChatInput";

/**
 * Props for ReplyComposer.
 *
 * @param target - The message being replied to
 * @param targetLabel - Author label ("Alice" or "#3")
 * @param onSend - Sends the reply (body, files, anonymous)
 * @param onCancel - Closes the composer
 * @param sending - Whether a send is in flight
 * @param error - Composer error
 * @param anonymous - Shared anonymous state
 * @param onAnonymousChange - Toggle handler
 * @param onTyping - Typing signal
 */
interface ReplyComposerProps {
  target: ChatMessage;
  targetLabel: string;
  onSend: (body: string, files?: File[], anonymous?: boolean) => void;
  onCancel: () => void;
  sending: boolean;
  error: string | null;
  anonymous: boolean;
  onAnonymousChange: (next: boolean) => void;
  onTyping?: () => void;
}

/**
 * Reply mode: backdrop, the quoted message, a cancel button, and its own
 * composer with initial focus. Escape or the backdrop cancels. The
 * anonymous state is the same one the main composer uses.
 */
export default function ReplyComposer({
  target, targetLabel, onSend, onCancel, sending, error, anonymous, onAnonymousChange, onTyping,
}: ReplyComposerProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-end md:justify-center items-center px-2 md:px-4 bg-black/40 backdrop-blur-sm animate-announce-backdrop-in motion-reduce:animate-none"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={`Reply to ${targetLabel}`}
    >
      <div className="max-w-md w-full mb-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
          <span className="text-[11px] font-medium text-white">Replying to {targetLabel}</span>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel reply"
            className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="rounded-2xl bg-popover px-4 py-3 shadow-xl border border-border max-h-40 overflow-y-auto">
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{target.body}</p>
        </div>
      </div>

      <div className="max-w-md w-full rounded-2xl bg-popover border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
        <ChatInput
          onSend={onSend}
          disabled={sending}
          error={error}
          anonymous={anonymous}
          onAnonymousChange={onAnonymousChange}
          onTyping={onTyping}
          autoFocus
        />
      </div>
    </div>
  );
}
