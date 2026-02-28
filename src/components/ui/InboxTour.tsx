"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, PlusCircle, Search, LayoutGrid, CalendarDays, MessageSquare } from "lucide-react";
import { TourProvider, TourStartDialog, useTour, type TourStep } from "./AppTour";

/** localStorage key set by onboarding to trigger the tour. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";
/** localStorage key to track if tour has been completed. */
const TOUR_COMPLETED_KEY = "caltodo_tour_completed";

/**
 * Dispatches a custom event to switch the inbox view mode.
 * Listened for by InboxPage to toggle between list and board views.
 *
 * @param mode - "list" or "board"
 */
function setTourViewMode(mode: "list" | "board") {
  window.dispatchEvent(new CustomEvent("tour-set-view-mode", { detail: mode }));
}

/**
 * Tour step definitions for the full app tour.
 * Steps include cross-page navigation (inbox + calendar) and interactive demos.
 */
const ICON_SIZE = 16;

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-task-list",
    title: "Your Tasks",
    icon: <ClipboardList size={ICON_SIZE} />,
    description: "All your synced assignments and to-dos, sorted by due date.",
    position: "right",
    route: "/app/inbox",
  },
  {
    targetId: "tour-add-task",
    title: "Add Tasks",
    icon: <PlusCircle size={ICON_SIZE} />,
    description: "Click here to create a task. Set a due date, color, and tags in the popup.",
    position: "bottom",
    route: "/app/inbox",
  },
  {
    targetId: "tour-filter",
    title: "Filter",
    icon: <Search size={ICON_SIZE} />,
    description: "Click to show all tasks, just today's, or the next 7 days.",
    position: "bottom",
    route: "/app/inbox",
  },
  {
    targetId: "tour-task-list",
    title: "Board View",
    icon: <LayoutGrid size={ICON_SIZE} />,
    description: "Switch between list and board view. Board organizes tasks into columns by class.",
    position: "right",
    route: "/app/inbox",
    onEnter: () => setTourViewMode("board"),
    onExit: () => setTourViewMode("list"),
  },
  {
    targetId: "tour-calendar-grid",
    title: "Calendar",
    icon: <CalendarDays size={ICON_SIZE} />,
    description: "See deadlines on a monthly view. Double-click a day or press + to add tasks.",
    position: "top",
    route: "/app/calendar",
    clickTargetId: "tour-nav-calendar",
  },
  {
    targetId: "tour-calchat-page",
    title: "CalChat",
    icon: <MessageSquare size={ICON_SIZE} />,
    description: "Message your classmates anonymously, organized by course. Sync your classes to unlock it.",
    position: "right",
    route: "/app/discussions",
    clickTargetId: "tour-nav-calchat",
  },
];

/**
 * Inner component that checks for tour pending flag and shows the start dialog.
 * Must be rendered inside TourProvider. Shows a "Start tour?" dialog with
 * skip option rather than auto-starting.
 */
/**
 * Module-level flag to prevent re-triggering the tour dialog within the same
 * page session. Survives React re-mounts (e.g. navigating between pages).
 */
let dialogShownThisSession = false;

function TourTrigger() {
  const { isCompleted, endTour } = useTour();
  const pathname = usePathname();
  const [showDialog, setShowDialog] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Show dialog after onboarding — re-check when route changes.
  // Only trigger on inbox route so the tour doesn't fire while on settings.
  // Tour is desktop-only: the steps reference sidebar and split-screen layout.
  useEffect(() => {
    if (isCompleted || hasTriggeredRef.current || dialogShownThisSession) return;
    if (!pathname?.startsWith("/app/inbox")) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    try {
      const pending = localStorage.getItem(TOUR_PENDING_KEY);
      if (pending === "true") {
        hasTriggeredRef.current = true;
        dialogShownThisSession = true;
        localStorage.removeItem(TOUR_PENDING_KEY);
        const timer = setTimeout(() => setShowDialog(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      /* non-critical */
    }
  }, [isCompleted, pathname]);

  // Poll for the pending flag, but only when on inbox route.
  // Keeps running until user makes a choice (Start Tour or Skip).
  // Tour is desktop-only.
  useEffect(() => {
    if (isCompleted || hasTriggeredRef.current || dialogShownThisSession) return;
    if (!pathname?.startsWith("/app/inbox")) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const pollTimer = setInterval(() => {
      try {
        if (localStorage.getItem(TOUR_PENDING_KEY) === "true") {
          hasTriggeredRef.current = true;
          dialogShownThisSession = true;
          localStorage.removeItem(TOUR_PENDING_KEY);
          clearInterval(pollTimer);
          setShowDialog(true);
        }
      } catch { /* non-critical */ }
    }, 500);
    return () => clearInterval(pollTimer);
  }, [isCompleted, pathname]);

  // Listen for restart-tour event from settings — show the dialog
  useEffect(() => {
    function handleRestart() {
      hasTriggeredRef.current = false;
      dialogShownThisSession = false;
      setShowDialog(true);
    }
    window.addEventListener("caltodo-restart-tour", handleRestart);
    return () => window.removeEventListener("caltodo-restart-tour", handleRestart);
  }, []);

  // Listen for redo-setup event — reset so tour can re-trigger
  useEffect(() => {
    function handleRedo() {
      hasTriggeredRef.current = false;
      dialogShownThisSession = false;
    }
    window.addEventListener("caltodo-redo-setup", handleRedo);
    return () => window.removeEventListener("caltodo-redo-setup", handleRedo);
  }, []);

  /**
   * Handles closing the tour dialog. When user skips, marks tour as completed
   * so it doesn't re-show on navigation or re-mount.
   */
  const handleDialogClose = useCallback(() => {
    setShowDialog(false);
    // If user skips, persist completion so it never re-triggers
    if (!isCompleted) {
      endTour();
    }
  }, [isCompleted, endTour]);

  return <TourStartDialog open={showDialog} onClose={handleDialogClose} />;
}

/**
 * Wraps children in a TourProvider with app-wide tour steps.
 * Automatically shows the tour start dialog if the onboarding just completed.
 * Steps include cross-page navigation (inbox + calendar).
 *
 * @param children - App content to render inside the tour provider
 */
export default function InboxTour({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleTourComplete() {
    setTourViewMode("list");
    router.push("/app/inbox");
  }

  return (
    <TourProvider steps={TOUR_STEPS} onComplete={handleTourComplete}>
      {children}
      <TourTrigger />
    </TourProvider>
  );
}
