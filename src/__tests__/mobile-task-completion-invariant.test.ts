import { describe, it, expect } from "vitest";
import {
  applyCompletionInvariant,
  applyDismissalInvariant,
} from "@/lib/mobile-task-helpers";

/**
 * The row invariants enforced by the /api/mobile/tasks routes.
 *
 * Completion: is_completed and completed_at must never disagree, because the
 * nightly archive purge deletes on `completed_at < cutoff` and a completed
 * task with a null timestamp is invisible to it forever. Prod accumulated 44
 * such rows.
 *
 * Dismissal: dismissed_at without dismissed_by_user is resurrected by the
 * next sync, which only honours dismissals it can see were the user's (M9).
 */

const NOW = "2026-07-28T00:00:00.000Z";

describe("mobile task completion invariant", () => {
  it("stamps completed_at when a client completes a task without one", () => {
    const result = applyCompletionInvariant({ is_completed: true }, NOW);
    expect(result.completed_at).toBe(NOW);
  });

  it("stamps it when the client explicitly sends null", () => {
    const result = applyCompletionInvariant({ is_completed: true, completed_at: null }, NOW);
    expect(result.completed_at).toBe(NOW);
  });

  it("respects a timestamp the client did supply", () => {
    const supplied = "2026-01-01T12:00:00.000Z";
    const result = applyCompletionInvariant({ is_completed: true, completed_at: supplied }, NOW);
    expect(result.completed_at).toBe(supplied);
  });

  it("clears completed_at when a task is un-completed", () => {
    const result = applyCompletionInvariant({
      is_completed: false,
      completed_at: "2026-01-01T12:00:00.000Z",
    }, NOW);
    expect(result.completed_at).toBeNull();
  });

  it("clears it even when the client omits it", () => {
    const result = applyCompletionInvariant({ is_completed: false }, NOW);
    expect(result.completed_at).toBeNull();
  });

  it("leaves completed_at alone on edits that don't touch completion", () => {
    const result = applyCompletionInvariant({ title: "renamed" }, NOW);
    expect("completed_at" in result).toBe(false);
  });

  it("does not invent a completion state from a bare completed_at edit", () => {
    const result = applyCompletionInvariant({ completed_at: "2026-01-01T12:00:00.000Z" }, NOW);
    expect(result.is_completed).toBeUndefined();
    expect(result.completed_at).toBe("2026-01-01T12:00:00.000Z");
  });

  it("stamps a real timestamp when none is given", () => {
    const result = applyCompletionInvariant({ is_completed: true });
    expect(Number.isNaN(new Date(result.completed_at as string).getTime())).toBe(false);
  });

  it("does not mutate its input", () => {
    const input = { is_completed: true };
    applyCompletionInvariant(input, NOW);
    expect(input).toEqual({ is_completed: true });
  });
});

describe("mobile task dismissal invariant", () => {
  it("marks a dismissal as the user's", () => {
    const result = applyDismissalInvariant({ dismissed_at: NOW });
    expect(result.dismissed_by_user).toBe(true);
  });

  it("clears the flag when the dismissal is undone", () => {
    const result = applyDismissalInvariant({ dismissed_at: null });
    expect(result.dismissed_by_user).toBe(false);
  });

  it("overrides a flag the client sent that disagrees with dismissed_at", () => {
    const result = applyDismissalInvariant({ dismissed_at: NOW, dismissed_by_user: false });
    expect(result.dismissed_by_user).toBe(true);
  });

  it("leaves the flag alone on edits that don't touch dismissal", () => {
    const result = applyDismissalInvariant({ title: "renamed" });
    expect("dismissed_by_user" in result).toBe(false);
  });
});
