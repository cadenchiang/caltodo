import type { Guide } from "../guide-types";

/** Guide: choosing a way to track Canvas assignments. */
export const guide: Guide = {
  slug: "canvas-assignment-tracker",
  title: "Tracking Canvas assignments: the realistic options",
  description:
    "The Canvas dashboard, a synced calendar, a to-do app, or a tool that reads Canvas directly. What each one actually does well.",
  updated: "2026-08-29",
  intro:
    "Canvas tells you what is due, but it does not help you decide what to work on. These are the four approaches students actually use, and the specific failure mode of each.",
  sections: [
    {
      heading: "The Canvas dashboard and To Do list",
      body: [
        "Free, always accurate, and already open. The Canvas To Do list shows upcoming items across courses without any setup.",
        "Where it falls down: it shows only a short horizon, orders items by date with no sense of size, and covers nothing outside Canvas. Nothing from Gradescope or your syllabus appears, so it under-reports your real workload.",
      ],
    },
    {
      heading: "A subscribed calendar feed",
      body: [
        "Subscribing to the Canvas .ics feed in Google or Apple Calendar puts due dates beside your classes and commitments, which is genuinely useful for seeing whether a week is survivable.",
        "The limits are refresh lag of up to a day, no submission status, and no way to check anything off. Deadlines you have already handed in keep appearing.",
      ],
    },
    {
      heading: "A general to-do app",
      body: [
        "Todoist, Things, Notion and similar tools are excellent at the actual work of prioritising, breaking down, and checking off.",
        "None of them know anything about your courses. Every assignment has to be entered by hand, which is fine in week one and abandoned by week four. Manual entry is where almost all of these systems die.",
      ],
    },
    {
      heading: "A tool built for coursework",
      body: [
        "caltodo reads Canvas, Gradescope, and an uploaded syllabus, merges them into one list with submission status, and lets you organise the result the way a to-do app would.",
        "The reason to prefer this over a calendar subscription is not the syncing itself, it is that the list stays correct without you maintaining it, which is the only property that survives midterms.",
      ],
    },
  ],
};
