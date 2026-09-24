/**
 * Audit section 4: the inbox's manual sync was dead (a 200-line
 * "Sync Assignments" modal nobody could open), invite responses failed
 * silently, the toolbar had icon-only controls with title only, the detail
 * panel took 50% at 768px, class recolor/delete issued N requests, and the
 * page was 1,133 lines.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Task } from "@/lib/types";
import { FILTER_OPTIONS, filterTasksByDate, formatSyncedAgo, isInboxFilter, sortByClass } from "@/app/app/inbox/inbox-helpers";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

function task(overrides: Partial<Task> & { id: string }): Task {
  return { title: overrides.id, due_date: null, sort_order: null, course_name: null, ...overrides } as Task;
}

describe("inbox helpers", () => {
  const now = new Date("2026-09-23T12:00:00");

  it("returns everything for all, today-or-earlier for today, a week for 7days", () => {
    const tasks = [task({ id: "late", due_date: "2026-09-01" }), task({ id: "week", due_date: "2026-09-30" }), task({ id: "far", due_date: "2026-12-01" }), task({ id: "none" })];
    expect(filterTasksByDate(tasks, "all", now)).toHaveLength(4);
    expect(filterTasksByDate(tasks, "today", now).map((t) => t.id)).toEqual(["late", "none"]);
    expect(filterTasksByDate(tasks, "7days", now).map((t) => t.id)).toEqual(["late", "week", "none"]);
  });

  it("uses sentence case for the filter labels", () => {
    expect(FILTER_OPTIONS.map((o) => o.label)).toEqual(["Inbox", "Today", "Next 7 days"]);
    expect(isInboxFilter("today")).toBe(true);
    expect(isInboxFilter("bogus")).toBe(false);
  });

  it("formats the synced-ago label", () => {
    const at = now.getTime();
    expect(formatSyncedAgo(null, at)).toBeNull();
    expect(formatSyncedAgo("2026-09-23T11:59:40", at)).toBe("Synced just now");
    expect(formatSyncedAgo("2026-09-23T11:35:00", at)).toBe("Synced 25m ago");
    expect(formatSyncedAgo("2026-09-23T08:00:00", at)).toBe("Synced 4h ago");
    expect(formatSyncedAgo("2026-09-20T08:00:00", at)).toBe("Synced 3d ago");
  });

  it("sorts by class then date with unclassed last", () => {
    const sorted = sortByClass([task({ id: "z", course_name: null }), task({ id: "b2", course_name: "B", due_date: "2026-10-01" }), task({ id: "b1", course_name: "B", due_date: "2026-09-01" }), task({ id: "a", course_name: "A" })]);
    expect(sorted.map((t) => t.id)).toEqual(["a", "b1", "b2", "z"]);
  });
});

describe("inbox page split", () => {
  it.each([
    "app/app/inbox/page.tsx",
    "app/app/inbox/InboxToolbar.tsx",
    "app/app/inbox/InboxTaskOverlays.tsx",
    "app/app/inbox/inbox-helpers.ts",
    "app/app/inbox/useInboxPreferences.ts",
    "app/app/inbox/useInviteResponses.ts",
  ])("%s stays under 300 lines", (file) => {
    expect(read(file).split("\n").length).toBeLessThanOrEqual(300);
  });

  it("wires Sync classes to SyncClassesModal and drops the dead sync modal", () => {
    const page = read("app/app/inbox/page.tsx");
    expect(page).toContain('import SyncClassesModal from "@/components/calendar/SyncClassesModal";');
    expect(page).not.toContain("Sync Assignments");
    expect(page).not.toContain("caltodo_sync_course_selections");
    expect(page).not.toContain("z-[9999]");
    expect(page).not.toContain("animate-stagger");
    expect(page).not.toContain("animate-view-switch");
    const toolbar = read("app/app/inbox/InboxToolbar.tsx");
    expect(toolbar).toContain("Sync classes");
    expect(toolbar).toContain("formatSyncedAgo(lastSyncedAt, now.getTime())");
    expect(toolbar).toContain('aria-label="Add task"');
    expect(toolbar).not.toContain("createPortal");
  });

  it("gives the detail panel 42% at md and a min width to the list", () => {
    const page = read("app/app/inbox/page.tsx");
    expect(page).toContain("md:w-[42%] lg:w-[50%]");
    expect(page).toContain("md:min-w-[320px]");
  });

  it("batches class recolor and delete through TaskContext", () => {
    const page = read("app/app/inbox/page.tsx");
    expect(page).toContain("recolorTasks([...new Set(ids)], color)");
    expect(page).toContain("await deleteTasks(ids);");
    const ctx = read("contexts/TaskContext.tsx");
    expect(ctx).toContain('supabase.from("tasks").update({ color }).in("id", targetIds)');
    expect(ctx).toContain('.delete().in("id", manual.map((t) => t.id))');
  });

  it("keeps invite rows until the server confirms and toasts errors with Retry", () => {
    const src = read("app/app/inbox/useInviteResponses.ts");
    expect(src).toContain("await postResponse(shareId, action);");
    expect(src.indexOf("await postResponse(shareId, action);")).toBeLessThan(src.indexOf("setInvites((prev) => prev.filter((i) => i.shareId !== shareId));"));
    expect(src).toContain('variant: "error"');
    expect(src).toContain('label: "Retry"');
    expect(src).toContain("results[i].status === \"fulfilled\"");
  });

  it("SyncClassesModal is built on Modal", () => {
    const src = read("components/calendar/SyncClassesModal.tsx");
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("createPortal");
  });

  it("the inbox loading skeleton mirrors the page wrapper", () => {
    const src = read("app/app/inbox/loading.tsx");
    expect(src).toContain("-m-4 md:-m-10");
    expect(src).toContain("<TaskListSkeleton />");
  });
});
