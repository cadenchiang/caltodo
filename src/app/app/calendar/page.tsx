"use client";

import CalendarPanel from "@/components/calendar/CalendarPanel";
import PageTransition from "@/components/ui/PageTransition";

/**
 * Calendar page — full-screen calendar view at /app/calendar.
 * Lives on its own route again (previously folded into /app/inbox as a
 * third tab). The sidebar's Calendar link points here.
 */
export default function CalendarPage() {
  return (
    <PageTransition>
      <div className="flex flex-col -m-4 md:-m-10 h-full max-h-full overflow-hidden">
        <CalendarPanel />
      </div>
    </PageTransition>
  );
}
