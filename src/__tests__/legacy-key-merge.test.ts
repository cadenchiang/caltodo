/**
 * Tests the re-key reconciliation that runs before every upsert.
 *
 * The regression it guards: after Canvas override events moved from the
 * override id to the assignment id, a user's completed "Quiz 3 (1 student)"
 * came back as an overdue incomplete task because the sync resurrected the
 * old assignment-keyed row and abandoned the completed override-keyed one.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { mergeLegacyKeyedTasks } from "@/lib/legacy-key-merge";
import type { NormalizedAssignment } from "@/lib/canvas-client";

type Row = Record<string, unknown> & { id: string; external_id: string };

/**
 * Minimal supabase stand-in: `select ... in(external_id)` reads from `rows`,
 * `update ... eq(id)` records the payload in `updates`.
 */
function fakeSupabase(rows: Row[], failUpdate = false) {
  const updates: Array<{ id: string; payload: Record<string, unknown> }> = [];
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: async (_col: string, ids: string[]) => ({
              data: rows.filter((r) => ids.includes(r.external_id)),
              error: null,
            }),
          }),
        }),
      }),
      update: (payload: Record<string, unknown>) => ({
        eq: async (_col: string, id: string) => {
          if (failUpdate) return { error: { message: "boom" } };
          updates.push({ id, payload });
          return { error: null };
        },
      }),
    }),
  };
  return { client: client as never, updates };
}

const assignment = (external_id: string, legacy?: string): NormalizedAssignment => ({
  external_id,
  course_name: "DEMOG C126",
  course_id: "canvas-ical",
  title: "Quiz 3 (1 student)",
  due_date: "2026-09-18T12:00:00Z",
  source_url: null,
  points_possible: null,
  ...(legacy ? { legacy_external_id: legacy } : {}),
});

describe("mergeLegacyKeyedTasks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does nothing when no assignment carries a legacy key", async () => {
    const { client, updates } = fakeSupabase([]);
    const r = await mergeLegacyKeyedTasks(client, "u1", "canvas", [assignment("9098695")]);
    expect(r).toEqual({ renamed: 0, merged: 0, hiddenTaskIds: [], errors: [] });
    expect(updates).toEqual([]);
  });

  it("renames the legacy row when nothing exists under the new key", async () => {
    const { client, updates } = fakeSupabase([
      { id: "t-old", external_id: "387447", is_completed: true, completed_at: "2026-09-18T20:00:00Z", color: null, dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
    ]);
    const r = await mergeLegacyKeyedTasks(client, "u1", "canvas", [assignment("9098695", "387447")]);
    expect(r.renamed).toBe(1);
    expect(updates).toEqual([{ id: "t-old", payload: { external_id: "9098695" } }]);
  });

  it("carries completion to the new-key row and hides the legacy row", async () => {
    // Exactly the production case: assignment-keyed row incomplete and
    // resurrected, override-keyed row completed by the user.
    const { client, updates } = fakeSupabase([
      { id: "t-new", external_id: "9098695", is_completed: false, completed_at: null, color: "blue", dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
      { id: "t-old", external_id: "387447", is_completed: true, completed_at: "2026-09-18T20:00:00Z", color: "blue", dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: "2026-09-17T00:00:00Z", due_time_manually_edited_at: null },
    ]);
    const r = await mergeLegacyKeyedTasks(client, "u1", "canvas", [assignment("9098695", "387447")]);
    expect(r.merged).toBe(1);
    expect(r.hiddenTaskIds).toEqual(["t-old"]);
    expect(updates[0]).toEqual({
      id: "t-new",
      payload: { is_completed: true, completed_at: "2026-09-18T20:00:00Z", due_date_manually_edited_at: "2026-09-17T00:00:00Z" },
    });
    expect(updates[1].id).toBe("t-old");
    expect(updates[1].payload.dismissed_by_user).toBe(false);
    expect(typeof updates[1].payload.dismissed_at).toBe("string");
  });

  it("keeps a user dismissal and a custom colour from the legacy row", async () => {
    const { client, updates } = fakeSupabase([
      { id: "t-new", external_id: "9098695", is_completed: false, completed_at: null, color: "blue", dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
      { id: "t-old", external_id: "387447", is_completed: false, completed_at: null, color: "red", dismissed_at: "2026-09-10T00:00:00Z", dismissed_by_user: true, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
    ]);
    await mergeLegacyKeyedTasks(client, "u1", "canvas", [assignment("9098695", "387447")]);
    expect(updates[0].payload).toEqual({ dismissed_at: "2026-09-10T00:00:00Z", dismissed_by_user: true, color: "red" });
  });

  it("hides the legacy row even when there is nothing to carry over", async () => {
    const { client, updates } = fakeSupabase([
      { id: "t-new", external_id: "9098695", is_completed: true, completed_at: "x", color: "blue", dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
      { id: "t-old", external_id: "387447", is_completed: false, completed_at: null, color: "blue", dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
    ]);
    const r = await mergeLegacyKeyedTasks(client, "u1", "canvas", [assignment("9098695", "387447")]);
    expect(r.merged).toBe(1);
    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe("t-old");
  });

  it("leaves the legacy row visible when the carry-over write fails", async () => {
    const { client, updates } = fakeSupabase([
      { id: "t-new", external_id: "9098695", is_completed: false, completed_at: null, color: null, dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
      { id: "t-old", external_id: "387447", is_completed: true, completed_at: null, color: null, dismissed_at: null, dismissed_by_user: false, due_date_manually_edited_at: null, due_time_manually_edited_at: null },
    ], true);
    const r = await mergeLegacyKeyedTasks(client, "u1", "canvas", [assignment("9098695", "387447")]);
    expect(r.merged).toBe(0);
    expect(r.errors).toHaveLength(1);
    expect(r.hiddenTaskIds).toEqual([]);
    expect(updates).toEqual([]);
  });
});
