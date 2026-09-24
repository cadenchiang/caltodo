"use client";

import { WifiOff, MessageCircle, Lock } from "lucide-react";

/** Thin banner at the top of the room while the browser is offline. */
export function OfflineBanner() {
  return (
    <div role="status" className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-muted text-foreground border-b border-border">
      <WifiOff size={13} aria-hidden="true" />
      You&apos;re offline. Messages will load again when you reconnect.
    </div>
  );
}

/**
 * Banner for a failed load or send with a retry button.
 *
 * @param message - Plain-language error
 * @param onRetry - Retry handler (omit to show the message only)
 */
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-3 px-3 py-2 text-xs bg-red-500/10 text-red-600 dark:text-red-400 border-b border-border">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 px-2.5 py-1 rounded-lg font-medium hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** Centered empty state for a room with no messages. */
export function EmptyRoomState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <MessageCircle size={22} className="text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">No messages yet</p>
      <p className="text-sm text-muted-foreground">Say hi to your class.</p>
    </div>
  );
}

/** Replaces the composer when the viewer is not a member of the room. */
export function NotMemberState() {
  return (
    <div role="status" className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-muted-foreground bg-card border-t border-border">
      <Lock size={14} aria-hidden="true" />
      You&apos;re not in this chat. It may have been hidden or you may no longer be enrolled.
    </div>
  );
}
