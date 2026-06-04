"use client";

import { useEffect } from "react";
import { activePomodoroRemaining, formatClock } from "@/lib/pomodoro-title";

/**
 * Layout-level tab-title countdown for the Pomodoro timers.
 *
 * Renders nothing. While a timer is running (page or widget store), the tab
 * title becomes "(MM:SS) <page title>" — on every page of the app, even when
 * the timer component itself is unmounted or the tab is backgrounded (the
 * remaining time is recomputed from wall-clock timestamps, so throttled
 * intervals stay accurate). When no timer runs, the page's own title is
 * restored untouched.
 */
export default function PomodoroTitleSync() {
  useEffect(() => {
    let baseTitle = document.title;
    let lastSetTitle: string | null = null;

    const tick = () => {
      const current = document.title;
      // A navigation (or anything else) changed the title since our last
      // write — treat the new value as the base to prefix.
      if (current !== lastSetTitle) {
        baseTitle = current;
      }

      const remaining = activePomodoroRemaining(
        (key) => localStorage.getItem(key),
        Date.now(),
      );

      if (remaining !== null) {
        const next = `(${formatClock(remaining)}) ${baseTitle}`;
        if (document.title !== next) {
          document.title = next;
        }
        lastSetTitle = next;
      } else if (lastSetTitle !== null) {
        document.title = baseTitle;
        lastSetTitle = null;
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      if (lastSetTitle !== null) {
        document.title = baseTitle;
      }
    };
  }, []);

  return null;
}
