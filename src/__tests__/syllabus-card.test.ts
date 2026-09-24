/**
 * Tests for the Syllabus settings card (audit 2.10).
 *
 * A syllabus is an upload, not a connection, yet the card kept the
 * hover-flip Connected/Disconnect badge. It now offers an always-visible
 * "Remove tasks" destructive text button and confirms through ConfirmDialog.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { removalPhrase } from "@/components/settings/SyllabusSettings";

const src = readFileSync(
  path.resolve(__dirname, "..", "components/settings/SyllabusSettings.tsx"),
  "utf8"
);

describe("removalPhrase", () => {
  it("names the whole import or one course, with plural agreement", () => {
    expect(removalPhrase("all", 1)).toBe("all 1 imported task");
    expect(removalPhrase("all", 3)).toBe("all 3 imported tasks");
    expect(removalPhrase("CS 61A", 1)).toBe('1 task from "CS 61A"');
    expect(removalPhrase("CS 61A", 2)).toBe('2 tasks from "CS 61A"');
  });
});

describe("SyllabusSettings", () => {
  it("drops connection language and the hover flip", () => {
    expect(src).not.toContain("Connected");
    expect(src).not.toContain("Disconnect");
    expect(src).not.toContain("group-hover:hidden");
    expect(src).toContain("Remove tasks");
  });

  it("keeps the destructive control visible and confirms through ConfirmDialog", () => {
    expect(src).toContain('import ConfirmDialog from "@/components/ui/ConfirmDialog";');
    expect(src).toContain("open={confirmTarget !== null}");
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("opacity-0");
  });

  it("uses sentence case and the glossary label", () => {
    expect(src).not.toContain("Upload Another");
    expect(src).not.toContain("Remove All");
    expect(src).not.toContain("Untitled Syllabus");
    expect(src).toContain("PROVIDER_LABELS.syllabus");
  });

  it("passes the error variant on the failure toast", () => {
    expect(src).toContain('showToast(err instanceof Error ? err.message : "Failed to remove tasks", { variant: "error" })');
  });
});
