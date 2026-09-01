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
import { INTEGRATION_CATALOG, addRouteForCatalogId } from "@/lib/integration-catalog";
import { PROVIDER_META } from "@/lib/integration-providers";

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
    // Lives in the optional tier so a deploy that precedes the migration
    // falls back instead of failing every user's sync; see
    // missing-column.test.ts for that guarantee.
    expect(engine).toMatch(/OPTIONAL_COLUMNS = "[^"]*blackboard_calendar_url/);
  });

  it("is a sync platform", () => {
    expect(engine).toMatch(/export type SyncPlatform =[^;]*"blackboard"/);
  });

  it("runs alongside the other feeds", () => {
    expect(engine).toMatch(/platforms!\.includes\("blackboard"\)\s*\?\s*syncBlackboard/);
  });

  it("routes through the shared multi-account feed path", () => {
    // The per-provider bodies collapsed into syncFeedProvider so that all
    // three feed integrations get multi-account handling from one place.
    expect(engine).toMatch(
      /async function syncBlackboard\([\s\S]{0,400}return syncFeedProvider\(\{/
    );
  });

  it("hands that path its failure-flag column and feed client", () => {
    const call = engine.slice(
      engine.indexOf("async function syncBlackboard("),
      engine.indexOf("}", engine.indexOf("failureColumn: \"blackboard_auth_failed\""))
    );
    expect(call).toContain('provider: "blackboard"');
    expect(call).toContain("primaryUrl: creds.blackboard_calendar_url");
    expect(call).toContain("fetcher: fetchBlackboardAssignments");
    expect(call).toContain('failureColumn: "blackboard_auth_failed"');
  });

  it("sets and clears whatever failure column it is given", () => {
    // Generic now, so this is asserted once for all three feed providers.
    expect(engine).toMatch(/update\(\{ \[failureColumn\]: true \}\)/);
    expect(engine).toMatch(/update\(\{ \[failureColumn\]: false \}\)/);
  });

  it("reports zero rather than throwing when nothing is connected", () => {
    expect(engine).toMatch(
      /if \(accounts\.length === 0\) \{[\s\S]{0,160}return \{ synced: 0, errors: \[\] \};/
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
    const list = read("src/components/settings/IntegrationList.tsx");
    expect(list).toMatch(/<BlackboardSettings/);
    expect(list).toMatch(/credentials,$/m);
  });

  it("is listed as an integration the user can connect", () => {
    // The header's add-integration dropdown was removed: it listed the same
    // platforms the page already renders as rows. The catalog is now the one
    // record of what the list offers, so that is what has to carry it.
    expect(INTEGRATION_CATALOG.map((e) => e.id)).toContain("blackboard");
    expect(PROVIDER_META.blackboard.setupRoute).toBe("blackboard");
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
  const card = read("src/components/settings/ConnectedIntegrationCard.tsx");

  it("is no longer Canvas-specific", () => {
    expect(card).not.toContain("function AddAnotherCanvas");
    expect(card).not.toContain("Add another Canvas school");
  });

  it("takes the destination and the wording from the catalog", () => {
    expect(card).toContain("addRouteForCatalogId(provider)");
    expect(card).toContain("accountNounForCatalogId(provider)");
    expect(card).toContain("Add another {noun}");
    expect(card).toContain("setup=${addRoute}");
  });

  it("lives inside the accounts dropdown, not on the front of the card", () => {
    // Everything that changes an integration is behind the disclosure now.
    const panel = card.slice(card.indexOf("aria-hidden={!open}"));
    expect(panel).toContain("Add another {noun}");
  });

  it("renders nothing when the provider cannot hold a second account", () => {
    expect(card).toContain("{addRoute && noun && (");
  });
});
