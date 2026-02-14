"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

/** Configuration for an optional action button on the toast. */
interface ToastAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  action?: ToastAction;
  dismissing: boolean;
  onDismiss: () => void;
}

/**
 * Pill-shaped toast notification fixed to the bottom-center of the screen.
 * Features a dark blurred backdrop, optional action button, and X dismiss button.
 * Slides up from bottom on enter, slides down on dismiss.
 *
 * @param message - Text content of the toast
 * @param action - Optional action button (e.g. undo) rendered left of the X
 * @param dismissing - Whether the dismiss animation is playing
 * @param onDismiss - Callback to trigger dismissal
 */
export default function Toast({
  message,
  action,
  dismissing,
  onDismiss,
}: ToastProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3 text-sm text-white shadow-lg backdrop-blur-md bg-neutral-800/90 dark:bg-neutral-900/90 ${
          dismissing ? "animate-toast-out" : "animate-toast-in"
        }`}
      >
      <span className="whitespace-nowrap">{message}</span>

      {action && (
        <button
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-medium whitespace-nowrap"
        >
          {action.icon}
          {action.label}
        </button>
      )}

      <button
        onClick={onDismiss}
        className="text-white/60 hover:text-white transition-colors ml-1"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      </div>
    </div>
  );
}
