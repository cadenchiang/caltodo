/**
 * Tests for applying a saved class selection to the tasks it governs.
 *
 * The reported bug: removing a class in settings left every assignment it had
 * synced in the inbox, so editing classes only ever appeared to add. These
 * pin that a removal hides tasks, a re-add restores them, and neither happens
 * when nothing changed.
 */

import { describe, it, expect, vi } from "vitest";
import { applyCourseSelectionChange } from "@/lib/course-selection-effects";

/**
 * Builds the effect set with counting stubs.
 *
 * @param hidden - Tasks the dismissal reports hiding.
 * @param restored - Tasks the un-dismissal reports restoring.
 * @returns The effects plus their mocks.
 */
function makeEffects(hidden = 0, restored = 0) {
  const dismissTasksByCourseNames = vi.fn().mockResolvedValue(hidden);
  const undismissTasksByCourseNames = vi.fn().mockResolvedValue(restored);
  const syncAddedClasses = vi.fn().mockResolvedValue(undefined);
  return {
    effects: { dismissTasksByCourseNames, undismissTasksByCourseNames, syncAddedClasses },
    dismissTasksByCourseNames,
    undismissTasksByCourseNames,
    syncAddedClasses,
  };
}

describe("applyCourseSelectionChange", () => {
  it("hides the tasks of a removed class", async () => {
    const { effects, dismissTasksByCourseNames } = makeEffects(6);

    const summary = await applyCourseSelectionChange(
      { addedNames: [], removedNames: ["UGBA 100-LEC-003"] },
      effects
    );

    expect(dismissTasksByCourseNames).toHaveBeenCalledWith(["UGBA 100-LEC-003"]);
    expect(summary).toBe("Hid 6 tasks from UGBA 100.");
  });

  it("does not sync when only classes were removed", async () => {
    const { effects, syncAddedClasses, undismissTasksByCourseNames } = makeEffects(2);

    await applyCourseSelectionChange({ addedNames: [], removedNames: ["UGBA 100"] }, effects);

    expect(syncAddedClasses).not.toHaveBeenCalled();
    expect(undismissTasksByCourseNames).not.toHaveBeenCalled();
  });

  it("restores tasks hidden by an earlier removal when a class comes back", async () => {
    const { effects, undismissTasksByCourseNames, syncAddedClasses } = makeEffects(0, 4);

    const summary = await applyCourseSelectionChange(
      { addedNames: ["UGBA 107-LEC-001 FA26"], removedNames: [] },
      effects
    );

    expect(undismissTasksByCourseNames).toHaveBeenCalledWith(["UGBA 107-LEC-001 FA26"]);
    expect(syncAddedClasses).toHaveBeenCalledOnce();
    expect(summary).toBe("Restored 4 tasks from UGBA 107.");
  });

  it("syncs a genuinely new class instead of claiming a task count", async () => {
    const { effects, syncAddedClasses } = makeEffects(0, 0);

    const summary = await applyCourseSelectionChange(
      { addedNames: ["UGBA 107-LEC-001 FA26"], removedNames: [] },
      effects
    );

    expect(syncAddedClasses).toHaveBeenCalledOnce();
    expect(summary).toBe("Syncing UGBA 107.");
  });

  it("reports both halves of an edit that swaps a class", async () => {
    const { effects } = makeEffects(3, 0);

    const summary = await applyCourseSelectionChange(
      { addedNames: ["UGBA 107-LEC-001 FA26"], removedNames: ["UGBA 100-LEC-003"] },
      effects
    );

    expect(summary).toBe("Hid 3 tasks from UGBA 100. Syncing UGBA 107.");
  });

  it("still reports the removal when it matched no tasks", async () => {
    const { effects } = makeEffects(0);

    const summary = await applyCourseSelectionChange(
      { addedNames: [], removedNames: ["UGBA 100-LEC-003"] },
      effects
    );

    expect(summary).toBe("Removed UGBA 100.");
  });

  it("does nothing at all when the selection did not change", async () => {
    const { effects, dismissTasksByCourseNames, undismissTasksByCourseNames, syncAddedClasses } =
      makeEffects();

    const summary = await applyCourseSelectionChange({ addedNames: [], removedNames: [] }, effects);

    expect(summary).toBe("");
    expect(dismissTasksByCourseNames).not.toHaveBeenCalled();
    expect(undismissTasksByCourseNames).not.toHaveBeenCalled();
    expect(syncAddedClasses).not.toHaveBeenCalled();
  });

  it("hides before it restores, so a class in both halves ends up visible", async () => {
    const order: string[] = [];
    const effects = {
      dismissTasksByCourseNames: vi.fn(async () => {
        order.push("dismiss");
        return 1;
      }),
      undismissTasksByCourseNames: vi.fn(async () => {
        order.push("undismiss");
        return 1;
      }),
      syncAddedClasses: vi.fn(async () => {
        order.push("sync");
      }),
    };

    await applyCourseSelectionChange(
      { addedNames: ["UGBA 107"], removedNames: ["UGBA 100"] },
      effects
    );

    expect(order).toEqual(["dismiss", "undismiss", "sync"]);
  });

  it("propagates an effect failure so the caller can report it", async () => {
    const { effects } = makeEffects();
    effects.dismissTasksByCourseNames.mockRejectedValue(new Error("network down"));

    await expect(
      applyCourseSelectionChange({ addedNames: [], removedNames: ["UGBA 100"] }, effects)
    ).rejects.toThrow("network down");
  });
});
