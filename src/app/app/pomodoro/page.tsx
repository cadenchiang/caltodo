"use client";

import PomodoroPage from "@/components/pomodoro/PomodoroPage";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Focus timer page at /app/pomodoro. Full Pomodoro timer with task
 * selection, session tracking, and persistent state across navigations.
 */
export default function PomodoroRoute() {
  return (
    <PageTransition>
      <PomodoroPage />
    </PageTransition>
  );
}
