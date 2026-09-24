/**
 * Tests for the Advanced settings actions.
 *
 * Audit M24: Reset Onboarding ignored res.ok, cleared one of five
 * localStorage keys in useDismissedModals.KEY_MAP, never dispatched
 * caltodo-reset-modals, and never cleared the saved flow progress or the
 * credentials cache.
 * Audit L16: Delete All Tasks always toasted success, even when the
 * context had restored the list after a failed delete.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { KEY_MAP } from "@/hooks/useDismissedModals";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const section = read("src/components/settings/sections/AdvancedSection.tsx");

describe("useDismissedModals.KEY_MAP", () => {
  it("is exported with every modal's localStorage key", () => {
    expect(Object.keys(KEY_MAP).sort()).toEqual(
      ["calchat_announcement", "calchat_welcome", "gcal_announce", "pensieve_announced", "sync_welcome"],
    );
    expect(Object.values(KEY_MAP)).toContain("calchat_welcome_accepted");
  });
});

describe("Reset Onboarding", () => {
  const handler = section.slice(
    section.indexOf("async function handleResetOnboarding()"),
    section.indexOf("async function handleDeleteAccount()"),
  );

  it("checks the response before treating the reset as done", () => {
    expect(handler).toContain("if (!res.ok) {");
    expect(handler).toMatch(/throw new Error\(data\.error \|\| `Reset failed: \$\{res\.status\}`\)/);
  });

  it("clears every dismissed-modal key rather than one hardcoded key", () => {
    expect(handler).toContain("for (const lsKey of Object.values(DISMISSED_MODAL_KEYS))");
    expect(handler).toContain("localStorage.removeItem(lsKey)");
    expect(handler).not.toContain('localStorage.removeItem("calchat_welcome_accepted")');
  });

  it("dispatches the reset event, invalidates credentials, and clears progress", () => {
    expect(handler).toContain('window.dispatchEvent(new CustomEvent("caltodo-reset-modals"))');
    expect(handler).toContain("invalidateCredentials();");
    expect(handler).toContain("clearProgress();");
    expect(section).toContain('import { KEY_MAP as DISMISSED_MODAL_KEYS } from "@/hooks/useDismissedModals";');
  });

  it("does all of that only after the server accepted the reset", () => {
    expect(handler.indexOf("if (!res.ok)")).toBeLessThan(handler.indexOf("DISMISSED_MODAL_KEYS"));
    expect(handler.indexOf("clearProgress();")).toBeLessThan(handler.indexOf('router.push("/app/onboarding")'));
  });

  it("reports failure through a toast with the cause", () => {
    expect(handler).toContain('showToast(`Failed to reset onboarding: ${message}`, { variant: "error" })');
    expect(handler).toContain('console.error("AdvancedSection: reset onboarding failed"');
  });
});

describe("Delete All Tasks", () => {
  it("no longer toasts success unconditionally", () => {
    const handler = section.slice(
      section.indexOf("async function handleDeleteAll()"),
      section.indexOf("// deleteAllTasks reports failure through the context"),
    );
    expect(handler).not.toMatch(/await deleteAllTasks\(\);\s*showToast\("All tasks deleted\."\)/);
    expect(handler).toContain("errorBeforeDeleteRef.current = taskError;");
    expect(handler).toContain("setDeleteRun((n) => n + 1);");
  });

  it("reads the outcome from the context after the delete settles", () => {
    expect(section).toContain("const { tasks, deleteAllTasks, error: taskError } = useTaskContext();");
    expect(section).toContain("const failed = tasks.length > 0 || (taskError !== null && taskError !== errorBeforeDeleteRef.current);");
    expect(section).toContain('showToast(taskError ? `Failed to delete tasks: ${taskError}` : "Failed to delete tasks.", {');
    expect(section).toContain('showToast("All tasks deleted.")');
  });
});
