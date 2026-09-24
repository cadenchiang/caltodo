/**
 * Tests for the settings shell navigation (audit 2.12, 2.36 group labels and
 * links).
 *
 * Mobile showed two identical "Settings" back buttons that went to different
 * places; section nav items were buttons with no aria-current; and the two
 * group-label recipes disagreed (one gray tracking-wider).
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getSettingsReturnLabel } from "@/lib/settings-return";
import { SETTINGS_GROUP_LABEL } from "@/lib/settingsConfig";
import { NAV_ITEMS } from "@/lib/constants";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("getSettingsReturnLabel", () => {
  it("names the nav item the return path belongs to, lowercase", () => {
    expect(getSettingsReturnLabel("/app/inbox", NAV_ITEMS)).toBe("Back to inbox");
    expect(getSettingsReturnLabel("/app/calendar?view=week", NAV_ITEMS)).toBe("Back to calendar");
    expect(getSettingsReturnLabel("/app/calendar/day", NAV_ITEMS)).toBe("Back to calendar");
  });

  it("falls back to the inbox for unknown paths", () => {
    expect(getSettingsReturnLabel("/app/profile", NAV_ITEMS)).toBe("Back to inbox");
    expect(getSettingsReturnLabel("/app/calendarish", NAV_ITEMS)).toBe("Back to inbox");
  });
});

describe("SettingsContent (mobile)", () => {
  const src = read("app/app/settings/SettingsContent.tsx");

  it("labels the list-level back button with its destination and the detail-level one Settings", () => {
    expect(src).toContain("<span>{returnLabel}</span>");
    expect(src).toContain('<Link href="/app/settings" className={BACK_BUTTON}>');
    expect(src).toMatch(/<Link href="\/app\/settings" className=\{BACK_BUTTON\}>\s*<ChevronLeft[^>]*\/>\s*<span>Settings<\/span>/);
    expect(src).not.toContain("goBackToList");
  });

  it("renders section items as links inside a labelled nav", () => {
    expect(src).toContain("href={`/app/settings?section=${section.id}`}");
    expect(src).toContain("<nav key={group} aria-label={group}");
    expect(src).not.toContain("goToSection");
  });

  it("uses the shared group-label recipe", () => {
    expect(src).toContain("SETTINGS_GROUP_LABEL");
    expect(src).not.toContain("tracking-wider");
  });
});

describe("Sidebar settings nav", () => {
  const src = read("components/layout/Sidebar.tsx");

  it("renders sections as links with aria-current on the active one", () => {
    expect(src).toContain('aria-current={isActive ? "page" : undefined}');
    expect(src).toContain("href={`/app/settings?section=${section.id}`}");
  });

  it("uses the shared group-label recipe, not gray tracking-wider text", () => {
    expect(src).toContain("SETTINGS_GROUP_LABEL");
    expect(src).not.toContain("tracking-wider text-foreground/60");
    expect(SETTINGS_GROUP_LABEL).toBe("text-xs font-medium text-foreground");
    expect(SETTINGS_GROUP_LABEL).not.toContain("uppercase");
  });
});
