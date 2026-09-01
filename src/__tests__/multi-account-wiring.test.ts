/**
 * Tests that "add another" is wired end to end for every provider that
 * supports it, and offered for none that does not.
 *
 * The user-visible promise is that any integration can hold more than one
 * account. The failure this guards against is a half-wired provider: a row
 * that opens a flow that saves nothing, or an account that saves but never
 * syncs.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { FEED_PROVIDERS, PROVIDER_META, isFeedProvider } from "@/lib/integration-providers";
import {
  INTEGRATION_CATALOG,
  addRouteForCatalogId,
  accountNounForCatalogId,
} from "@/lib/integration-catalog";
import type { IntegrationCredentials } from "@/lib/types";

/**
 * Credentials with nothing connected.
 *
 * Only the feed URLs matter to these assertions; the rest is filled in so the
 * object satisfies the type the catalog predicates are written against.
 */
function emptyCredentials(): IntegrationCredentials {
  return {
    canvas_token: null,
    canvas_base_url: "",
    canvas_ical_url: null,
    canvas_token_expired: false,
    canvas_ical_failed: false,
    gradescope_email: null,
    has_gradescope_password: false,
    gradescope_auth_failed: false,
    last_synced_at: null,
    selected_canvas_courses: null,
    selected_gradescope_courses: null,
    selected_pensieve_courses: null,
    dismissed_canvas_course_ids: [],
    has_google_calendar: false,
    google_auth_failed: false,
    google_calendar_id: null,
    google_email: null,
    google_photo_url: null,
    canvas_token_created_at: null,
    is_founding_member: false,
    pensieve_calendar_url: null,
    pensieve_auth_failed: false,
    brightspace_calendar_url: null,
    brightspace_auth_failed: false,
    blackboard_calendar_url: null,
    blackboard_auth_failed: false,
    additional_canvas_accounts: [],
    has_completed_onboarding: false,
    email_digest_enabled: true,
    email_digest_hour: 15,
    email_digest_address: null,
    dismissed_modals: {},
  } as IntegrationCredentials;
}

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const onboarding = read("src/app/app/onboarding/page.tsx");
const card = read("src/components/settings/ConnectedIntegrationCard.tsx");
const group = read("src/components/settings/ConnectedIntegration.tsx");
const engine = read("src/lib/sync-engine.ts");

describe("every feed provider is wired end to end", () => {
  for (const provider of FEED_PROVIDERS) {
    const addRoute = PROVIDER_META[provider].addRoute!;

    it(`${provider}: settings renders its accounts group`, () => {
      // One render site now covers all three, keyed off the catalog entry,
      // instead of three hand-written copies.
      expect(group).toContain("isFeedProvider(provider)");
      expect(group).toContain('fetch("/api/integration-accounts")');
      expect(isFeedProvider(provider)).toBe(true);
    });

    it(`${provider}: the group is gated on the primary being connected`, () => {
      // "Add another" before there is a first one reads as nonsense. The gate
      // is now the connected/available split: the group is only rendered for
      // entries that landed in the connected half.
      const entry = INTEGRATION_CATALOG.find((e) => e.id === provider)!;
      expect(entry.isConnected(emptyCredentials())).toBe(false);
      expect(
        entry.isConnected({
          ...emptyCredentials(),
          [`${provider}_calendar_url`]: "https://x/feed.ics",
        } as IntegrationCredentials)
      ).toBe(true);
      expect(read("src/components/settings/IntegrationList.tsx")).toContain("splitByConnection");
    });

    it(`${provider}: onboarding accepts its add route`, () => {
      expect(onboarding).toMatch(
        new RegExp(`VALID_SETUP_PLATFORMS[\\s\\S]{0,320}"${addRoute}"`)
      );
    });

    it(`${provider}: the add route renders a step that saves an account`, () => {
      expect(onboarding).toMatch(
        new RegExp(`setupParam === "${addRoute}"[\\s\\S]{0,300}handleAddFeedAccount\\("${provider}"`)
      );
    });

    it(`${provider}: has a header label for the add flow`, () => {
      expect(onboarding).toMatch(new RegExp(`"${addRoute}": "another`));
    });

    it(`${provider}: sync reads all of its accounts, not just the primary`, () => {
      expect(engine).toMatch(
        new RegExp(`provider: "${provider}"[\\s\\S]{0,200}primaryUrl: creds\\.${provider}_calendar_url`)
      );
    });
  }
});

describe("providers that cannot hold a second account are not offered one", () => {
  // The list asks the catalog for an add route and renders nothing when it
  // gets null, so a null route is what actually withholds the row.
  for (const provider of ["gradescope", "classroom"] as const) {
    it(`${provider} has no accounts group and no add route`, () => {
      expect(isFeedProvider(provider)).toBe(false);
      expect(addRouteForCatalogId(provider)).toBeNull();
      expect(accountNounForCatalogId(provider)).toBeTruthy();
      expect(onboarding).not.toContain(`${provider}-add`);
    });
  }

  it("renders the add control only when the catalog supplies a route", () => {
    expect(card).toContain("{addRoute && noun && (");
  });
});

describe("the add flow saves through the accounts API", () => {
  it("posts to the endpoint rather than writing flat columns", () => {
    // Writing the flat column would overwrite the primary account instead of
    // adding beside it.
    expect(onboarding).toMatch(
      /handleAddFeedAccount[\s\S]{0,600}fetch\("\/api\/integration-accounts", \{[\s\S]{0,80}method: "POST"/
    );
  });

  it("surfaces the API's error rather than a generic one", () => {
    expect(onboarding).toMatch(/data\.error \|\| "Failed to add account"/);
  });

  it("syncs the provider immediately so the new feed appears", () => {
    expect(onboarding).toMatch(/triggerSync\(undefined, \[provider\]\)/);
  });
});

describe("the accounts group", () => {
  it("lists only the provider it was given", () => {
    expect(group).toMatch(/filter\(\(a\) => a\.provider === provider\)/);
  });

  it("leaves adding an account to the card's dropdown", () => {
    // Assembling accounts and offering to add one are separate jobs; a second
    // "Add another" here would be two controls for one action.
    expect(group).not.toContain("Add another");
    expect(group).not.toContain("addRoute");
  });

  it("can remove an account", () => {
    expect(group).toMatch(/method: "DELETE"/);
    expect(group).toMatch(/encodeURIComponent\(id\)/);
  });

  it("flags an account whose feed has broken", () => {
    // The flag is assembled here and rendered by the card.
    expect(group).toContain("authFailed: a.auth_failed");
    expect(card).toMatch(/account\.authFailed &&[\s\S]{0,200}Needs reconnecting/);
  });

  it("degrades to rendering nothing if the list cannot be loaded", () => {
    // The primary card must still render on its own.
    expect(group).toMatch(/if \(!res\.ok[^)]*\) return;/);
    expect(group).toMatch(/catch \{[\s\S]{0,120}Non-critical/);
  });

  it("does not commit a response after the provider has changed", () => {
    // Without this a slow fetch can render one provider's accounts under
    // another as the settings list re-renders.
    expect(group).toMatch(/let cancelled = false;/);
    expect(group).toMatch(/return \(\) => \{\s*cancelled = true;\s*\};/);
  });

  it("is only rendered for an integration that is connected", () => {
    // The connected/available split is the gate now: an unconnected provider
    // never reaches this component at all.
    const list = read("src/components/settings/IntegrationList.tsx");
    expect(list).toContain("splitByConnection");
    expect(list).toContain("<ConnectedEntry key={entry.id}");
  });

  it("always lists the primary account alongside any extras", () => {
    expect(group).toContain('id: "primary"');
    expect(group).toContain("isPrimary: true");
  });
});

describe("removing an extra account cleans up after itself", () => {
  const assemble = read("src/components/settings/ConnectedIntegration.tsx");

  it("deletes the tasks an extra Canvas school synced", () => {
    // Those tasks carry the account id as an external_id prefix. Without this
    // they outlive the account and nothing in settings can clear them.
    expect(assemble).toContain("deleteTasksByExternalIdPrefix(`${id}:`)");
  });

  it("writes the remaining accounts rather than the removed one", () => {
    expect(assemble).toContain("filter((a) => a.id !== id)");
    expect(assemble).toContain("additional_canvas_accounts: remaining");
  });

  it("removes a feed account through the accounts API", () => {
    expect(assemble).toMatch(/method: "DELETE"/);
    expect(assemble).toContain("encodeURIComponent(id)");
  });
});
