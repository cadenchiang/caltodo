"use client";

import { useState, useEffect } from "react";
import { TourProvider, TourStartDialog, useTour, type TourStep } from "./AppTour";

/** localStorage key set by onboarding to trigger the tour. */
const TOUR_PENDING_KEY = "caltodo_tour_pending";
/** localStorage key to track if tour has been completed. */
const TOUR_COMPLETED_KEY = "caltodo_tour_completed";

/**
 * Tour step definitions for the inbox page.
 * Each step targets a DOM element by ID and provides guidance text.
 */
const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-sidebar-nav",
    title: "Navigation",
    description: "Switch between your Inbox and Calendar views here. Your Inbox shows all tasks, while Calendar gives you a monthly overview.",
    position: "right",
  },
  {
    targetId: "tour-filter",
    title: "Filter Tasks",
    description: "Click here to filter your tasks — view all, just today's, or the next 7 days. Keep focused on what matters most.",
    position: "bottom",
  },
  {
    targetId: "tour-add-task",
    title: "Create Tasks",
    description: "Type a task name and press Enter to add it. Click the calendar icon to set a due date, or the color dot to categorize it.",
    position: "bottom",
  },
  {
    targetId: "tour-sync-button",
    title: "Sync Assignments",
    description: "Click the refresh icon to pull in new assignments from bCourses and Gradescope. You can choose which courses to sync.",
    position: "bottom",
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
 * Wraps children in a TourProvider with inbox-specific tour steps.
 * Automatically shows the tour start dialog if the onboarding just completed.
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
