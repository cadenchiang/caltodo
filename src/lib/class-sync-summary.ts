/**
 * Toast copy for the "save class selection" flow in settings.
 *
 * The toast used to interpolate every course name it touched, which produced
 * lines like "Synced 4 tasks from ASTRON 11- ASTROBIO, UGBA 100-LEC-003.
 * Hidden CS 198: Full Stack Decal (SP26), UGBA 101A-LEC-002 Microeconomic
 * Analysis for Business Decisions (Spring 2026)." Course names carry section
 * codes and term suffixes, so two of them overflow the toast. These helpers
 * collapse lists to a count and reduce a lone name to its course code.
 */

/**
 * Leading course code in a catalogue title: one or two department words
 * followed by a number and an optional level letter. Matches "CS 198",
 * "UGBA 101A" and "COMP SCI 200"; the optional second word cannot swallow the
 * number because it only accepts letters.
 */
const COURSE_CODE = /^([A-Za-z&]+(?:\s+[A-Za-z&]+)?\s+\d+[A-Za-z]*)/;

/** Longest a fallback (uncoded) name may be before it is clipped. */
const MAX_FALLBACK_LENGTH = 24;

/**
 * Reduces a full course title to something that fits in a toast.
 *
 * Prefers the leading course code, since that is how students refer to a
 * class. Falls back to the title with its trailing parenthetical term dropped,
 * clipped to `MAX_FALLBACK_LENGTH` with an ellipsis.
 *
 * @param name - Raw course title from Canvas, Gradescope or Pensive.
 * @returns A short label. Empty/whitespace input returns an empty string.
 */
export function shortenClassName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";

  const code = trimmed.match(COURSE_CODE)?.[1];
  if (code) return code.replace(/\s+/g, " ");

  // No parsable code: drop "(Spring 2026)"-style suffixes, then clip.
  const withoutTerm = trimmed.replace(/\s*\([^)]*\)\s*$/, "").trim() || trimmed;
  if (withoutTerm.length <= MAX_FALLBACK_LENGTH) return withoutTerm;
  return withoutTerm.slice(0, MAX_FALLBACK_LENGTH - 1).trimEnd() + "…";
}

/**
 * Describes a set of classes in as few words as possible.
 *
 * One class is named outright; more than one collapses to a count, because
 * listing them is what made the original toast unreadable.
 *
 * @param names - Course titles being described.
 * @returns "CS 198", "3 classes", or "" when the list is empty.
 */
export function describeClasses(names: string[]): string {
  const usable = names.map((n) => n.trim()).filter(Boolean);
  if (usable.length === 0) return "";
  if (usable.length === 1) return shortenClassName(usable[0]);
  return `${usable.length} classes`;
}

/** Inputs describing what a class-selection save actually changed. */
export interface ClassSyncSummaryInput {
  /** Tasks pulled in for newly added classes. */
  syncedCount: number;
  /** Names of the classes the user added. */
  addedNames: string[];
  /** Tasks un-hidden because a previously removed class was re-added. */
  restoredCount: number;
  /** Names of the re-added classes. */
  reAddedNames: string[];
  /** Tasks hidden because their class was removed. */
  hiddenCount: number;
  /** Names of the classes the user removed. */
  removedNames: string[];
}

/**
 * Builds the confirmation toast for a saved class selection.
 *
 * Reports at most one "added" clause and at most one "removed" clause. The
 * added clause prefers newly synced tasks, then restored tasks, then reports
 * that nothing new was found. Returns "" when nothing changed, so callers can
 * skip the toast entirely.
 *
 * @param input - What the save changed.
 * @returns A single sentence pair, e.g. "Synced 4 tasks from 2 classes. Hid
 *          2 classes." Empty string when there is nothing to report.
 */
export function buildClassSyncSummary(input: ClassSyncSummaryInput): string {
  const { syncedCount, addedNames, restoredCount, reAddedNames, hiddenCount, removedNames } = input;
  const parts: string[] = [];

  const added = describeClasses(addedNames);
  const reAdded = describeClasses(reAddedNames);
  const removed = describeClasses(removedNames);

  if (syncedCount > 0 && added) {
    parts.push(`Synced ${syncedCount} ${plural(syncedCount, "task")} from ${added}`);
  } else if (restoredCount > 0 && reAdded) {
    parts.push(`Restored ${restoredCount} ${plural(restoredCount, "task")} from ${reAdded}`);
  } else if (added) {
    parts.push(`No new tasks from ${added}`);
  }

  if (removed) {
    parts.push(
      hiddenCount > 0
        ? `Hid ${hiddenCount} ${plural(hiddenCount, "task")} from ${removed}`
        : `Hid ${removed}`
    );
  }

  return parts.length > 0 ? parts.join(". ") + "." : "";
}

/**
 * Pluralises a bare noun by count.
 *
 * @param n - The count.
 * @param noun - Singular noun; pluralised by appending "s".
 * @returns The correctly numbered noun.
 */
function plural(n: number, noun: string): string {
  return n === 1 ? noun : `${noun}s`;
}
