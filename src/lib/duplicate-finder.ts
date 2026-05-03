/**
 * Detects assignments that appear on more than one platform (e.g. Canvas
 * and Gradescope) so the user can merge them into a single task.
 *
 * Conservative by design: requires the same due_date and a high title
 * similarity. Only matches across different `source` values so manually
 * created tasks never get flagged.
 *
 * @module duplicate-finder
 */

import type { Task } from "@/lib/types";
import { extractCourseCode } from "@/lib/course-name-merge";

/** Minimum Jaccard token overlap to consider two titles equivalent. */
const TITLE_SIMILARITY_THRESHOLD = 0.7;

/** Tokens stripped before comparison — they appear inconsistently across sources. */
const NOISE_TOKENS = new Set([
  "hw",
  "homework",
  "assignment",
  "ps",
  "pset",
  "problem",
  "set",
  "lab",
  "the",
  "a",
  "an",
  "of",
  "for",
  "to",
  "and",
]);

/**
 * Lower-cases, strips punctuation, removes leading/trailing course-code
 * prefixes, and drops common noise words. Returns the remaining tokens.
 *
 * @param title - Raw task title
 * @returns Array of normalized tokens
 */
export function normalizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/\b[a-z]{2,6}\s*\d{2,4}[a-z]?\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !NOISE_TOKENS.has(t));
}

/**
 * Jaccard similarity (|A ∩ B| / |A ∪ B|) between two token arrays.
 * Returns 1 when both are empty (treated as identical empty titles).
 *
 * @param a - First token list
 * @param b - Second token list
 * @returns Similarity in [0, 1]
 */
export function tokenSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Returns true when two course names refer to the same course.
 * Uses extracted course codes when available; otherwise falls back to
 * exact string match. A null on either side counts as "no constraint."
 */
function sameCourse(a: string | null, b: string | null): boolean {
  if (!a || !b) return true;
  if (a === b) return true;
  const codeA = extractCourseCode(a);
  const codeB = extractCourseCode(b);
  if (codeA && codeB) return codeA === codeB;
  return false;
}

/**
 * Returns true when two tasks are likely the same assignment from
 * different platforms. Both must be synced, share a due_date, come from
 * different sources, and have similar titles.
 *
 * @param a - Candidate task
 * @param b - Candidate task
 * @returns Whether the pair should be offered for merging
 */
export function isLikelyDuplicate(a: Task, b: Task): boolean {
  if (a.id === b.id) return false;
  if (a.dismissed_at || b.dismissed_at) return false;
  if (!a.source || !b.source) return false;
  if (a.source === b.source) return false;
  if (a.due_date !== b.due_date) return false;
  if (!sameCourse(a.course_name, b.course_name)) return false;
  const sim = tokenSimilarity(normalizeTitle(a.title), normalizeTitle(b.title));
  return sim >= TITLE_SIMILARITY_THRESHOLD;
}

/**
 * Returns every task in `allTasks` that looks like a duplicate of `task`.
 * Excludes the task itself and any dismissed tasks.
 *
 * @param task - The reference task
 * @param allTasks - The pool of tasks to search
 * @returns Matching duplicate tasks (possibly empty)
 */
export function findDuplicatesFor(task: Task, allTasks: Task[]): Task[] {
  return allTasks.filter((other) => isLikelyDuplicate(task, other));
}
