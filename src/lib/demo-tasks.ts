/**
 * Fake tasks for demo video. Spread across Canvas, Gradescope, Pensieve,
 * and manual sources with realistic Berkeley course names.
 * Tasks span the current week and next two weeks to fill the calendar.
 */
import type { Task } from "@/lib/types";

/** Returns a date string (YYYY-MM-DD) offset by `days` from today. */
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEMO_USER_ID = "demo-user";

const COLORS = {
  canvas: "#0e89d6",
  gradescope: "#10B981",
  pensieve: "#8B5CF6",
  brightspace: "#E87040",
  syllabus: "#8B5CF6",
  manual: "#F59E0B",
};

/** Generate a fake task with sensible defaults. */
function fake(
  id: number,
  title: string,
  source: Task["source"],
  course: string,
  dayOffset: number,
  time: string | null = null,
): Task {
  return {
    id: `demo-${id}`,
    user_id: DEMO_USER_ID,
    title,
    description: "",
    due_date: dateOffset(dayOffset),
    due_time: time,
    is_completed: false,
    color: source ? COLORS[source] : COLORS.manual,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source,
    external_id: source ? `demo-ext-${id}` : null,
    course_name: course,
    source_url: null,
    points_possible: source ? 100 : null,
    is_submitted: false,
    google_event_id: null,
    dismissed_at: null,
    repeat_interval: null,
    repeat_unit: null,
    repeat_end_date: null,
    repeat_end_count: null,
    late_due_date: null,
    completed_at: null,
    tags: [],
    snoozed_until: null,
    sort_order: null,
    due_date_manually_edited_at: null,
    due_time_manually_edited_at: null,
  };
}

export const DEMO_TASKS: Task[] = [
  // === Canvas (bCourses) ===
  fake(1, "HW 8: Recursion & Trees", "canvas", "CS 61A", 0, "23:59"),
  fake(2, "Lab 6: Linked Lists", "canvas", "CS 61A", 2, "23:59"),
  fake(3, "Project 3: Ants vs. Bees", "canvas", "CS 61A", 5, "23:59"),
  fake(4, "Discussion 9: Scheme", "canvas", "CS 61A", 8, "23:59"),
  fake(5, "HW 5: Eigenvalues", "canvas", "Math 54", 1, "23:59"),
  fake(6, "HW 6: Diagonalization", "canvas", "Math 54", 7, "23:59"),
  fake(7, "Worksheet 7: Inner Products", "canvas", "Math 54", 11, "23:59"),
  fake(8, "Essay 2: Rhetorical Analysis", "canvas", "English R1A", 3, "17:00"),
  fake(9, "Peer Review Draft", "canvas", "English R1A", 6, "12:00"),
  fake(10, "Reading Response 5", "canvas", "English R1A", 10, "23:59"),
  fake(11, "Lab 7: RISC-V Assembly", "canvas", "CS 61C", 1, "23:59"),
  fake(12, "HW 6: Pipelining", "canvas", "CS 61C", 4, "23:59"),
  fake(13, "Project 3: CPU Design", "canvas", "CS 61C", 9, "23:59"),

  // === Gradescope ===
  fake(14, "HW 8: Sorting & Hashing", "gradescope", "CS 61B", 0, "23:59"),
  fake(15, "Lab 7: Git Advanced", "gradescope", "CS 61B", 2, "23:59"),
  fake(16, "Project 2: Gitlet Checkpoint", "gradescope", "CS 61B", 6, "23:59"),
  fake(17, "Project 2: Gitlet Final", "gradescope", "CS 61B", 12, "23:59"),
  fake(18, "Midterm 2 Regrade Requests", "gradescope", "CS 61B", 3, "17:00"),
  fake(19, "HW 7: Probability Distributions", "gradescope", "Data 140", 1, "23:59"),
  fake(20, "HW 8: Expectation & Variance", "gradescope", "Data 140", 5, "23:59"),
  fake(21, "Lab 5: Markov Chains", "gradescope", "Data 140", 8, "23:59"),
  fake(22, "HW 9: Normal Approximation", "gradescope", "Data 140", 13, "23:59"),
  fake(23, "Problem Set 6: Optimization", "gradescope", "EECS 127", 2, "23:59"),
  fake(24, "Problem Set 7: Duality", "gradescope", "EECS 127", 9, "23:59"),

  // === Pensieve ===
  fake(25, "Disc 8: Mutable Trees", "pensieve", "CS 61A", 0, "14:00"),
  fake(26, "Disc 9: Scheme Basics", "pensieve", "CS 61A", 4, "14:00"),
  fake(27, "Disc 10: Interpreters", "pensieve", "CS 61A", 7, "14:00"),
  fake(28, "Disc 7: Asymptotics", "pensieve", "CS 61B", 1, "16:00"),
  fake(29, "Disc 8: Graphs & Trees", "pensieve", "CS 61B", 5, "16:00"),
  fake(30, "Disc 9: Shortest Paths", "pensieve", "CS 61B", 10, "16:00"),
  fake(31, "Lab Review: Caches", "pensieve", "CS 61C", 3, "10:00"),
  fake(32, "Lab Review: Virtual Memory", "pensieve", "CS 61C", 8, "10:00"),

  // === Manual tasks ===
  fake(33, "Study for Math 54 Midterm 2", null, "Math 54", 4, null),
  fake(34, "Office Hours: CS 61B", null, "CS 61B", 1, "15:00"),
  fake(35, "Meet study group", null, "", 2, "18:00"),
  fake(36, "Register for Spring classes", null, "", 6, null),
  fake(37, "CS 61A Midterm 2 Review", null, "CS 61A", 3, "19:00"),
  fake(38, "Data 140 Study Session", null, "Data 140", 7, "17:00"),
];
