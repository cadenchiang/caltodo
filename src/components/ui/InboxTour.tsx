"use client";

import { useState, useEffect } from "react";
import { TourProvider, TourStartDialog, useTour, type TourStep } from "./AppTour";

/** localStorage key set by onboarding to trigger the tour. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";
/** localStorage key to track if tour has been completed. */
const TOUR_COMPLETED_KEY = "caltodo_tour_completed";

/**
 * Simulates a click on the filter button to open/close the dropdown.
 * Used by the tour to demonstrate the filter UI.
 */
function clickFilterButton() {
  const btn = document.querySelector("#tour-filter button") as HTMLElement | null;
  btn?.click();
}

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
    targetId: "tour-sidebar-nav",
    title: "Navigation",
    description: "Switch between your Inbox and Calendar views. Your Inbox shows all tasks, while Calendar gives you a monthly overview.",
    position: "right",
    route: "/app/inbox",
  },
  {
    targetId: "tour-filter",
    title: "Filter Tasks",
    description: "Filter your tasks by time — view all, just today's, or the next 7 days. Stay focused on what matters most.",
    position: "bottom",
    route: "/app/inbox",
    onEnter: () => clickFilterButton(),
    onExit: () => clickFilterButton(),
  },
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
    targetId: "tour-view-toggle",
    title: "Board View",
    description: "Switch between List and Board views. Board view organizes your tasks into columns by class or category — like a Kanban board.",
    position: "bottom",
    route: "/app/inbox",
    onEnter: () => setTourViewMode("board"),
    onExit: () => setTourViewMode("list"),
  },
  {
    targetId: "tour-calendar-grid",
    title: "Calendar View",
    description: "See all your tasks and deadlines on a monthly calendar. Click any day to add a task, or click an existing task to edit it.",
    position: "top",
    route: "/app/calendar",
  },
];

/**
 * Inner component that checks for tour pending flag and shows the dialog.
 * Must be rendered inside TourProvider.
 */
function TourTrigger() {
  const [showDialog, setShowDialog] = useState(false);
  const { isCompleted } = useTour();

  // Check if tour should start (set by onboarding completion)
  useEffect(() => {
    if (isCompleted) return;
    try {
      const pending = localStorage.getItem(TOUR_PENDING_KEY);
      if (pending === "true") {
        // Small delay so the inbox has time to render and IDs are in the DOM
        const timer = setTimeout(() => setShowDialog(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      /* non-critical */
    }
  }, [isCompleted]);

  /** Handles dialog dismissal — clears pending flag. */
  function handleClose() {
    setShowDialog(false);
    try {
      localStorage.removeItem(TOUR_PENDING_KEY);
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    } catch {
      /* non-critical */
    }
  }

  return <TourStartDialog open={showDialog} onClose={handleClose} />;
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
