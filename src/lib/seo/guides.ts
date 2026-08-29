/**
 * Registry of published guides.
 *
 * Guides are declared as data modules under ./guide-content and collected here
 * so that the route, the index page, and sitemap.ts all read one ordered list.
 */

import type { Guide } from "./guide-types";
import { guide as syncCanvasGoogleCalendar } from "./guide-content/sync-canvas-to-google-calendar";
import { guide as canvasCalendarFeedUrl } from "./guide-content/canvas-calendar-feed-url";
import { guide as gradescopeDeadlines } from "./guide-content/gradescope-deadlines-in-calendar";
import { guide as syllabusToCalendar } from "./guide-content/syllabus-to-calendar";
import { guide as canvasAssignmentTracker } from "./guide-content/canvas-assignment-tracker";

export type { Guide, GuideSection } from "./guide-types";

/** All published guides, in the order they appear on the index page. */
export const GUIDES: readonly Guide[] = [
  syncCanvasGoogleCalendar,
  canvasCalendarFeedUrl,
  gradescopeDeadlines,
  syllabusToCalendar,
  canvasAssignmentTracker,
];

/** Slug lookup index, built once at module load. */
const BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));

/**
 * Looks up a guide by its URL slug.
 *
 * @param slug - Slug from the /guides/{slug} route segment
 * @returns The matching Guide, or undefined when the slug is unknown
 *          (caller is expected to render notFound()).
 */
export function getGuide(slug: string): Guide | undefined {
  return BY_SLUG.get(slug);
}
