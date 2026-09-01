/**
 * Tests that class selection is per account, and that the Classes tab is gone.
 *
 * The point of moving classes under Integrations is attribution: a student
 * with two Canvas schools could previously see which classes were syncing but
 * not which school each came from. That only works if every layer is scoped by
 * account - the endpoint, the editor, and the write - so these check the chain
 * rather than any one link.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  COURSE_SELECTION,
  COURSE_SELECTION_PROVIDERS,
  hasCourseSelection,
} from "@/lib/course-selection";
import { SETTINGS_SECTIONS, DEFAULT_SECTION } from "@/lib/settingsConfig";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("which providers offer class selection", () => {
  it("covers exactly the providers with a course endpoint", () => {
    for (const provider of COURSE_SELECTION_PROVIDERS) {
      const endpoint = COURSE_SELECTION[provider].coursesEndpoint;
      expect(fs.existsSync(path.join(ROOT, "src/app", endpoint, "route.ts"))).toBe(true);
    }
  });

  it("excludes the feed providers, which have no course endpoint", () => {
    // Brightspace and Blackboard sync a whole calendar and have no column to
    // save a choice into, so offering a picker would save nothing.
    for (const provider of ["brightspace", "blackboard"]) {
      expect(hasCourseSelection(provider)).toBe(false);
      expect(fs.existsSync(path.join(ROOT, `src/app/api/${provider}/courses/route.ts`))).toBe(false);
    }
  });

  it("names a real credential column for each provider", () => {
    const types = read("src/lib/types.ts");
    for (const provider of COURSE_SELECTION_PROVIDERS) {
      expect(types).toContain(`${COURSE_SELECTION[provider].primaryColumn}:`);
    }
  });
});

describe("the editor asks for one account's courses", () => {
  const editor = read("src/components/settings/AccountClasses.tsx");

  it("scopes the fetch by account_id", () => {
    expect(editor).toContain("?account_id=${encodeURIComponent(accountId)}");
  });

  it("loads the course list once, when first opened", () => {
    // Opening the dropdown should not fetch every account's courses.
    expect(editor).toContain("if (available === null) load();");
  });

  it("expands in place rather than opening a modal", () => {
    expect(editor).not.toContain("createPortal");
    expect(editor).not.toContain("fixed inset-0");
  });

  it("does not derive its draft in an effect", () => {
    // The ticks are a function of props; an effect would paint one frame with
    // the previous account's selection.
    expect(editor).not.toContain("useEffect");
  });

  it("keeps the picker open when a save fails", () => {
    expect(editor).toMatch(/await onSave\([\s\S]{0,80}setEditing\(false\);/);
    expect(editor).toContain("catch (err)");
  });
});

describe("saving writes to the right place for the right account", () => {
  const assemble = read("src/components/settings/ConnectedIntegration.tsx");

  it("writes the primary account's choice to its credentials column", () => {
    expect(assemble).toContain('if (accountId === "primary")');
    expect(assemble).toContain("JSON.stringify({ [column]: courses })");
  });

  it("writes an extra Canvas school's choice onto that school only", () => {
    expect(assemble).toContain("a.id === accountId");
    expect(assemble).toContain("selected_courses: courses as Array<{ id: number; name: string }>");
  });

  it("writes an extra feed account's choice through the accounts API", () => {
    expect(assemble).toContain('method: "PATCH"');
    expect(assemble).toContain('"/api/integration-accounts"');
  });
});

describe("the accounts API accepts a class selection", () => {
  const route = read("src/app/api/integration-accounts/route.ts");

  it("has a PATCH handler", () => {
    expect(route).toContain("export async function PATCH(");
  });

  it("constrains the update to the requesting user", () => {
    const patch = route.slice(route.indexOf("export async function PATCH("));
    expect(patch).toContain('.eq("user_id", user.id)');
  });

  it("only lets the class selection be written", () => {
    // Allowing `connection` through would let a request repoint an account at
    // a different feed without going through the add flow.
    const patch = route.slice(route.indexOf("export async function PATCH("));
    expect(patch).toContain("update({ selected_courses: courses })");
    expect(patch).not.toContain("connection:");
  });

  it("rejects a body that is neither a course array nor null", () => {
    const patch = route.slice(route.indexOf("export async function PATCH("));
    expect(patch).toContain("selected_courses must be a course array or null");
    expect(patch).toContain("courses === null");
  });

  it("404s rather than 500s on an account that is not the user's", () => {
    const patch = route.slice(route.indexOf("export async function PATCH("));
    expect(patch).toMatch(/if \(!data\) \{[\s\S]{0,120}status: 404/);
  });
});

describe("the Classes settings tab is gone", () => {
  it("is no longer a settings section", () => {
    expect(SETTINGS_SECTIONS.map((s) => s.id)).not.toContain("classes");
  });

  it("leaves a default section that still exists", () => {
    expect(SETTINGS_SECTIONS.map((s) => s.id)).toContain(DEFAULT_SECTION);
  });

  it("removes its wrapper and its route case", () => {
    expect(fs.existsSync(path.join(ROOT, "src/components/settings/sections/ClassesSectionWrapper.tsx"))).toBe(false);
    expect(read("src/app/app/settings/SettingsContent.tsx")).not.toContain('case "classes"');
  });

  it("keeps the class list itself, which the calendar popover renders", () => {
    // Only the settings tab went; IntegrationClasses is still a real surface.
    expect(read("src/components/calendar/CalendarClassesButton.tsx")).toContain("<IntegrationClasses />");
    expect(read("src/components/settings/IntegrationSettings.tsx")).toContain("export function IntegrationClasses()");
  });
});
