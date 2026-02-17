"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ClipboardList, PlusCircle, Search, LayoutGrid, Compass, CalendarDays } from "lucide-react";
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
    description: "Type and press Enter. Use the calendar icon for a due date or the dot to categorize.",
    position: "bottom",
    route: "/app/inbox",
  },
  {
    targetId: "tour-filter",
    title: "Filter",
    icon: <Search size={ICON_SIZE} />,
    description: "Show all tasks, just today's, or the next 7 days.",
    position: "bottom",
    route: "/app/inbox",
  },
  {
    targetId: "tour-task-list",
    title: "Board View",
    icon: <LayoutGrid size={ICON_SIZE} />,
    description: "Organize tasks into columns by class — like a Kanban board.",
    position: "top",
    route: "/app/inbox",
    onEnter: () => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      setTimeout(() => setTourViewMode("board"), 50);
    },
    clickSequence: [
      { targetId: "tour-view-toggle", action: () => document.getElementById("tour-view-toggle")?.click() },
      { targetId: "tour-board-option" },
    ],
  },
  {
    targetId: "tour-sidebar-nav",
    title: "Navigation",
    icon: <Compass size={ICON_SIZE} />,
    description: "Switch between Inbox and Calendar views from the sidebar.",
    position: "right",
    route: "/app/inbox",
  },
  {
    targetId: "tour-calendar-grid",
    title: "Calendar",
    icon: <CalendarDays size={ICON_SIZE} />,
    description: "See deadlines on a monthly view. Click a day to add or edit tasks.",
    position: "top",
    route: "/app/calendar",
    clickTargetId: "tour-nav-calendar",
  },
];

/**
 * Inner component that checks for tour pending flag and shows the start dialog.
 * Must be rendered inside TourProvider. Shows a "Start tour?" dialog with
 * skip option rather than auto-starting.
 */
function TourTrigger() {
  const { isCompleted } = useTour();
  const pathname = usePathname();
  const [showDialog, setShowDialog] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Show dialog after onboarding — re-check when route changes
  useEffect(() => {
    if (isCompleted || hasTriggeredRef.current) return;
    try {
      const pending = localStorage.getItem(TOUR_PENDING_KEY);
      if (pending === "true") {
        hasTriggeredRef.current = true;
        localStorage.removeItem(TOUR_PENDING_KEY);
        const timer = setTimeout(() => setShowDialog(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      /* non-critical */
    }
  }, [isCompleted, pathname]);

  // Poll briefly in case the flag was set just before navigation (race condition)
  useEffect(() => {
    if (isCompleted || hasTriggeredRef.current) return;
    const pollTimer = setInterval(() => {
      try {
        if (localStorage.getItem(TOUR_PENDING_KEY) === "true") {
          hasTriggeredRef.current = true;
          localStorage.removeItem(TOUR_PENDING_KEY);
          clearInterval(pollTimer);
          setShowDialog(true);
        }
      } catch { /* non-critical */ }
    }, 500);
    return () => clearInterval(pollTimer);
  }, [isCompleted]);

  return <TourStartDialog open={showDialog} onClose={() => setShowDialog(false)} />;
}

/**
 * Wraps children in a TourProvider with app-wide tour steps.
 * Automatically shows the tour start dialog if the onboarding just completed.
 * Steps include cross-page navigation (inbox + calendar).
 *
 * @param children - App content to render inside the tour provider
 */
export default function InboxTour({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider steps={TOUR_STEPS}>
      {children}
      <TourTrigger />
    </TourProvider>
  );
}
