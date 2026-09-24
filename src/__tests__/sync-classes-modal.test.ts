/**
 * Tests for SyncClassesModal (audit 2.27 nested Escape, full section).
 *
 * The calendar's classes modal rendered the entire IntegrationsSection
 * (health banner, MCP card, request form) and its window-level Escape closed
 * both it and a nested CourseSelectModal.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const src = readFileSync(path.resolve(__dirname, "..", "components/calendar/SyncClassesModal.tsx"), "utf8");

describe("SyncClassesModal", () => {
  it("renders only the connected integrations", () => {
    expect(src).toContain("<IntegrationSettings connectedOnly />");
    expect(src).not.toContain("IntegrationsSection");
  });

  it("is built on Modal so Escape is scoped to the topmost dialog", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).not.toContain("addEventListener");
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("z-[9999]");
  });
});
