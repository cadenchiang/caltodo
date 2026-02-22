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
  /** Optional progress value (0–100). Shows a thin bar at the bottom of the toast. */
  progress?: number;
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
  progress,
  dismissing,
  onDismiss,
}: ToastProps) {
  const showProgress = typeof progress === "number" && progress < 100;

  return (
    <div className="fixed bottom-36 md:bottom-6 left-0 right-0 z-[200] flex justify-center pointer-events-none px-4">
      <div
        className={`pointer-events-auto relative flex items-center gap-3 rounded-full px-5 py-3 text-sm text-white shadow-lg backdrop-blur-md bg-neutral-800/90 dark:bg-neutral-900/90 overflow-hidden max-w-[calc(100vw-2rem)] ${
          dismissing ? "animate-toast-out" : "animate-toast-in"
        }`}
      >
      <span>{message}</span>

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

      {/* Subtle progress bar at the very bottom */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px]">
          <div
            className="h-full bg-blue-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      </div>
    </div>
  );
}
