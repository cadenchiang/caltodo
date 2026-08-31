/**
 * Tests that Blackboard is wired through every surface a user meets it on.
 *
 * A feed integration touches a dozen files, and a miss is silent: the
 * integration simply never appears, or connects and never syncs. These parse
 * the source for each attachment point, using Brightspace as the reference
 * since Blackboard was built to mirror it.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ONBOARDING_STEPS, ONBOARDING_PLATFORMS } from "@/lib/onboarding-progress";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("storage", () => {
  const migrations = fs.readdirSync(path.join(ROOT, "supabase/migrations"));

  it("ships a migration adding the feed URL and failure flag", () => {
    const file = migrations.find((m) => m.includes("blackboard"));
    expect(file).toBeTruthy();
    const sql = read(`supabase/migrations/${file}`);
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS blackboard_calendar_url/i);
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS blackboard_auth_failed/i);
  });

  it("adds columns rather than altering existing ones", () => {
    const file = migrations.find((m) => m.includes("blackboard"))!;
    const sql = read(`supabase/migrations/${file}`);
    expect(sql).not.toMatch(/DROP\s+(COLUMN|TABLE)/i);
    expect(sql).toMatch(/IF NOT EXISTS/i);
  });

  it("is declared on the credentials type", () => {
    const types = read("src/lib/types.ts");
    expect(types).toContain("blackboard_calendar_url");
    expect(types).toContain("blackboard_auth_failed");
    expect(types).toMatch(/blackboard: SyncSourceResult;/);
  });
});

describe("sync engine", () => {
  const engine = read("src/lib/sync-engine.ts");

  it("selects the feed URL from the credentials row", () => {
    expect(engine).toMatch(/blackboard_calendar_url,/);
  });

  it("is a sync platform", () => {
    expect(engine).toMatch(/export type SyncPlatform =[^;]*"blackboard"/);
  });

  it("runs alongside the other feeds", () => {
    expect(engine).toMatch(/platforms!\.includes\("blackboard"\)\s*\?\s*syncBlackboard/);
  });

  it("clears the failure flag on a recovered feed", () => {
    expect(engine).toMatch(/update\(\{ blackboard_auth_failed: false \}\)/);
  });

  it("persists the failure flag so a broken feed survives a reload", () => {
    expect(engine).toMatch(/update\(\{ blackboard_auth_failed: true \}\)/);
  });

  it("reports zero rather than throwing when not connected", () => {
    expect(engine).toMatch(
      /if \(!creds\.blackboard_calendar_url\) \{\s*return \{ synced: 0, errors: \[\] \};/
    );
  });
});

describe("credentials API", () => {
  const route = read("src/app/api/credentials/route.ts");

  it("reads and returns both columns", () => {
    expect(route).toContain("blackboard_calendar_url,");
    expect(route).toContain("blackboard_auth_failed,");
    expect(route).toMatch(/blackboard_calendar_url: data\?\.blackboard_calendar_url \?\? null/);
  });

  it("validates the URL against the SSRF allowlist on save", () => {
    expect(route).toMatch(
      /body\.blackboard_calendar_url && !isAllowedCanvasUrl\(body\.blackboard_calendar_url\)/
    );
  });

  it("treats it as a URL field", () => {
    expect(route).toMatch(/URL_FIELDS = \[[^\]]*"blackboard_calendar_url"/);
  });

  it("clears the failure flag when a new URL is saved", () => {
    expect(route).toMatch(/updateData\.blackboard_auth_failed = false;/);
  });
});

describe("onboarding", () => {
  const page = read("src/app/app/onboarding/page.tsx");

  it("is offered on the platform picker", () => {
    expect(page).toMatch(/\{ id: "blackboard", label: "Blackboard"/);
  });

  it("is a known step and a known platform", () => {
    expect(ONBOARDING_STEPS).toContain("blackboard");
    expect(ONBOARDING_PLATFORMS).toContain("blackboard");
  });

  it("is pushed onto the step list when selected", () => {
    expect(page).toMatch(/selectedPlatforms\.has\("blackboard"\)\) platformSteps\.push\("blackboard"\)/);
  });

  it("renders its step in the main flow", () => {
    expect(page).toMatch(/currentStep === "blackboard" &&[\s\S]{0,80}<BlackboardStep/);
  });

  it("saves through a handler that advances the flow", () => {
    expect(page).toMatch(/handleBlackboardNext[\s\S]{0,300}setCurrentStep\(nextStepAfter\("blackboard"\)\)/);
  });

  it("is reachable as a standalone setup flow from settings", () => {
    expect(page).toMatch(/VALID_SETUP_PLATFORMS = new Set<string>\(\[[^\]]*"blackboard"/);
    expect(page).toMatch(/setupParam === "blackboard" &&[\s\S]{0,80}<BlackboardStep/);
  });

  it("has a header label for the standalone flow", () => {
    expect(page).toMatch(/blackboard: "Blackboard",/);
  });

  it("counts its assignments on the done step", () => {
    expect(page).toMatch(/syncResult\?\.blackboard\?\.synced/);
  });
});

describe("settings", () => {
  it("renders a card where credentials are in scope", () => {
    const settings = read("src/components/settings/IntegrationSettings.tsx");
    expect(settings).toMatch(/<BlackboardSettings/);
    expect(settings).toMatch(/credentials=\{credentials\}/);
  });

  it("appears in the add-integration menu", () => {
    const section = read("src/components/settings/sections/IntegrationsSection.tsx");
    expect(section).toMatch(/id: "blackboard"[\s\S]{0,400}setup=blackboard/);
  });

  it("disconnecting clears the URL and removes its tasks", () => {
    const card = read("src/components/settings/BlackboardSettings.tsx");
    expect(card).toMatch(/blackboard_calendar_url: null/);
    expect(card).toMatch(/deleteTasksBySource\("blackboard"\)/);
  });

  it("shows as a connected platform on the calendar", () => {
    const chips = read("src/components/calendar/CalendarClassesButton.tsx");
    expect(chips).toMatch(/key: "blackboard"[\s\S]{0,200}credentials\.blackboard_calendar_url/);
  });

  it("reports sync failures through the alerts pipeline", () => {
    const alerts = read("src/lib/integration-alerts.ts");
    expect(alerts).toMatch(/\["blackboard", result\.blackboard\?\.errors \?\? \[\]\]/);
  });

  it("has a logo asset", () => {
    expect(fs.existsSync(path.join(ROOT, "public/blackboard-logo.svg"))).toBe(true);
  });
});

describe("generalized add-another control", () => {
  const settings = read("src/components/settings/IntegrationSettings.tsx");

  it("is no longer Canvas-specific", () => {
    expect(settings).not.toContain("function AddAnotherCanvas");
    expect(settings).not.toContain("Add another Canvas school\n");
  });

  it("takes the destination and the wording from its caller", () => {
    expect(settings).toMatch(/function AddAnotherAccount\(\{ setupRoute, noun \}/);
    expect(settings).toMatch(/Add another \{noun\}/);
    expect(settings).toMatch(/setup=\$\{setupRoute\}/);
  });

  it("still drives the Canvas flow it replaced", () => {
    expect(settings).toMatch(
      /<AddAnotherAccount setupRoute="canvas-add" noun="Canvas school" \/>/
    );
  });

  it("labels itself for screen readers", () => {
    expect(settings).toMatch(/aria-label=\{`Add another \$\{noun\}`\}/);
  });
});
