import { describe, it, expect } from "vitest";

/**
 * The completion invariant enforced by PATCH /api/mobile/tasks/:taskId.
 *
 * Extracted as a pure function mirroring the route's logic so it can be
 * exercised without standing up the whole Next request pipeline. The rule:
 * is_completed and completed_at must never disagree, because the nightly
 * archive purge deletes on `completed_at < cutoff` and a completed task with
 * a null timestamp is invisible to it forever. Prod accumulated 44 such rows.
 */
function applyCompletionInvariant(update: Record<string, unknown>): Record<string, unknown> {
  const next = { ...update };
  if ("is_completed" in next) {
    if (next.is_completed === true) {
      if (next.completed_at == null) next.completed_at = "2026-07-28T00:00:00.000Z";
    } else if (next.is_completed === false) {
      next.completed_at = null;
    }
  }
  return next;
}

describe("mobile task completion invariant", () => {
  it("stamps completed_at when a client completes a task without one", () => {
    const result = applyCompletionInvariant({ is_completed: true });
    expect(result.completed_at).toBe("2026-07-28T00:00:00.000Z");
  });

  it("stamps it when the client explicitly sends null", () => {
    const result = applyCompletionInvariant({ is_completed: true, completed_at: null });
    expect(result.completed_at).toBe("2026-07-28T00:00:00.000Z");
  });

  it("respects a timestamp the client did supply", () => {
    const supplied = "2026-01-01T12:00:00.000Z";
    const result = applyCompletionInvariant({ is_completed: true, completed_at: supplied });
    expect(result.completed_at).toBe(supplied);
  });

  it("clears completed_at when a task is un-completed", () => {
    const result = applyCompletionInvariant({
      is_completed: false,
      completed_at: "2026-01-01T12:00:00.000Z",
    });
    expect(result.completed_at).toBeNull();
  });

  it("clears it even when the client omits it", () => {
    const result = applyCompletionInvariant({ is_completed: false });
    expect(result.completed_at).toBeNull();
  });

  it("leaves completed_at alone on edits that don't touch completion", () => {
    const result = applyCompletionInvariant({ title: "renamed" });
    expect("completed_at" in result).toBe(false);
  });

  it("does not invent a completion state from a bare completed_at edit", () => {
    const result = applyCompletionInvariant({ completed_at: "2026-01-01T12:00:00.000Z" });
    expect(result.is_completed).toBeUndefined();
    expect(result.completed_at).toBe("2026-01-01T12:00:00.000Z");
  });
});
