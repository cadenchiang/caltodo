"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import Toast from "@/components/ui/Toast";

/** Configuration for an optional action button on a toast. */
interface ToastAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

/** Options passed to showToast. */
interface ToastOptions {
  action?: ToastAction;
  duration?: number;
  /** Optional progress value (0–100). Prevents auto-dismiss while < 100. */
  progress?: number;
}

/** Internal representation of a single toast notification. */
interface ToastItem {
  id: number;
  message: string;
  action?: ToastAction;
  duration: number;
  dismissing: boolean;
  /** Optional progress value (0–100). */
  progress?: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
  /** Updates progress of the current toast without replacing it. */
  updateToastProgress: (progress: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 6000;
const DISMISS_ANIMATION_MS = 300;

/**
 * Provides toast notification state and rendering to the component tree.
 * Shows one toast at a time; new toasts replace the current one.
 * Auto-dismisses after the configured duration (default 4s).
 *
 * @param children - Child components that can call useToast()
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const idCounter = useRef(0);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clears any pending auto-dismiss and animation timers. */
  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  /** Starts the dismiss animation, then removes the toast after animation completes. */
  const dismissToast = useCallback(() => {
    clearDismissTimer();
    setToast((prev) => (prev ? { ...prev, dismissing: true } : null));
    animationTimerRef.current = setTimeout(() => setToast(null), DISMISS_ANIMATION_MS);
  }, [clearDismissTimer]);

  /**
   * Displays a toast notification at the bottom of the screen.
   * Replaces any currently visible toast.
   *
   * @param message - Text to display in the toast
   * @param options - Optional action button and custom duration
   */
  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      clearDismissTimer();
      const id = ++idCounter.current;
      const duration = options?.duration ?? DEFAULT_DURATION;
      const hasProgress = typeof options?.progress === "number";

      setToast({
        id,
        message,
        action: options?.action,
        duration,
        dismissing: false,
        progress: options?.progress,
      });

      // Don't auto-dismiss while progress is active
      if (!hasProgress) {
        dismissTimerRef.current = setTimeout(() => {
          dismissToast();
        }, duration);
      }
    },
    [clearDismissTimer, dismissToast]
  );

  /**
   * Updates the progress value of the current toast without replacing it.
   * Does not restart the dismiss timer.
   *
   * @param progress - New progress value (0–100)
   */
  const updateToastProgress = useCallback((progress: number) => {
    setToast((prev) => (prev ? { ...prev, progress } : null));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, updateToastProgress }}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          action={toast.action}
          progress={toast.progress}
          dismissing={toast.dismissing}
          onDismiss={dismissToast}
        />
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast notification system.
 * Must be used within a ToastProvider.
 *
 * @returns Object with showToast function
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
