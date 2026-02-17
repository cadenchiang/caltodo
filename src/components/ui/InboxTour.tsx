"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TourProvider, useTour, type TourStep } from "./AppTour";

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
const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-task-list",
    title: "Your Tasks",
    description: "All your tasks live here — assignments, personal to-dos, reminders, anything you want to track. They're sorted by due date so you always know what's next.",
    position: "right",
    route: "/app/inbox",
  },
  {
    targetId: "tour-add-task",
    title: "Add Tasks",
    description: "Type a task and press Enter to add it. Use the calendar icon to set a due date, or the color dot to categorize it. Add anything — homework, errands, goals.",
    position: "bottom",
    route: "/app/inbox",
  },
  {
    targetId: "tour-filter",
    title: "Filter Tasks",
    description: "Filter your tasks by time — view all, just today's, or the next 7 days. Stay focused on what matters most.",
    position: "bottom",
    route: "/app/inbox",
  },
  {
    targetId: "tour-task-list",
    title: "Board View",
    description: "Click the menu icon, then select Board to organize your tasks into columns by class or category — like a Kanban board.",
    position: "top",
    route: "/app/inbox",
    onEnter: () => {
      // Close the dropdown before switching view
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      setTimeout(() => setTourViewMode("board"), 50);
    },
    onExit: () => setTourViewMode("list"),
    clickSequence: [
      { targetId: "tour-view-toggle", action: () => document.getElementById("tour-view-toggle")?.click() },
      { targetId: "tour-board-option" },
    ],
  },
  {
    targetId: "tour-sidebar-nav",
    title: "Navigation",
    description: "Switch between your Inbox and Calendar views. Your Inbox shows all tasks, while Calendar gives you a monthly overview.",
    position: "right",
    route: "/app/inbox",
  },
  {
    targetId: "tour-calendar-grid",
    title: "Calendar View",
    description: "See all your tasks and deadlines on a monthly calendar. Click any day to add a task, or click an existing task to edit it.",
    position: "top",
    route: "/app/calendar",
    clickTargetId: "tour-nav-calendar",
  },
];

/**
 * Inner component that checks for tour pending flag and shows the dialog.
 * Must be rendered inside TourProvider.
 */
function TourTrigger() {
  const { isCompleted, startTour } = useTour();
  const pathname = usePathname();
  const hasStartedRef = useRef(false);

  // Auto-start tour after onboarding — re-check when route changes
  useEffect(() => {
    if (isCompleted || hasStartedRef.current) return;
    try {
      const pending = localStorage.getItem(TOUR_PENDING_KEY);
      if (pending === "true") {
        hasStartedRef.current = true;
        localStorage.removeItem(TOUR_PENDING_KEY);
        const timer = setTimeout(() => startTour(), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      /* non-critical */
    }
  }, [isCompleted, pathname, startTour]);

  // Poll briefly in case the flag was set just before navigation (race condition)
  useEffect(() => {
    if (isCompleted || hasStartedRef.current) return;
    const pollTimer = setInterval(() => {
      try {
        if (localStorage.getItem(TOUR_PENDING_KEY) === "true") {
          hasStartedRef.current = true;
          localStorage.removeItem(TOUR_PENDING_KEY);
          clearInterval(pollTimer);
          startTour();
        }
      } catch { /* non-critical */ }
    }, 500);
    return () => clearInterval(pollTimer);
  }, [isCompleted, startTour]);

  return null;
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
