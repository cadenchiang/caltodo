/**
 * Pure helpers for the admin overview route, kept out of the route module
 * because Next.js forbids extra exports from route files.
 *
 * @module admin-overview-helpers
 */

/**
 * Counts distinct users with at least one syllabus-imported task.
 *
 * @param tasks - Every task row, with its source and owner
 * @returns The number of users who have used the syllabus upload
 */
export function countSyllabusUsers(tasks: ReadonlyArray<{ source: string | null; user_id: string }>): number {
  const users = new Set<string>();
  for (const task of tasks) if (task.source === "syllabus") users.add(task.user_id);
  return users.size;
}
