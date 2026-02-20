import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Task, AppNotification } from "@/lib/types";
import {
  createTaskSnapshot,
  detectSyncChanges,
  generateNotificationId,
  isDuplicateNotification,
  formatShortDate,
} from "@/lib/notification-helpers";

/** Creates a minimal task with required fields for testing. */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    user_id: "user-1",
    title: "Homework 1",
    description: "",
    due_date: "2026-02-20",
    due_time: null,
    is_completed: false,
    color: "#3B82F6",
    created_at: "2026-02-18T00:00:00Z",
    updated_at: "2026-02-18T00:00:00Z",
    source: null,
    external_id: null,
    course_name: null,
    source_url: null,
    points_possible: null,
    is_submitted: false,
    google_event_id: null,
    dismissed_at: null,
    repeat_interval: null,
    repeat_unit: null,
    repeat_end_date: null,
    repeat_end_count: null,
    late_due_date: null,
    ...overrides,
  };
}

describe("createTaskSnapshot", () => {
  it("should create a byId map of all tasks", () => {
    const tasks = [
      makeTask({ id: "t1" }),
      makeTask({ id: "t2" }),
    ];
    const snapshot = createTaskSnapshot(tasks);
    expect(snapshot.byId.size).toBe(2);
    expect(snapshot.byId.get("t1")?.id).toBe("t1");
    expect(snapshot.byId.get("t2")?.id).toBe("t2");
  });

  it("should build knownExternalKeys for synced tasks", () => {
    const tasks = [
      makeTask({ id: "t1", source: "canvas", external_id: "ext-1" }),
      makeTask({ id: "t2", source: "gradescope", external_id: "ext-2" }),
      makeTask({ id: "t3" }), // manual task — no external key
    ];
    const snapshot = createTaskSnapshot(tasks);
    expect(snapshot.knownExternalKeys.size).toBe(2);
    expect(snapshot.knownExternalKeys.has("canvas:ext-1")).toBe(true);
    expect(snapshot.knownExternalKeys.has("gradescope:ext-2")).toBe(true);
  });

  it("should return empty collections for empty task list", () => {
    const snapshot = createTaskSnapshot([]);
    expect(snapshot.byId.size).toBe(0);
    expect(snapshot.knownExternalKeys.size).toBe(0);
  });
});

describe("detectSyncChanges", () => {
  it("should detect new synced assignments", () => {
    const snapshot = createTaskSnapshot([]);
    const freshTasks = [
      makeTask({
        id: "new-1",
        title: "Lab 3",
        source: "canvas",
        external_id: "c-100",
        course_name: "CS 61A",
      }),
    ];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe("new_assignment");
    expect(changes[0].title).toBe("New: Lab 3");
    expect(changes[0].description).toBe("CS 61A via canvas");
    expect(changes[0].taskId).toBe("new-1");
  });

  it("should not detect new manual tasks as new_assignment", () => {
    const snapshot = createTaskSnapshot([]);
    const freshTasks = [makeTask({ id: "manual-1", title: "Buy groceries" })];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(0);
  });

  it("should detect auto-completed tasks", () => {
    const before = makeTask({
      id: "t1",
      title: "HW 5",
      source: "canvas",
      external_id: "c-200",
      is_completed: false,
      is_submitted: true,
    });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [{ ...before, is_completed: true }];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe("auto_completed");
    expect(changes[0].title).toBe("HW 5 auto-completed");
    expect(changes[0].description).toBe("Submitted on canvas");
  });

  it("should detect due_date changes on synced tasks", () => {
    const before = makeTask({
      id: "t1",
      title: "Essay",
      source: "gradescope",
      external_id: "g-50",
      due_date: "2026-02-18",
    });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [{ ...before, due_date: "2026-02-25" }];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe("assignment_updated");
    expect(changes[0].description).toContain("due date → 2026-02-25");
  });

  it("should detect title changes on synced tasks", () => {
    const before = makeTask({
      id: "t1",
      title: "Project 1",
      source: "canvas",
      external_id: "c-300",
    });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [{ ...before, title: "Project 1 (Updated)" }];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe("assignment_updated");
    expect(changes[0].title).toBe("Project 1 (Updated)");
    expect(changes[0].description).toContain("title updated");
  });

  it("should detect points_possible changes", () => {
    const before = makeTask({
      id: "t1",
      title: "Quiz 2",
      source: "canvas",
      external_id: "c-400",
      points_possible: 10,
    });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [{ ...before, points_possible: 20 }];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(1);
    expect(changes[0].description).toContain("points → 20");
  });

  it("should not detect changes on manual tasks", () => {
    const before = makeTask({ id: "t1", title: "Old Title" });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [{ ...before, title: "New Title" }];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(0);
  });

  it("should combine multiple field changes in one notification", () => {
    const before = makeTask({
      id: "t1",
      title: "HW 3",
      source: "canvas",
      external_id: "c-500",
      due_date: "2026-02-18",
      points_possible: 10,
    });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [
      { ...before, due_date: "2026-02-20", points_possible: 15 },
    ];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(1);
    expect(changes[0].description).toContain("due date → 2026-02-20");
    expect(changes[0].description).toContain("points → 15");
  });

  it("should NOT detect auto-completed when baseline already shows completed (user completed before sync)", () => {
    // Simulates: user marks task complete → baseline updated → sync runs
    // The baseline reflects the user's action, so no false notification
    const before = makeTask({
      id: "t1",
      title: "HW 5",
      source: "canvas",
      external_id: "c-200",
      is_completed: true, // baseline already shows completed (user did it)
      is_submitted: true,
    });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [{ ...before, is_completed: true }];
    const changes = detectSyncChanges(snapshot, freshTasks);
    expect(changes).toHaveLength(0);
  });

  it("should skip existing external keys for new task IDs", () => {
    // Task was deleted and re-created with same external key but new ID
    const before = makeTask({
      id: "old-id",
      source: "canvas",
      external_id: "c-100",
    });
    const snapshot = createTaskSnapshot([before]);
    const freshTasks = [
      makeTask({
        id: "new-id",
        source: "canvas",
        external_id: "c-100",
      }),
    ];
    const changes = detectSyncChanges(snapshot, freshTasks);
    // Should not create new_assignment since external key was known
    expect(
      changes.filter((c) => c.type === "new_assignment"),
    ).toHaveLength(0);
  });
});

describe("generateNotificationId", () => {
  it("should return a string starting with n_", () => {
    const id = generateNotificationId();
    expect(id).toMatch(/^n_/);
  });

  it("should generate unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateNotificationId()));
    expect(ids.size).toBe(100);
  });
});

describe("isDuplicateNotification", () => {
  it("should return true for same type+taskId within default window (10 min)", () => {
    const existing: AppNotification[] = [
      {
        id: "n1",
        type: "new_assignment",
        title: "New: HW 5",
        description: null,
        taskId: "t1",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    expect(isDuplicateNotification(existing, "new_assignment", "t1")).toBe(true);
  });

  it("should return true for same type+taskId at 5 minutes ago (within 10 min window)", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    const existing: AppNotification[] = [
      {
        id: "n1",
        type: "new_assignment",
        title: "New: HW 5",
        description: null,
        taskId: "t1",
        read: false,
        createdAt: fiveMinAgo,
      },
    ];
    expect(isDuplicateNotification(existing, "new_assignment", "t1")).toBe(true);
  });

  it("should return false for same type+taskId outside default window (10 min)", () => {
    const oldDate = new Date(Date.now() - 11 * 60_000).toISOString();
    const existing: AppNotification[] = [
      {
        id: "n1",
        type: "new_assignment",
        title: "New: HW 5",
        description: null,
        taskId: "t1",
        read: false,
        createdAt: oldDate,
      },
    ];
    expect(isDuplicateNotification(existing, "new_assignment", "t1")).toBe(false);
  });

  it("should return false for different type", () => {
    const existing: AppNotification[] = [
      {
        id: "n1",
        type: "new_assignment",
        title: "New: HW 5",
        description: null,
        taskId: "t1",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    expect(isDuplicateNotification(existing, "assignment_updated", "t1")).toBe(false);
  });

  it("should return false when taskId is null", () => {
    const existing: AppNotification[] = [];
    expect(isDuplicateNotification(existing, "sync_error", null)).toBe(false);
  });
});

describe("formatShortDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-18T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return time only for today's date", () => {
    const result = formatShortDate("2026-02-18T10:00:00Z");
    // Should show time in local timezone (varies by env), just check it's not "Today"
    expect(result).not.toBe("Today");
    expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M/);
  });

  it("should return Yesterday with time for yesterday's date", () => {
    const result = formatShortDate("2026-02-17T10:00:00Z");
    expect(result).toContain("Yesterday");
    expect(result).toMatch(/Yesterday, \d{1,2}:\d{2}\s[AP]M/);
  });

  it("should return formatted date with time for older dates", () => {
    const result = formatShortDate("2026-02-14T10:00:00Z");
    expect(result).toContain("Feb");
    expect(result).toContain("14");
    expect(result).toMatch(/[AP]M/);
  });

  it("should return empty string for invalid dates", () => {
    expect(formatShortDate("not-a-date")).toBe("");
  });

  it("should include year for dates in a different year", () => {
    const result = formatShortDate("2025-06-15T14:30:00Z");
    expect(result).toContain("2025");
    expect(result).toMatch(/[AP]M/);
  });
});
