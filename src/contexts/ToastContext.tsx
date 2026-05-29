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
  /** Visual variant — default (dark) or error (red). */
  variant?: "default" | "error";
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
  /** Visual variant — default (dark) or error (red). */
  variant?: "default" | "error";
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
  /** Updates progress of the most recent toast without replacing it. */
  updateToastProgress: (progress: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 6000;
const DISMISS_ANIMATION_MS = 300;
/** Maximum number of toasts visible at once. Only one toast renders; new toasts replace the current one. */
const MAX_TOASTS = 1;

/**
 * Provides toast notification state and rendering to the component tree.
 * Only one toast is visible at a time; a new toast replaces any existing one immediately.
 *
 * @param children - Child components that can call useToast()
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  /** Clears dismiss timer for a specific toast. */
  const clearTimer = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /** Starts the dismiss animation for a specific toast, then removes it. */
  const dismissToast = useCallback((id: number) => {
    clearTimer(id);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DISMISS_ANIMATION_MS);
  }, [clearTimer]);

  /**
   * Displays a toast notification at the bottom of the screen.
   * Stacks with existing toasts up to MAX_TOASTS.
   *
   * @param message - Text to display in the toast
   * @param options - Optional action button and custom duration
   */
  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = ++idCounter.current;
      const duration = options?.duration ?? DEFAULT_DURATION;
      const hasProgress = typeof options?.progress === "number";

      const newToast: ToastItem = {
        id,
        message,
        action: options?.action,
        duration,
        dismissing: false,
        progress: options?.progress,
        variant: options?.variant,
      };

      setToasts((prev) => {
        // Remove any progress toasts — a new toast means the prior operation finished
        const filtered = prev.filter((t) => {
          if (typeof t.progress === "number") {
            clearTimer(t.id);
            return false;
          }
          return true;
        });
        const next = [...filtered, newToast];
        // Dismiss oldest toasts exceeding the limit
        while (next.length > MAX_TOASTS) {
          const oldest = next.shift();
          if (oldest) clearTimer(oldest.id);
        }
        return next;
      });

      if (!hasProgress) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      } else {
        // Safety: auto-dismiss progress toasts after 60s if never completed
        const safetyTimer = setTimeout(() => dismissToast(id), 60_000);
        timersRef.current.set(id, safetyTimer);
      }
    },
    [clearTimer, dismissToast]
  );

  /**
   * Updates the progress value of the most recent toast without replacing it.
   *
   * @param progress - New progress value (0–100)
   */
  const updateToastProgress = useCallback((progress: number) => {
    setToasts((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      // Auto-dismiss completed progress toasts after a brief delay
      if (progress >= 100) {
        const timer = setTimeout(() => dismissToast(last.id), 600);
        timersRef.current.set(last.id, timer);
      }
      return prev.map((t) => (t.id === last.id ? { ...t, progress } : t));
    });
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, updateToastProgress }}>
      {children}
      <div className="fixed bottom-36 md:bottom-6 left-0 right-0 z-[200] flex justify-center pointer-events-none px-4">
        <div className="relative grid [&>*]:col-start-1 [&>*]:row-start-1 items-end">
          {toasts.map((toast, i) => {
            const depth = toasts.length - 1 - i;
            return (
              <div
                key={toast.id}
                className="transition-all duration-300 ease-out"
                style={{
                  transform: `translateY(${depth * -6}px) scale(${1 - depth * 0.035})`,
                  zIndex: 100 - depth,
                  opacity: Math.max(0.5, 1 - depth * 0.12),
                  transformOrigin: "center bottom",
                }}
              >
                <Toast
                  message={toast.message}
                  action={toast.action}
                  progress={toast.progress}
                  variant={toast.variant}
                  dismissing={toast.dismissing}
                  onDismiss={() => dismissToast(toast.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast notification system.
 * Must be used within a ToastProvider.
 *
 * @returns Object with showToast and updateToastProgress functions
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
