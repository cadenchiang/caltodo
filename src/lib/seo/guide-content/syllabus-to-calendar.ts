import type { Guide } from "../guide-types";

/** Guide: extracting deadlines from a syllabus into a calendar. */
export const guide: Guide = {
  slug: "syllabus-to-calendar",
  title: "How to turn a syllabus into calendar deadlines",
  description:
    "Most course deadlines live only in the syllabus PDF, never in Canvas. Here is how to get them onto your calendar at the start of term.",
  updated: "2026-08-29",
  intro:
    "The first week of a semester is the one moment when every deadline for the next four months is written down in one place: the syllabus. Almost none of those dates are in Canvas, because instructors post assignments week by week.",
  sections: [
    {
      heading: "Why Canvas is not enough on its own",
      body: [
        "Canvas only holds an assignment once the instructor creates it, which for many courses happens days before it is due. Midterm dates, project milestones, and reading deadlines set out in the syllabus often never become Canvas assignments at all.",
        "So a calendar synced purely from Canvas looks reassuringly empty in week two and then fills up with short notice. The syllabus is the only early warning you get.",
      ],
    },
    {
      heading: "Doing it manually",
      body: [
        "Open each syllabus, find the schedule table, and enter every dated row as a calendar event. Give yourself a reminder a few days ahead for anything larger than a weekly problem set.",
      ],
      steps: [
        "Collect all of your syllabi in one folder at the start of term.",
        "Work through one course at a time so you do not lose your place.",
        "Enter exams and projects first, then weekly work.",
        "Add a second reminder several days before each large deadline.",
      ],
    },
    {
      heading: "The part people get wrong",
      body: [
        "Syllabus schedules are frequently relative: week 6 rather than October 12, or due at the start of section rather than a clock time. Translating those into real dates requires the academic calendar and your own section time, and it is where most manual entry goes wrong.",
        "It is worth resolving each ambiguous date once, at the start of term, rather than rediscovering it the night before.",
      ],
    },
    {
      heading: "Uploading it instead",
      body: [
        "caltodo accepts a syllabus PDF, extracts the dated items, and adds them to the same list as your Canvas and Gradescope deadlines, so the whole term is visible in week one.",
        "Extracted dates are shown for review before they are saved, because syllabus tables vary enormously and a date you cannot verify is worse than no date at all.",
      ],
    },
  ],
};
