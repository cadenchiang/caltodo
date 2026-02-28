"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

/** localStorage keys for tour state. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";
const TOUR_COMPLETED_KEY = "caltodo_tour_completed";

/** Padding around highlighted element in px. */
const HIGHLIGHT_PAD = 8;
/** Width of the tour content card in px. */
const CARD_WIDTH = 280;
/** Max time to wait for a target element to appear after navigation (ms). */
const TARGET_WAIT_TIMEOUT = 3000;

type TourPosition = "top" | "bottom" | "left" | "right";

export interface TourStep {
  /** ID of the DOM element to highlight. */
  targetId: string;
  /** Step title text. */
  title: string;
  /** Optional icon rendered before the title. */
  icon?: React.ReactNode;
  /** Step description text. */
  description: string;
  /** Preferred position of the content card relative to the target. */
  position?: TourPosition;
  /** Route to navigate to before showing this step (e.g. "/app/calendar"). */
  route?: string;
  /** Called when this step becomes active (e.g. to open a dropdown). */
  onEnter?: () => void;
  /** Called when leaving this step (e.g. to close a dropdown). */
  onExit?: () => void;
  /** ID of an intermediate element to animate a "click" on before showing this step's target. */
  clickTargetId?: string;
  /** Sequence of element IDs to animate clicks on. Each is highlighted, pulsed, then the next fires. Overrides clickTargetId. */
  clickSequence?: Array<{ targetId: string; action?: () => void }>;
  /** Optional secondary element to include in the highlight area (e.g. a dropdown opened by onEnter). */
  secondaryTargetId?: string;
}

interface TourContextValue {
  /** Whether the tour is currently active (showing steps). */
  isActive: boolean;
  /** Start the tour from step 0. */
  startTour: () => void;
  /** End the tour early. */
  endTour: () => void;
  /** Whether the tour has been completed before. */
  isCompleted: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

/**
 * Hook to access tour context from child components.
 * @returns TourContextValue with isActive, startTour, endTour, isCompleted
 * @throws Error if used outside TourProvider
 */
export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}

interface TourProviderProps {
  children: React.ReactNode;
  /** Tour step definitions. */
  steps: TourStep[];
  /** Called when the tour finishes (all steps or skipped). */
  onComplete?: () => void;
}

/**
 * Computes the content card position relative to the highlighted element.
 *
 * @param rect - Bounding rect of the highlighted element
 * @param position - Preferred position
 * @returns CSS top/left values for the card
 */
function computeCardPosition(
  rect: DOMRect,
  position: TourPosition = "bottom",
): { top: number; left: number } {
  const gap = HIGHLIGHT_PAD + 12;
  let top = 0;
  let left = 0;

  switch (position) {
    case "bottom":
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
      break;
    case "top":
      top = rect.top - gap - 160;
      left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
      break;
    case "right":
      top = rect.top + rect.height / 2 - 80;
      left = rect.right + gap;
      break;
    case "left":
      top = rect.top + rect.height / 2 - 80;
      left = rect.left - gap - CARD_WIDTH;
      break;
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, window.innerWidth - CARD_WIDTH - 12));
  top = Math.max(12, Math.min(top, window.innerHeight - 200));

  return { top, left };
}

/**
 * Computes the union bounding rect of two DOMRects.
 *
 * @param a - First rect
 * @param b - Second rect
 * @returns A DOMRect covering both inputs
 */
function unionRects(a: DOMRect, b: DOMRect): DOMRect {
  const top = Math.min(a.top, b.top);
  const left = Math.min(a.left, b.left);
  const right = Math.max(a.right, b.right);
  const bottom = Math.max(a.bottom, b.bottom);
  return new DOMRect(left, top, right - left, bottom - top);
}

/**
 * Waits for a DOM element by ID, polling until found or timeout.
 *
 * @param targetId - DOM element ID to wait for
 * @param timeout - Max time to wait in ms
 * @returns The element or null if not found within timeout
 */
function waitForElement(targetId: string, timeout: number): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const el = document.getElementById(targetId);
    if (el) return resolve(el);

    const start = Date.now();
    const interval = setInterval(() => {
      const found = document.getElementById(targetId);
      if (found) {
        clearInterval(interval);
        resolve(found);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

/**
 * TourProvider manages the app tour lifecycle and renders the overlay.
 * Supports cross-page navigation — each step can specify a route to navigate
 * to before highlighting the target element. Auto-scrolls targets into view.
 *
 * @param steps - Array of TourStep definitions
 * @param onComplete - Optional callback when tour finishes
 * @param children - App content to render below the tour
 */
export function TourProvider({ children, steps, onComplete }: TourProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(-1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [isClickAnimating, setIsClickAnimating] = useState(false);
  const rafRef = useRef<number | null>(null);
  /** Ref to read current pathname without re-creating activateStep on navigation. */
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  /** Monotonic counter to abort stale activateStep invocations. */
  const activationIdRef = useRef(0);

  // Check if tour was already completed
  useEffect(() => {
    try {
      if (localStorage.getItem(TOUR_COMPLETED_KEY) === "true") {
        setIsCompleted(true);
      }
    } catch {
      /* non-critical */
    }
  }, []);

  // Listen for restart-tour event — resets completed state so dialog can show
  useEffect(() => {
    function handleRestart() {
      setIsCompleted(false);
    }
    window.addEventListener("caltodo-restart-tour", handleRestart);
    return () => window.removeEventListener("caltodo-restart-tour", handleRestart);
  }, []);

  /** Updates target rect and card position on resize/scroll. */
  const updatePosition = useCallback(() => {
    if (currentStep < 0 || currentStep >= steps.length) return;
    if (isClickAnimating) return;
    const step = steps[currentStep];
    const el = document.getElementById(step.targetId);
    if (!el) return;
    let rect = el.getBoundingClientRect();
    if (step.secondaryTargetId) {
      const secondaryEl = document.getElementById(step.secondaryTargetId);
      if (secondaryEl) {
        rect = unionRects(rect, secondaryEl.getBoundingClientRect());
      }
    }
    setTargetRect(rect);
    setCardPos(computeCardPosition(rect, step.position));
  }, [currentStep, steps, isClickAnimating]);

  /**
   * Navigates to the step's route (if needed), waits for the target element,
   * scrolls it into view, then positions the spotlight.
   * When clickTargetId is set, runs an intermediate click animation on that
   * element before proceeding to the final target.
   */
  const activateStep = useCallback(async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    const myId = ++activationIdRef.current;
    const isStale = () => activationIdRef.current !== myId;
    const step = steps[stepIndex];
    const needsNavigation = step.route && pathnameRef.current !== step.route;

    // ── Multi-click animation sequence ──
    const clickTargets = step.clickSequence
      || (step.clickTargetId ? [{ targetId: step.clickTargetId }] : null);

    if (clickTargets) {
      setIsClickAnimating(true);
      setCardPos(null);

      for (let i = 0; i < clickTargets.length; i++) {
        if (isStale()) return;
        const ct = clickTargets[i];

        // Wait for the click target element to appear
        const clickEl = await waitForElement(ct.targetId, TARGET_WAIT_TIMEOUT);
        if (isStale()) return;
        if (!clickEl) {
          // Error recovery: skip this broken step instead of getting stuck
          console.warn(`[AppTour] Click target "${ct.targetId}" not found, skipping step ${stepIndex}`);
          setIsClickAnimating(false);
          setCurrentStep((prev) => {
            if (prev >= steps.length - 1) return -1;
            return prev + 1;
          });
          return;
        }

        // Scroll click target into view if off-screen (prevents layout jump later)
        const clickElRect = clickEl.getBoundingClientRect();
        const clickVisible = clickElRect.top >= 0 && clickElRect.bottom <= window.innerHeight;
        if (!clickVisible) {
          clickEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          await new Promise((r) => setTimeout(r, 200));
          if (isStale()) return;
        }

        // Position highlight on the click target (re-read rect after possible scroll)
        const clickRect = clickEl.getBoundingClientRect();
        setTargetRect(clickRect);

        // Let highlight slide into position
        await new Promise((r) => setTimeout(r, 600));
        if (isStale()) return;

        // Add pulse class to the click target element
        clickEl.classList.add("tour-click-pulse");
        await new Promise((r) => setTimeout(r, 500));
        clickEl.classList.remove("tour-click-pulse");
        if (isStale()) return;

        // Fire this click target's action (e.g. open a dropdown)
        ct.action?.();

        // Pause so user can see what was "clicked"
        await new Promise((r) => setTimeout(r, 400));
        if (isStale()) return;
      }

      // Fire onEnter (e.g. switch view mode) and navigate if needed
      step.onEnter?.();
      if (needsNavigation) {
        router.push(step.route!);
      }

      // Let side effects settle
      await new Promise((r) => setTimeout(r, 400));
      if (isStale()) return;

      // Wait for the final target element
      const finalEl = await waitForElement(step.targetId, TARGET_WAIT_TIMEOUT);
      if (isStale()) return;
      if (!finalEl) {
        // Error recovery: skip this broken step instead of getting stuck
        console.warn(`[AppTour] Final target "${step.targetId}" not found, skipping step ${stepIndex}`);
        setIsClickAnimating(false);
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) return -1;
          return prev + 1;
        });
        return;
      }

      // Position on the final target without scrolling — the click sequence
      // already ensured the relevant area is in view
      const settledRect = finalEl.getBoundingClientRect();
      setTargetRect(settledRect);
      setCardPos(computeCardPosition(settledRect, step.position));
      setIsClickAnimating(false);
      return;
    }

    // ── Standard step activation (no click animation) ──

    // Navigate if the step requires a different route
    if (needsNavigation) {
      setNavigating(true);
      setTargetRect(null);
      setCardPos(null);
      router.push(step.route!);
      // Wait for navigation to complete before looking for the element
      await new Promise((r) => setTimeout(r, 300));
      if (isStale()) return;
    }

    // Wait for the target element to appear in the DOM
    const el = await waitForElement(step.targetId, TARGET_WAIT_TIMEOUT);
    if (isStale()) return;
    setNavigating(false);

    if (!el) {
      // Error recovery: skip this broken step instead of getting stuck
      console.warn(`[AppTour] Target "${step.targetId}" not found, skipping step ${stepIndex}`);
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) return -1;
        return prev + 1;
      });
      return;
    }

    // Scroll into view only if the element is completely off-screen
    const rect = el.getBoundingClientRect();
    const completelyOffScreen = rect.bottom < 0 || rect.top > window.innerHeight;
    if (completelyOffScreen) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      await new Promise((r) => setTimeout(r, 200));
      if (isStale()) return;
    }

    // Fire onEnter callback (e.g. switch view mode)
    step.onEnter?.();

    // Brief settle only when needed (navigation or onEnter side effects)
    if (step.onEnter || needsNavigation) {
      await new Promise((r) => setTimeout(r, 150));
      if (isStale()) return;
    }

    // For large elements that extend beyond viewport, clamp the highlight
    // to the visible portion to avoid glitchy shifts
    let finalRect = el.getBoundingClientRect();

    // Merge secondary target (e.g. dropdown opened by onEnter)
    if (step.secondaryTargetId) {
      const secondaryEl = await waitForElement(step.secondaryTargetId, 500);
      if (isStale()) return;
      if (secondaryEl) {
        finalRect = unionRects(finalRect, secondaryEl.getBoundingClientRect());
      }
    }

    let clampedRect = new DOMRect(
      finalRect.x,
      Math.max(finalRect.y, 0),
      finalRect.width,
      Math.min(finalRect.bottom, window.innerHeight) - Math.max(finalRect.y, 0),
    );

    // Cap very tall highlights (e.g. full-page containers) so the spotlight
    // doesn't cover the entire screen, making the highlight meaningless.
    const maxH = window.innerHeight * 0.55;
    if (clampedRect.height > maxH) {
      const overflow = clampedRect.height - maxH;
      clampedRect = new DOMRect(
        clampedRect.x,
        clampedRect.y + overflow / 2,
        clampedRect.width,
        maxH,
      );
    }

    setTargetRect(clampedRect);
    setCardPos(computeCardPosition(clampedRect, step.position));
  }, [steps, router]);

  // Activate step whenever currentStep changes
  useEffect(() => {
    if (currentStep >= 0) {
      activateStep(currentStep);
    }
  }, [currentStep, activateStep]);

  // Track position changes on resize/scroll
  useEffect(() => {
    if (currentStep < 0) return;

    const handleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [currentStep, updatePosition]);

  // Fade-in after mount
  useEffect(() => {
    if (currentStep >= 0) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [currentStep]);

  const startTour = useCallback(() => {
    if (steps.length === 0) return;
    setCurrentStep(0);
  }, [steps.length]);

  const endTour = useCallback(() => {
    // Fire onExit for current step
    if (currentStep >= 0 && currentStep < steps.length) {
      steps[currentStep].onExit?.();
    }
    setCurrentStep(-1);
    setTargetRect(null);
    setCardPos(null);
    setNavigating(false);
    setIsClickAnimating(false);
    setIsCompleted(true);
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      localStorage.removeItem(TOUR_PENDING_KEY);
    } catch {
      /* non-critical */
    }
    // Stay on current page — don't navigate away
    onComplete?.();
  }, [onComplete, currentStep, steps]);

  /** Closes any open dropdowns/popovers before transitioning steps. */
  const dismissOpenUI = useCallback(() => {
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  }, []);

  const nextStep = useCallback(() => {
    dismissOpenUI();
    if (currentStep >= 0 && currentStep < steps.length) {
      steps[currentStep].onExit?.();
    }
    if (currentStep >= steps.length - 1) {
      endTour();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps, endTour, dismissOpenUI]);

  const prevStep = useCallback(() => {
    dismissOpenUI();
    if (currentStep >= 0 && currentStep < steps.length) {
      steps[currentStep].onExit?.();
    }
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, [currentStep, steps, dismissOpenUI]);

  // Close on Escape
  useEffect(() => {
    if (currentStep < 0) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") endTour();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentStep, endTour]);

  const isActive = currentStep >= 0;
  const step = isActive ? steps[currentStep] : null;

  return (
    <TourContext.Provider value={{ isActive, startTour, endTour, isCompleted }}>
      {children}

      {isActive && createPortal(
        <div
          className="fixed inset-0 z-[10000] transition-opacity duration-150"
          style={{ opacity: targetRect ? 1 : 0 }}
          onMouseDown={(e) => {
            // Block all mousedown events from bubbling to the document so
            // outside-click handlers on dropdowns/popovers don't fire.
            e.stopPropagation();
          }}
        >
          {/* Overlay + highlight — always visible when target exists (including during click animation) */}
          {targetRect && (
            <>
              {/* Overlay with spotlight cutout — clip-path animates between steps */}
              <div
                className="absolute inset-0 bg-black/60"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  clipPath: `polygon(
                    0% 0%,
                    0% 100%,
                    ${targetRect.left - HIGHLIGHT_PAD}px 100%,
                    ${targetRect.left - HIGHLIGHT_PAD}px ${targetRect.top - HIGHLIGHT_PAD}px,
                    ${targetRect.right + HIGHLIGHT_PAD}px ${targetRect.top - HIGHLIGHT_PAD}px,
                    ${targetRect.right + HIGHLIGHT_PAD}px ${targetRect.bottom + HIGHLIGHT_PAD}px,
                    ${targetRect.left - HIGHLIGHT_PAD}px ${targetRect.bottom + HIGHLIGHT_PAD}px,
                    ${targetRect.left - HIGHLIGHT_PAD}px 100%,
                    100% 100%,
                    100% 0%
                  )`,
                  transition: "clip-path 300ms ease-in-out",
                }}
              />

              {/* Glowing white highlight border */}
              <div
                className="absolute rounded-xl pointer-events-none"
                style={{
                  top: targetRect.top - HIGHLIGHT_PAD,
                  left: targetRect.left - HIGHLIGHT_PAD,
                  width: targetRect.width + HIGHLIGHT_PAD * 2,
                  height: targetRect.height + HIGHLIGHT_PAD * 2,
                  border: "2px solid rgba(255, 255, 255, 0.6)",
                  boxShadow: "0 0 12px 2px rgba(255, 255, 255, 0.3), inset 0 0 12px 2px rgba(255, 255, 255, 0.1)",
                  transition: "all 300ms ease-in-out",
                }}
              />
            </>
          )}

          {/* Content card — hidden during click animation */}
          {targetRect && cardPos && step && !isClickAnimating && (
            <div
              className="absolute bg-card rounded-xl border border-border shadow-2xl p-4 transition-all duration-300 ease-in-out z-[10001]"
              style={{
                top: cardPos.top,
                left: cardPos.left,
                width: CARD_WIDTH,
              }}
            >
              {/* Step counter + close */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {currentStep + 1} / {steps.length}
                </span>
                <button
                  onClick={endTour}
                  className="p-0.5 text-muted-foreground hover:text-foreground transition-colors rounded"
                  aria-label="Close tour"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-1.5">
                {step.icon && <span className="shrink-0">{step.icon}</span>}
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {currentStep > 0 ? (
                  <button
                    onClick={prevStep}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                  >
                    Previous
                  </button>
                ) : (
                  <button
                    onClick={endTour}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-80 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          )}

          {/* Navigating indicator (shown briefly while waiting for route change) */}
          {navigating && !targetRect && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-card rounded-xl border border-border shadow-2xl px-6 py-4 text-sm text-muted-foreground">
                Loading...
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}
    </TourContext.Provider>
  );
}

interface TourStartDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called to close the dialog. */
  onClose: () => void;
}

/**
 * Welcome dialog shown after onboarding to offer the guided tour.
 * Minimal design with Start Tour / Skip buttons.
 *
 * @param open - Controls visibility
 * @param onClose - Callback to dismiss
 */
export function TourStartDialog({ open, onClose }: TourStartDialogProps) {
  const { startTour } = useTour();

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop — no click-to-dismiss; use Skip or X to exit */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-sm mx-4 p-6 animate-modal-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="caltodo"
              className="h-12 dark:invert"
            />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Quick Tour
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Take a quick tour to learn how to navigate your inbox, create tasks, and sync your assignments.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                onClose();
                setTimeout(startTour, 50);
              }}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-80 transition-all"
            >
              Start Tour
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
