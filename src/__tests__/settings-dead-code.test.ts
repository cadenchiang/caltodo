/**
 * Tests for the settings dead-code removal (audit 2.36).
 *
 * ClassesSection (605 lines), ClassChangeConfirmDialog,
 * SelectedClassesByPlatform, AccountSection, CanvasGenericCard,
 * CalendarFeedSettings and the IntegrationClasses export had no importers.
 * The five provider cards only ever render in the Available group, so their
 * connected and disconnect branches were unreachable and now share
 * AvailableIntegrationCard.
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const src = (rel: string) => path.resolve(__dirname, "..", rel);
const read = (rel: string) => readFileSync(src(rel), "utf8");

const DELETED = [
  "components/settings/ClassesSection.tsx",
  "components/settings/ClassChangeConfirmDialog.tsx",
  "components/settings/SelectedClassesByPlatform.tsx",
  "components/settings/sections/AccountSection.tsx",
  "components/settings/CanvasGenericCard.tsx",
  "components/settings/CalendarFeedSettings.tsx",
];

const PROVIDER_CARDS = [
  ["components/settings/CanvasSettings.tsx", "canvas"],
  ["components/settings/GradescopeSettings.tsx", "gradescope"],
  ["components/settings/PensieveSettings.tsx", "pensieve"],
  ["components/settings/BrightspaceSettings.tsx", "brightspace"],
  ["components/settings/BlackboardSettings.tsx", "blackboard"],
] as const;

describe("deleted files", () => {
  it.each(DELETED)("%s is gone", (rel) => {
    expect(existsSync(src(rel))).toBe(false);
  });

  it("IntegrationSettings no longer exports IntegrationClasses or preloads the retired bCourses logo", () => {
    const s = read("components/settings/IntegrationSettings.tsx");
    expect(s).not.toContain("IntegrationClasses");
    expect(s).not.toContain("ClassesSection");
    expect(s).not.toContain("bcourses-logo");
  });
});

describe("provider cards", () => {
  it.each(PROVIDER_CARDS)("%s renders only the available row", (rel, provider) => {
    const s = read(rel);
    expect(s).toContain(`<AvailableIntegrationCard provider="${provider}"`);
    expect(s).not.toContain("handleDisconnect");
    expect(s).not.toContain("createPortal");
    expect(s).not.toContain("bCourses disconnected");
    expect(s).not.toContain("group-hover:hidden");
    expect(s.split("\n").length).toBeLessThan(30);
  });

  it("AvailableIntegrationCard uses the provider metadata and a labelled Connect button", () => {
    const s = read("components/settings/AvailableIntegrationCard.tsx");
    expect(s).toContain("DISCLOSURE_META[provider]");
    expect(s).toContain("PROVIDER_META[provider]");
    expect(s).toContain("aria-label={`Connect ${label}`}");
    expect(s).toContain("${meta.logoTileClassName}");
    expect(s).not.toContain("#0e89d6");
  });

  it("IntegrationList passes nothing the cards no longer take", () => {
    const s = read("components/settings/IntegrationList.tsx");
    expect(s).not.toContain("syncedCount");
    expect(s).not.toContain("useTaskContext");
  });
});
