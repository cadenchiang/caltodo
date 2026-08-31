/**
 * Tests for multi-account feed syncing.
 *
 * Two failure modes drive this suite, both of which destroy user data rather
 * than merely failing:
 *
 *   - Syncing accounts one at a time lets each account's dismissMissingTasks
 *     delete the previous account's tasks. The fetch must therefore return a
 *     single merged set.
 *   - external_id is only unique within one feed, so two installations sharing
 *     a VEVENT UID would overwrite each other under the
 *     (user_id, source, external_id) upsert key.
 */

import { describe, it, expect, vi } from "vitest";
import type { NormalizedAssignment } from "@/lib/canvas-client";
import {
  scopeExternalId,
  loadFeedAccounts,
  fetchAllFeedAssignments,
  PRIMARY_ACCOUNT_ID,
  type FeedAccount,
} from "@/lib/feed-accounts";

/** Minimal assignment stub; only external_id matters to these tests. */
const assignment = (externalId: string): NormalizedAssignment => ({
  external_id: externalId,
  course_name: "Course",
  course_id: "brightspace",
  title: "Essay",
  due_date: "2026-09-01T23:59:00Z",
  due_is_all_day: false,
  source_url: null,
  points_possible: null,
  is_submitted: false,
  description: null,
});

const primary: FeedAccount = { id: PRIMARY_ACCOUNT_ID, url: "https://a.edu/f.ics", isPrimary: true };
const extra: FeedAccount = { id: "acc-uuid-1", url: "https://b.edu/f.ics", isPrimary: false };

/**
 * Builds a Supabase client stub whose integration_accounts query resolves to
 * the given result. Only the chained calls this module makes are implemented.
 */
function supabaseStub(result: { data?: unknown[]; error?: { message: string } | null }) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data: result.data ?? null, error: result.error ?? null }).then(resolve),
  };
  return { from: () => chain } as never;
}

describe("scopeExternalId", () => {
  it("leaves the primary account's ids untouched", () => {
    // Rewriting these would orphan every existing row and re-import duplicates.
    expect(scopeExternalId("bs-uid-1", primary)).toBe("bs-uid-1");
  });

  it("scopes an additional account's ids to that account", () => {
    expect(scopeExternalId("bs-uid-1", extra)).toBe("bs-uid-1@acc-uuid-1");
  });

  it("keeps colliding UIDs from different feeds distinct", () => {
    const other: FeedAccount = { id: "acc-uuid-2", url: "https://c.edu/f.ics", isPrimary: false };
    expect(scopeExternalId("bs-uid-1", extra)).not.toBe(scopeExternalId("bs-uid-1", other));
  });

  it("is stable across calls, so resyncs upsert rather than duplicate", () => {
    expect(scopeExternalId("bs-uid-1", extra)).toBe(scopeExternalId("bs-uid-1", extra));
  });
});

describe("loadFeedAccounts", () => {
  it("returns the primary account first", async () => {
    const out = await loadFeedAccounts(supabaseStub({ data: [] }), "u1", "brightspace", "https://a.edu/f.ics");
    expect(out).toEqual([{ id: PRIMARY_ACCOUNT_ID, url: "https://a.edu/f.ics", isPrimary: true }]);
  });

  it("appends additional accounts from the table", async () => {
    const out = await loadFeedAccounts(
      supabaseStub({ data: [{ id: "acc-1", connection: { calendar_url: "https://b.edu/f.ics" } }] }),
      "u1", "brightspace", "https://a.edu/f.ics"
    );
    expect(out).toHaveLength(2);
    expect(out[1]).toEqual({ id: "acc-1", url: "https://b.edu/f.ics", isPrimary: false });
  });

  it("returns additional accounts even with no primary connected", async () => {
    const out = await loadFeedAccounts(
      supabaseStub({ data: [{ id: "acc-1", connection: { calendar_url: "https://b.edu/f.ics" } }] }),
      "u1", "blackboard", null
    );
    expect(out).toEqual([{ id: "acc-1", url: "https://b.edu/f.ics", isPrimary: false }]);
  });

  it("returns nothing when nothing is connected", async () => {
    expect(await loadFeedAccounts(supabaseStub({ data: [] }), "u1", "pensieve", null)).toEqual([]);
  });

  it("skips rows with a missing or blank calendar_url", async () => {
    const out = await loadFeedAccounts(
      supabaseStub({ data: [
        { id: "a", connection: {} },
        { id: "b", connection: { calendar_url: "   " } },
        { id: "c", connection: null },
        { id: "d", connection: { calendar_url: "https://ok.edu/f.ics" } },
      ] }),
      "u1", "brightspace", null
    );
    expect(out.map((a) => a.id)).toEqual(["d"]);
  });

  it("trims a padded URL", async () => {
    const out = await loadFeedAccounts(
      supabaseStub({ data: [{ id: "a", connection: { calendar_url: "  https://b.edu/f.ics  " } }] }),
      "u1", "brightspace", null
    );
    expect(out[0].url).toBe("https://b.edu/f.ics");
  });

  it("degrades to the primary account when the table query errors", async () => {
    // An unmigrated or unavailable table must not stop the sync.
    const out = await loadFeedAccounts(
      supabaseStub({ error: { message: "relation does not exist" } }),
      "u1", "brightspace", "https://a.edu/f.ics"
    );
    expect(out).toHaveLength(1);
    expect(out[0].isPrimary).toBe(true);
  });

  it("degrades rather than throwing when the client blows up entirely", async () => {
    const exploding = { from: () => { throw new Error("network down"); } } as never;
    const out = await loadFeedAccounts(exploding, "u1", "brightspace", "https://a.edu/f.ics");
    expect(out).toHaveLength(1);
  });
});

describe("fetchAllFeedAssignments", () => {
  it("merges every account into one set", async () => {
    // The caller upserts and dismisses over this set exactly once; returning
    // them separately is what would let one account delete another's tasks.
    const fetcher = vi.fn()
      .mockResolvedValueOnce([assignment("bs-1")])
      .mockResolvedValueOnce([assignment("bs-2")]);
    const out = await fetchAllFeedAssignments([primary, extra], fetcher);
    expect(out.assignments.map((a) => a.external_id)).toEqual(["bs-1", "bs-2@acc-uuid-1"]);
    expect(out.errors).toEqual([]);
    expect(out.anySucceeded).toBe(true);
  });

  it("keeps identical UIDs from two feeds apart", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce([assignment("bs-shared")])
      .mockResolvedValueOnce([assignment("bs-shared")]);
    const out = await fetchAllFeedAssignments([primary, extra], fetcher);
    expect(new Set(out.assignments.map((a) => a.external_id)).size).toBe(2);
  });

  it("isolates a failing account so healthy ones still sync", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce([assignment("bs-1")])
      .mockRejectedValueOnce(new Error("feed revoked"));
    const out = await fetchAllFeedAssignments([primary, extra], fetcher);
    expect(out.assignments.map((a) => a.external_id)).toEqual(["bs-1"]);
    expect(out.errors).toEqual(["Additional account: feed revoked"]);
    expect(out.anySucceeded).toBe(true);
  });

  it("labels a primary failure without the additional-account prefix", async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("403"));
    const out = await fetchAllFeedAssignments([primary], fetcher);
    expect(out.errors).toEqual(["403"]);
  });

  it("reports that nothing succeeded when every account fails", async () => {
    // The caller uses this to avoid dismissing tasks against an empty set.
    const fetcher = vi.fn().mockRejectedValue(new Error("down"));
    const out = await fetchAllFeedAssignments([primary, extra], fetcher);
    expect(out.anySucceeded).toBe(false);
    expect(out.errors).toHaveLength(2);
  });

  it("handles no accounts without calling the fetcher", async () => {
    const fetcher = vi.fn();
    const out = await fetchAllFeedAssignments([], fetcher);
    expect(fetcher).not.toHaveBeenCalled();
    expect(out).toEqual({ assignments: [], errors: [], anySucceeded: false });
  });

  it("stringifies a non-Error rejection instead of losing it", async () => {
    const fetcher = vi.fn().mockRejectedValue("plain string failure");
    const out = await fetchAllFeedAssignments([primary], fetcher);
    expect(out.errors).toEqual(["plain string failure"]);
  });
});
