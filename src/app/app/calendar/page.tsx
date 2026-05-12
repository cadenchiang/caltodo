import { redirect } from "next/navigation";

/**
 * Legacy /app/calendar route. The calendar lives inside /app/inbox as a
 * third tab now, so any URL hits to /app/calendar bounce to the inbox
 * page (which the user can switch into Calendar view via the tab).
 *
 * Keeping the route file (instead of deleting the folder) preserves any
 * existing bookmarks or external links to /app/calendar.
 */
export default function CalendarRedirect() {
  redirect("/app/inbox");
}
