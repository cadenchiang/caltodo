"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** localStorage keys for tour state. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";
const TOUR_COMPLETED_KEY = "caltodo_tour_completed";

/** Padding around highlighted element in px. */
const HIGHLIGHT_PAD = 8;
/** Width of the tour content card in px. */
const CARD_WIDTH = 280;

type TourPosition = "top" | "bottom" | "left" | "right";

export interface TourStep {
  /** ID of the DOM element to highlight. */
  targetId: string;
  /** Step title text. */
  title: string;
  /** Step description text. */
  description: string;
  /** Preferred position of the content card relative to the target. */
  position?: TourPosition;
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
      top = rect.top - gap - 160; // approx card height
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
 * TourProvider manages the app tour lifecycle and renders the overlay.
 * Uses a clip-path polygon to cut out the highlighted element area,
 * creating a spotlight effect. Content cards are positioned near the target.
 *
 * @param steps - Array of TourStep definitions
 * @param onComplete - Optional callback when tour finishes
 * @param children - App content to render below the tour
 */
export function TourProvider({ children, steps, onComplete }: TourProviderProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

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

  /** Updates target rect and card position on resize/scroll. */
  const updatePosition = useCallback(() => {
    if (currentStep < 0 || currentStep >= steps.length) return;
    const step = steps[currentStep];
    const el = document.getElementById(step.targetId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    setCardPos(computeCardPosition(rect, step.position));
  }, [currentStep, steps]);

  // Track position changes
  useEffect(() => {
    if (currentStep < 0) return;
    updatePosition();

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
    setCurrentStep(-1);
    setTargetRect(null);
    setCardPos(null);
    setIsCompleted(true);
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
      localStorage.removeItem(TOUR_PENDING_KEY);
    } catch {
      /* non-critical */
    }
    onComplete?.();
  }, [onComplete]);

  const nextStep = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      endTour();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length, endTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

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

      {isActive && targetRect && cardPos && step && createPortal(
        <div
          className="fixed inset-0 z-[9998] transition-opacity duration-200"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {/* Overlay with spotlight cutout */}
          <div
            className="absolute inset-0 bg-black/60"
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
            }}
            onClick={endTour}
          />

          {/* Highlight border */}
          <div
            className="absolute rounded-xl border-2 border-blue-400 transition-all duration-300 pointer-events-none"
            style={{
              top: targetRect.top - HIGHLIGHT_PAD,
              left: targetRect.left - HIGHLIGHT_PAD,
              width: targetRect.width + HIGHLIGHT_PAD * 2,
              height: targetRect.height + HIGHLIGHT_PAD * 2,
            }}
          />

          {/* Content card */}
          <div
            className="absolute bg-card rounded-xl border border-border shadow-2xl p-4 transition-all duration-300 z-[9999]"
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
            <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
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
                className="text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
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
    <div className="fixed inset-0 z-[9997] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
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
                // Small delay to let dialog close before tour starts
                setTimeout(startTour, 200);
              }}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all"
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
