/**
 * Tests for the layout-change persistence gate.
 *
 * Guards the fix that stops the board from auto-saving a frozen copy of the
 * template-fallback layout on mount (which would detach users from future
 * template updates). A layout change persists only when hydration is done
 * AND the user has genuinely interacted.
 */

import { describe, it, expect } from "vitest";
import { shouldPersistLayoutChange } from "@/lib/board-layout-sync";

describe("shouldPersistLayoutChange", () => {
  it("does NOT persist the automatic mount onLayoutChange (hydrated, no interaction)", () => {
    // This is the exact case the fix targets: react-grid-layout fires
    // onLayoutChange after hydration but before any user action.
    expect(shouldPersistLayoutChange(true, false)).toBe(false);
  });

  it("does NOT persist before hydration completes", () => {
    expect(shouldPersistLayoutChange(false, false)).toBe(false);
    expect(shouldPersistLayoutChange(false, true)).toBe(false);
  });

  it("persists a genuine edit once hydrated and interacted", () => {
    expect(shouldPersistLayoutChange(true, true)).toBe(true);
  });
});
