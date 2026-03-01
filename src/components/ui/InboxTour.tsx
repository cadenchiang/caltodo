"use client";

/**
 * App-wide tour with home dashboard steps first, then inbox/calendar/calchat.
 * Starts on /app/home, navigates to /app/inbox after home steps.
 *
 * @param children - App content to render inside the tour provider
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Pencil, Plus, ClipboardList, PlusCircle, Search, LayoutGrid, CalendarDays, MessageSquare } from "lucide-react";
import { TourProvider, TourStartDialog, useTour, type TourStep } from "./AppTour";

/** localStorage key set by onboarding to trigger the tour. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";

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
 * Dispatches a custom event to toggle edit mode on the home dashboard.
 * Listened for by HomePage to show/hide widget jiggle and edit controls.
 *
 * @param enabled - Whether edit mode should be active
 */
function setTourEditMode(enabled: boolean) {
  window.dispatchEvent(new CustomEvent("tour-set-edit-mode", { detail: enabled }));
}

const ICON_SIZE = 16;

/**
 * Tour step definitions — 3 home dashboard steps, then 6 inbox/calendar/calchat steps.
 * Cross-page navigation handled via the `route` property on each step.
 */
const TOUR_STEPS: TourStep[] = [
  // ── Home Dashboard Steps (1-3) ──
  {
    targetId: "widget-grid",
    title: "Home Dashboard",
    icon: <Home size={ICON_SIZE} />,
    description: "This is your home dashboard! Customize it with widgets.",
    position: "top",
    route: "/app/home",
  },
  {
    targetId: "widget-grid",
    title: "Edit Mode",
    icon: <Pencil size={ICON_SIZE} />,
    description: "Click Edit to rearrange, resize, or remove widgets.",
    position: "top",
    route: "/app/home",
    clickSequence: [
      { targetId: "edit-toggle-btn", action: () => setTourEditMode(true) },
    ],
  },
  {
    targetId: "add-widget-btn",
    title: "Add Widgets",
    icon: <Plus size={ICON_SIZE} />,
    description: "Add new widgets from the gallery.",
    position: "bottom",
    route: "/app/home",
    onExit: () => setTourEditMode(false),
  },
  // ── Inbox Steps (4-7) ──
  {
    targetId: "tour-task-list",
    title: "Your Tasks",
    icon: <ClipboardList size={ICON_SIZE} />,
    description: "All your synced assignments and to-dos, sorted by due date.",
    position: "right",
    route: "/app/inbox",
    clickTargetId: "tour-nav-inbox",
  },
  {
    targetId: "tour-add-task",
    title: "Add Tasks",
    icon: <PlusCircle size={ICON_SIZE} />,
    description: "Click the plus icon to create a task. Set a due date, color, and tags in the popup.",
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
  // ── Calendar & CalChat Steps (8-9) ──
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
    description: "Message your classmates anonymously, organized by course.",
    position: "right",
    route: "/app/discussions",
    clickTargetId: "tour-nav-calchat",
  },
];

/**
 * Module-level flag to prevent re-triggering the tour dialog within the same
 * page session. Survives React re-mounts (e.g. navigating between pages).
 */
let dialogShownThisSession = false;

/**
 * Inner component that checks for tour pending flag and shows the start dialog.
 * Must be rendered inside TourProvider. Triggers on /app/home route.
 */
function TourTrigger() {
  const { isCompleted, endTour } = useTour();
  const pathname = usePathname();
  const [showDialog, setShowDialog] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Show dialog after onboarding — trigger on home route.
  // Tour is desktop-only: the steps reference sidebar and split-screen layout.
  useEffect(() => {
    if (isCompleted || hasTriggeredRef.current || dialogShownThisSession) return;
    if (!pathname?.startsWith("/app/home")) return;
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

  // Poll for the pending flag on home route.
  useEffect(() => {
    if (isCompleted || hasTriggeredRef.current || dialogShownThisSession) return;
    if (!pathname?.startsWith("/app/home")) return;
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
    if (!isCompleted) {
      endTour();
    }
  }, [isCompleted, endTour]);

  return <TourStartDialog open={showDialog} onClose={handleDialogClose} />;
}

/**
 * Wraps children in a TourProvider with app-wide tour steps.
 * Tour starts at /app/home with dashboard steps, then navigates through
 * inbox, calendar, and calchat via route-based step transitions.
 *
 * @param children - App content to render inside the tour provider
 */
export default function InboxTour({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  /** Called when tour completes — return to inbox in list view. */
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
