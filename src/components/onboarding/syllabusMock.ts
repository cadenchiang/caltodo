/**
 * Development-only sample data for the syllabus preview, loaded through
 * `?mock=true` so the review table can be styled without calling the
 * extraction API. Never active outside NODE_ENV === "development".
 */

import type { SelectableAssignment } from "./SyllabusPreview";

/**
 * Whether the mock query param may load sample assignments.
 *
 * @param search - The current URLSearchParams
 * @param nodeEnv - process.env.NODE_ENV (injected for tests)
 * @returns True only in development with ?mock=true
 */
export function shouldLoadSyllabusMock(search: { get(name: string): string | null }, nodeEnv: string | undefined): boolean {
  return nodeEnv === "development" && search.get("mock") === "true";
}

/** Course name paired with the sample assignments. */
export const MOCK_COURSE_NAME = "CS 170: Efficient Algorithms";

/** Sample assignments spanning dated, undated, selected and unselected rows. */
export const MOCK_ASSIGNMENTS: SelectableAssignment[] = [
  { title: "Homework 1: Introduction to Algorithms", description: "Covers chapters 1-3", due_date: "2026-01-15", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 2: Sorting and Searching", description: "Merge sort, quicksort, binary search", due_date: "2026-01-22", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Project 1: Data Structures", description: "Implement a balanced BST", due_date: "2026-02-05", due_time: "23:59", points_possible: 200, selected: true },
  { title: "Midterm 1", description: null, due_date: "2026-02-12", due_time: "14:00", points_possible: 150, selected: true },
  { title: "Homework 3: Graph Algorithms", description: "BFS, DFS, shortest paths", due_date: "2026-02-19", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 4: Dynamic Programming", description: "Knapsack, LCS, edit distance", due_date: "2026-02-26", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Project 2: Network Flow", description: "Max flow / min cut implementation", due_date: "2026-03-12", due_time: "23:59", points_possible: 200, selected: true },
  { title: "Homework 5: NP-Completeness", description: "Reductions and proofs", due_date: "2026-03-19", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Midterm 2", description: null, due_date: "2026-03-26", due_time: "14:00", points_possible: 150, selected: true },
  { title: "Homework 6: Approximation Algorithms", description: "Vertex cover, TSP", due_date: "2026-04-02", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 7: Randomized Algorithms", description: null, due_date: "2026-04-09", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Project 3: Final Project", description: "Open-ended algorithmic project", due_date: "2026-04-23", due_time: "23:59", points_possible: 300, selected: true },
  { title: "Homework 8: Review Problems", description: "Comprehensive review", due_date: "2026-04-16", due_time: "23:59", points_possible: 100, selected: true },
  { title: "Homework 9: Advanced Topics", description: "Streaming, online algorithms", due_date: null, due_time: null, points_possible: 100, selected: true },
  { title: "Reading Quiz 1", description: null, due_date: "2026-01-10", due_time: "09:00", points_possible: 10, selected: false },
  { title: "Reading Quiz 2", description: null, due_date: "2026-01-24", due_time: "09:00", points_possible: 10, selected: false },
  { title: "Final Exam", description: "Comprehensive final", due_date: "2026-05-07", due_time: "10:00", points_possible: 250, selected: true },
  { title: "Extra Credit: Research Paper Review", description: "Review a recent algorithms paper", due_date: null, due_time: null, points_possible: 50, selected: true },
];
