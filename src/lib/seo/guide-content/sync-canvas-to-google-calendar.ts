import type { Guide } from "../guide-types";

/** Guide: getting Canvas assignment due dates into Google Calendar. */
export const guide: Guide = {
  slug: "sync-canvas-to-google-calendar",
  title: "How to sync Canvas assignments to Google Calendar",
  description:
    "Copy your Canvas calendar feed URL and subscribe to it in Google Calendar so every assignment due date shows up automatically.",
  updated: "2026-08-29",
  intro:
    "Canvas publishes every course's due dates as a calendar feed, and Google Calendar can subscribe to that feed. Once connected, new assignments appear on your calendar without you copying anything over by hand.",
  sections: [
    {
      heading: "Find your Canvas calendar feed URL",
      body: [
        "The feed URL is a private link ending in .ics that contains the assignments for every course you are enrolled in. It lives in the Canvas calendar, not in course settings, which is why most students never find it.",
      ],
      steps: [
        "Open Canvas and click Calendar in the left sidebar.",
        'Look at the bottom right of the page and click "Calendar Feed".',
        "Copy the URL in the dialog. It starts with https:// and ends in .ics",
      ],
    },
    {
      heading: "Subscribe to the feed in Google Calendar",
      body: [
        "Google Calendar treats the feed as a read-only calendar you can toggle on and off next to your own events.",
      ],
      steps: [
        "Open Google Calendar on a computer. The mobile apps cannot add a feed URL.",
        'In the left sidebar, click the + next to "Other calendars".',
        'Choose "From URL".',
        "Paste your Canvas feed URL and click Add calendar.",
      ],
    },
    {
      heading: "Why due dates can take a day to update",
      body: [
        "Google decides how often to re-read a subscribed feed, and in practice that is usually somewhere between eight and twenty-four hours. You cannot force a refresh from the Google Calendar interface.",
        "This is the tradeoff most students hit: if an instructor moves a deadline the morning it is due, the feed may still show yesterday's date. For assignments that matter, treat the subscribed calendar as a planning view rather than a live source of truth.",
      ],
    },
    {
      heading: "What the feed does not include",
      body: [
        "The Canvas feed carries due dates and titles. It does not carry point values, submission status, rubric details, or anything from Gradescope, which many courses use for problem sets and exams alongside Canvas.",
        "If your courses are split across Canvas and Gradescope, a calendar subscription only ever shows you half the picture. caltodo reads both, plus deadlines parsed from an uploaded syllabus, and keeps them in one list with submission status attached.",
      ],
    },
  ],
};
