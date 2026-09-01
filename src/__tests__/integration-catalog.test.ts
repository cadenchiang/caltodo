/**
 * Tests the catalog that decides how the integrations list is grouped.
 *
 * Getting this wrong is quiet and confusing rather than loud: a card lands
 * under "Available" while its own badge says Connected, or an "Add another"
 * row appears for a provider whose backend cannot store a second account and
 * the flow dead-ends. Both are covered here, along with the invariant that
 * each entry's predicate matches the expression its card computes itself.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import type { IntegrationCredentials } from "@/lib/types";
import {
  INTEGRATION_CATALOG,
  splitByConnection,
  addRouteForCatalogId,
  accountNounForCatalogId,
  type CatalogId,
} from "@/lib/integration-catalog";
import { PROVIDER_META, FEED_PROVIDERS } from "@/lib/integration-providers";

const ROOT = path.resolve(__dirname, "../..");

/** Credentials with nothing connected, as a fresh account has. */
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

describe("catalog shape", () => {
  it("lists every entry exactly once", () => {
    const ids = INTEGRATION_CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every provider the accounts table accepts", () => {
    const ids = new Set<string>(INTEGRATION_CATALOG.map((e) => e.id));
    for (const provider of Object.keys(PROVIDER_META)) {
      expect(ids.has(provider)).toBe(true);
    }
  });

  it("includes the two entries that are not accounts-table providers", () => {
    const ids = INTEGRATION_CATALOG.map((e) => e.id);
    expect(ids).toContain("gcal");
    expect(ids).toContain("syllabus");
  });

  it("marks only the syllabus upload as unconnectable", () => {
    const notConnectable = INTEGRATION_CATALOG.filter((e) => !e.connectable).map((e) => e.id);
    expect(notConnectable).toEqual(["syllabus"]);
  });
});

describe("splitByConnection", () => {
  it("puts everything under available for a fresh account", () => {
    const { connected, available } = splitByConnection(emptyCredentials());
    expect(connected).toEqual([]);
    expect(available.length).toBe(INTEGRATION_CATALOG.length);
  });

  it("never loses or duplicates an entry", () => {
    const creds = { ...emptyCredentials(), has_google_calendar: true, canvas_token: "tok" };
    const { connected, available } = splitByConnection(creds);
    const ids = [...connected, ...available].map((e) => e.id);
    expect(ids.length).toBe(INTEGRATION_CATALOG.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserves catalog order within each group", () => {
    const creds: IntegrationCredentials = {
      ...emptyCredentials(),
      has_google_calendar: true,
      canvas_token: "tok",
      pensieve_calendar_url: "https://x/f.ics",
    };
    const { connected } = splitByConnection(creds);
    const order = INTEGRATION_CATALOG.map((e) => e.id);
    const positions = connected.map((e) => order.indexOf(e.id));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  /** Each provider, and the one credential field that should connect it. */
  const CONNECTORS: Array<[CatalogId, Partial<IntegrationCredentials>]> = [
    ["gcal", { has_google_calendar: true }],
    ["canvas", { canvas_token: "tok" }],
    ["canvas", { canvas_ical_url: "https://x/feed.ics" }],
    ["gradescope", { gradescope_email: "a@b.edu" }],
    ["gradescope", { has_gradescope_password: true }],
    ["pensieve", { pensieve_calendar_url: "https://x/f.ics" }],
    ["brightspace", { brightspace_calendar_url: "https://x/f.ics" }],
    ["blackboard", { blackboard_calendar_url: "https://x/f.ics" }],
    ["classroom", { classroom_enabled: true } as Partial<IntegrationCredentials>],
  ];

  for (const [id, patch] of CONNECTORS) {
    const field = Object.keys(patch)[0];
    it(`treats ${id} as connected when ${field} is set`, () => {
      const { connected } = splitByConnection({ ...emptyCredentials(), ...patch });
      expect(connected.map((e) => e.id)).toContain(id);
    });
  }

  it("does not count a Classroom scope alone as connected", () => {
    // Holding the Google grant is not consent to sync coursework.
    const { connected } = splitByConnection({ ...emptyCredentials(), has_google_calendar: true });
    expect(connected.map((e) => e.id)).not.toContain("classroom");
  });

  it("keeps the syllabus upload out of the connected group", () => {
    // Every credential set at once: an upload is still not an account.
    const everything: IntegrationCredentials = {
      ...emptyCredentials(),
      has_google_calendar: true,
      canvas_token: "tok",
      gradescope_email: "a@b.edu",
      pensieve_calendar_url: "https://x/f.ics",
      brightspace_calendar_url: "https://x/f.ics",
      blackboard_calendar_url: "https://x/f.ics",
    };
    const { connected, available } = splitByConnection(everything);
    expect(connected.map((e) => e.id)).not.toContain("syllabus");
    expect(available.map((e) => e.id)).toContain("syllabus");
  });
});

describe("add-another routing", () => {
  it("offers an add route for Canvas and every feed provider", () => {
    expect(addRouteForCatalogId("canvas")).toBe("canvas-add");
    for (const provider of FEED_PROVIDERS) {
      expect(addRouteForCatalogId(provider)).toBe(`${provider}-add`);
    }
  });

  it("offers no add route where the backend cannot hold a second account", () => {
    // Gradescope needs a stored secret and Classroom is one OAuth identity;
    // gcal and syllabus are not providers in the accounts table at all.
    for (const id of ["gradescope", "classroom", "gcal", "syllabus"] as CatalogId[]) {
      expect(addRouteForCatalogId(id)).toBeNull();
    }
  });

  it("pairs every add route with a noun to render beside it", () => {
    for (const entry of INTEGRATION_CATALOG) {
      const route = addRouteForCatalogId(entry.id);
      const noun = accountNounForCatalogId(entry.id);
      if (route) expect(noun).toBeTruthy();
    }
  });
});

describe("list rendering", () => {
  const list = fs.readFileSync(path.join(ROOT, "src/components/settings/IntegrationList.tsx"), "utf8");
  const section = fs.readFileSync(
    path.join(ROOT, "src/components/settings/sections/IntegrationsSection.tsx"),
    "utf8"
  );

  it("renders a card for every catalog entry", () => {
    for (const entry of INTEGRATION_CATALOG) {
      expect(list).toContain(`case "${entry.id}":`);
    }
  });

  it("drives the add row from the catalog rather than hardcoding Canvas", () => {
    const card = fs.readFileSync(
      path.join(ROOT, "src/components/settings/ConnectedIntegrationCard.tsx"),
      "utf8"
    );
    expect(card).toContain("addRouteForCatalogId");
    expect(card).not.toMatch(/noun="Canvas school"/);
  });

  it("groups the list into connected and available", () => {
    expect(list).toContain("splitByConnection");
    expect(list).toContain("Connected");
    expect(list).toContain("Available");
  });

  it("drops the header dropdown that duplicated the list", () => {
    expect(section).not.toContain("ADD_OPTIONS");
    expect(section).not.toContain("Add integration");
  });

  it("leaves the section rendering the list once, not card by card", () => {
    expect(section).toContain("<IntegrationSettings />");
    expect(section).not.toContain("<GoogleCalendarSettings />");
    expect(section).not.toContain("<SyllabusSettings />");
  });
});
