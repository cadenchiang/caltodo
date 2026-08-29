import type { Guide } from "../guide-types";

/** Guide: locating the Canvas iCal feed URL and what it contains. */
export const guide: Guide = {
  slug: "canvas-calendar-feed-url",
  title: "Where to find your Canvas calendar feed (iCal) URL",
  description:
    "Your Canvas calendar feed is a private .ics link listing every assignment due date. Here is where it hides and what it does and does not include.",
  updated: "2026-08-29",
  intro:
    "Every Canvas account exposes a personal calendar feed: one .ics URL covering all of your enrolled courses. It is the fastest way to move due dates into another app, and it is buried in a corner of the interface almost nobody clicks.",
  sections: [
    {
      heading: "The three-click path",
      body: [
        "The link is not in account settings, profile, or any individual course. It is on the calendar itself.",
      ],
      steps: [
        "Click Calendar in the Canvas global navigation on the left.",
        'Scroll to the bottom right of the calendar and click "Calendar Feed".',
        "Copy the URL shown in the dialog.",
      ],
    },
    {
      heading: "How to tell it is the right URL",
      body: [
        "A valid feed URL starts with https:// and ends in .ics, and contains a long random token that identifies you. Your school's Canvas hostname appears at the front, for example bcourses.berkeley.edu or a subdomain of instructure.com.",
        "If what you copied ends in .html or points at a login page, you have copied the calendar page rather than the feed.",
      ],
    },
    {
      heading: "Treat it like a password",
      body: [
        "The token in the URL is what authenticates you, so anyone holding the link can read your course schedule without signing in. Do not post it in a group chat or a public document.",
        "If you do leak it, Canvas lets you invalidate the old link by resetting the feed from the same dialog. Every app you have connected will need the new URL.",
      ],
    },
    {
      heading: "What is in the feed",
      body: [
        "Assignment titles, due dates, and course names, for every course you are enrolled in, including ones you may have muted in the Canvas dashboard.",
        "Not included: point values, submission or grading status, instructor comments, and anything hosted outside Canvas. Gradescope deadlines in particular never appear, which is the usual reason a synced calendar looks emptier than the real workload.",
      ],
    },
  ],
};
