import type { Guide } from "../guide-types";

/** Guide: getting Gradescope due dates onto a calendar. */
export const guide: Guide = {
  slug: "gradescope-deadlines-in-calendar",
  title: "How to get Gradescope deadlines into your calendar",
  description:
    "Gradescope has no calendar feed to subscribe to. Here are the options for tracking Gradescope due dates alongside your Canvas assignments.",
  updated: "2026-08-29",
  intro:
    "Gradescope is where a lot of problem sets and exams actually live, and unlike Canvas it publishes no .ics feed. That gap is why students who carefully synced Canvas to their calendar still miss Gradescope deadlines.",
  sections: [
    {
      heading: "Why there is no feed to subscribe to",
      body: [
        "Canvas exposes a per-user calendar feed URL. Gradescope does not offer an equivalent, and it has no public calendar export in the student interface. There is no URL you can paste into Google Calendar or Apple Calendar.",
        "Any tool claiming to sync Gradescope is signing in on your behalf and reading your dashboard, because that is the only route available.",
      ],
    },
    {
      heading: "Option 1: add each deadline by hand",
      body: [
        "Open the Gradescope dashboard, and for every course, copy the open assignments and their due dates into your calendar as events.",
        "This works and costs nothing. The problem is that it is a snapshot: extensions, newly posted assignments, and changed deadlines will not follow, so it needs redoing every week to stay accurate.",
      ],
    },
    {
      heading: "Option 2: check whether the course mirrors into Canvas",
      body: [
        "Some instructors create a matching Canvas assignment that links out to Gradescope. When they do, the deadline rides along in the Canvas calendar feed and you get it for free.",
        "This is entirely up to the instructor and is inconsistent even between sections of the same course, so verify per course rather than assuming.",
      ],
    },
    {
      heading: "Option 3: use a tool that reads both",
      body: [
        "caltodo connects to Gradescope and Canvas together and merges the two into a single list, so a problem set posted only on Gradescope sits next to the Canvas readings due the same day.",
        "It also tracks submission status, which the Canvas feed omits, so a submitted assignment stops competing for attention with the ones still outstanding.",
      ],
    },
  ],
};
