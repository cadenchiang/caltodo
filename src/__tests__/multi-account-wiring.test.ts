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
import { FEED_PROVIDERS, PROVIDER_META } from "@/lib/integration-providers";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const onboarding = read("src/app/app/onboarding/page.tsx");
const settings = read("src/components/settings/IntegrationSettings.tsx");
const group = read("src/components/settings/FeedAccountsGroup.tsx");
const engine = read("src/lib/sync-engine.ts");

describe("every feed provider is wired end to end", () => {
  for (const provider of FEED_PROVIDERS) {
    const addRoute = PROVIDER_META[provider].addRoute!;

    it(`${provider}: settings renders its accounts group`, () => {
      expect(settings).toContain(`<FeedAccountsGroup provider="${provider}"`);
    });

    it(`${provider}: the group is gated on the primary being connected`, () => {
      // "Add another" before there is a first one reads as nonsense.
      expect(settings).toMatch(
        new RegExp(`provider="${provider}" primaryConnected=\\{!!credentials\\.${provider}_calendar_url\\}`)
      );
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
  it("gradescope has no accounts group and no add route", () => {
    expect(settings).not.toContain('provider="gradescope"');
    expect(onboarding).not.toContain("gradescope-add");
  });

  it("classroom has no accounts group and no add route", () => {
    expect(settings).not.toContain('provider="classroom"');
    expect(onboarding).not.toContain("classroom-add");
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

  it("routes the add button through the provider's own add route", () => {
    expect(group).toMatch(/setup=\$\{meta\.addRoute\}/);
  });

  it("names what is being added, per provider", () => {
    expect(group).toMatch(/Add another \{meta\.accountNoun\}/);
  });

  it("can remove an account", () => {
    expect(group).toMatch(/method: "DELETE"/);
    expect(group).toMatch(/encodeURIComponent\(id\)/);
  });

  it("flags an account whose feed has broken", () => {
    expect(group).toMatch(/account\.auth_failed &&[\s\S]{0,160}Needs reconnecting/);
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
    expect(group).toMatch(/return \(\) => \{ cancelled = true; \};/);
  });

  it("hides itself entirely until the primary is connected", () => {
    expect(group).toMatch(/if \(!primaryConnected\) return null;/);
  });
});
