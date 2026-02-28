"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { useTour } from "./AppTour";
import { useTaskContext } from "@/contexts/TaskContext";

/** localStorage keys for Getting Started widget state. */
const VISIBLE_KEY = "caltodo_getting_started_visible";
const COLLAPSED_KEY = "caltodo_getting_started_collapsed";

/** Custom event dispatched when Getting Started finishes and hides. */
export const GETTING_STARTED_COMPLETE_EVENT = "caltodo-getting-started-complete";

/**
 * Reads a boolean localStorage value safely.
 *
 * @param key - The localStorage key
 * @returns true if the stored value is "true", false otherwise
 */
function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

/**
 * Writes a boolean localStorage value safely.
 *
 * @param key - The localStorage key
 * @param value - The boolean value to store
 */
function writeFlag(key: string, value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(key, "true");
    } else {
      localStorage.removeItem(key);
    }
  } catch { /* ignore quota errors */ }
}

/**
 * Persistent "Getting Started" widget shown after the setup wizard closes.
 * Displays a collapsible checklist at the bottom-right of the screen with
 * two items: "Sync your classes" and "Take a tour".
 *
 * Checkboxes auto-complete based on actual user actions:
 * - Sync: detected when any task with a source (canvas/gradescope/pensieve) exists
 * - Tour: detected via useTour().isCompleted
 *
 * When both items complete, plays an exit animation then hides and dispatches
 * GETTING_STARTED_COMPLETE_EVENT so NotificationCenter can appear.
 *
 * Must be rendered inside <InboxTour> (TourProvider) for useTour() access.
 */
export default function GettingStartedWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCompleted: tourDone } = useTour();
  const { tasks } = useTaskContext();

  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const exitingRef = useRef(false);

  // Sync is done when any task has a source (synced from a platform)
  const syncDone = tasks.some((t) => t.source !== null);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const isVisible = readFlag(VISIBLE_KEY);
    setShow(isVisible);
    setCollapsed(readFlag(COLLAPSED_KEY));
    // If already visible from a previous session, skip entrance animation
    if (isVisible) setEntered(true);
  }, []);

  // Listen for custom event to show with entrance animation (from SyncClassesModal)
  useEffect(() => {
    function handleShow() {
      setShow(true);
      setCollapsed(false);
      setEntered(false);
      setExiting(false);
      exitingRef.current = false;
      writeFlag(COLLAPSED_KEY, false);
      // Trigger entrance animation after a brief delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
    }
    window.addEventListener("caltodo-show-getting-started", handleShow);
    return () => window.removeEventListener("caltodo-show-getting-started", handleShow);
  }, []);

  // Exit animation + hide when both items are done
  useEffect(() => {
    if (!syncDone || !tourDone || !show) return;
    if (exitingRef.current) return;

    // Wait 2s so user sees 2/2, then animate out
    const delayTimer = setTimeout(() => {
      exitingRef.current = true;
      setExiting(true);

      // After exit animation completes, hide and notify
      const animTimer = setTimeout(() => {
        setShow(false);
        setEntered(false);
        setExiting(false);
        writeFlag(VISIBLE_KEY, false);
        writeFlag(COLLAPSED_KEY, false);
        window.dispatchEvent(new CustomEvent(GETTING_STARTED_COMPLETE_EVENT));
      }, 400);

      return () => clearTimeout(animTimer);
    }, 2000);

    return () => clearTimeout(delayTimer);
  }, [syncDone, tourDone, show]);

  /**
   * Toggles the collapsed state and persists it.
   */
  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeFlag(COLLAPSED_KEY, next);
      return next;
    });
  }, []);

  /**
   * Navigates to integrations settings when clicking the sync row.
   */
  const handleSyncClick = useCallback(() => {
    router.push("/app/settings?section=integrations");
  }, [router]);

  /**
   * Opens the tour start dialog so the user can choose to start or skip.
   * Dispatches the restart-tour event which TourTrigger listens for.
   */
  const handleTourClick = useCallback(() => {
    try {
      localStorage.removeItem("caltodo_tour_completed");
      localStorage.removeItem("caltodo_tour_pending");
    } catch { /* non-critical */ }
    window.dispatchEvent(new CustomEvent("caltodo-restart-tour"));
  }, []);

  // Hide on onboarding and discussions routes
  if (pathname?.startsWith("/app/onboarding") || pathname?.startsWith("/app/discussions")) {
    return null;
  }

  if (!show) return null;

  const doneCount = (syncDone ? 1 : 0) + (tourDone ? 1 : 0);
  const progressPercent = (doneCount / 2) * 100;

  // Entrance: slide up + fade in. Exit: slide down + fade out.
  const isVisible = entered && !exiting;

  return (
    <div
      className="fixed bottom-20 right-4 z-50 md:bottom-8 md:right-8 w-[300px] md:w-[320px] transition-all duration-400 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <div className="rounded-2xl border border-border bg-popover shadow-lg overflow-hidden">
        {/* Header — always visible, toggles expand/collapse */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="w-full flex items-center gap-2.5 px-5 py-3.5 hover:bg-muted/50 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
          <span className="text-sm font-semibold text-foreground flex-1 text-left">
            getting started
          </span>
          <span className="text-xs text-muted-foreground mr-1">
            {doneCount}/2
          </span>
          <ChevronDown
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${
              collapsed ? "" : "rotate-180"
            }`}
          />
        </button>

        {/* Body — animated expand/collapse via grid rows */}
        <div
          className="grid transition-[grid-template-rows] duration-250 ease-out"
          style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
        >
          <div className="overflow-hidden">
            {/* Item 1: Sync your classes */}
            <div className="border-t border-border" />
            <button
              type="button"
              onClick={syncDone ? undefined : handleSyncClick}
              disabled={syncDone}
              className="w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-muted/60 transition-colors disabled:hover:bg-transparent"
              style={{
                opacity: collapsed ? 0 : 1,
                transform: collapsed ? "translateY(-4px)" : "translateY(0)",
                transition: "opacity 200ms ease 50ms, transform 200ms ease 50ms",
              }}
            >
              <div
                className={`mt-0.5 w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  syncDone
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-border"
                }`}
              >
                {syncDone && <Check size={13} strokeWidth={3} />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-snug ${syncDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  sync your classes
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  connect your class platforms to auto-import assignments
                </p>
              </div>
            </button>

            {/* Item 2: Take a tour */}
            <div className="border-t border-border" />
            <button
              type="button"
              onClick={tourDone ? undefined : handleTourClick}
              disabled={tourDone}
              className="w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-muted/60 transition-colors disabled:hover:bg-transparent"
              style={{
                opacity: collapsed ? 0 : 1,
                transform: collapsed ? "translateY(-4px)" : "translateY(0)",
                transition: "opacity 200ms ease 100ms, transform 200ms ease 100ms",
              }}
            >
              <div
                className={`mt-0.5 w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  tourDone
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-border"
                }`}
              >
                {tourDone && <Check size={13} strokeWidth={3} />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-snug ${tourDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  take a tour
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  learn how to use your inbox, calendar, and more
                </p>
              </div>
            </button>

            {/* Progress bar */}
            <div className="px-5 pb-4 pt-1">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
