/**
 * Tests for which connections the health banner warns about.
 *
 * The reported bug: students uploading a working Canvas calendar feed URL kept
 * seeing "2 connections need attention" telling them the token had expired and
 * the feed had stopped loading, and no amount of re-pasting the URL cleared
 * either row.
 */

import { describe, it, expect } from "vitest";
import { buildHealthIssues } from "@/lib/integration-health-issues";
import type { IntegrationCredentials, SyncResult } from "@/lib/types";

/** A user with nothing connected and nothing wrong. */
const HEALTHY: IntegrationCredentials = {
  canvas_token: null,
  canvas_base_url: "https://bcourses.berkeley.edu",
  canvas_ical_url: null,
  canvas_token_expired: false,
  canvas_token_expiring_soon: false,
  canvas_auth_failed: false,
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
  additional_canvas_accounts: [],
  has_completed_onboarding: true,
  blackboard_calendar_url: null,
  blackboard_auth_failed: false,
  email_digest_enabled: true,
  email_digest_hour: 15,
  email_digest_address: null,
  dismissed_modals: {},
};

/**
 * Builds credentials from the healthy baseline.
 *
 * @param overrides - Fields to change.
 * @returns A full credentials object.
 */
function creds(overrides: Partial<IntegrationCredentials>): IntegrationCredentials {
  return { ...HEALTHY, ...overrides };
}

/** A sync result with every source clean. */
const CLEAN_SYNC: SyncResult = {
  canvas: { synced: 3, errors: [] },
  gradescope: { synced: 0, errors: [] },
  pensieve: { synced: 0, errors: [] },
  brightspace: { synced: 0, errors: [] },
  blackboard: { synced: 0, errors: [] },
  classroom: { synced: 0, errors: [] },
  last_synced_at: "2026-09-04T16:00:00.000Z",
};

/**
 * A sync result carrying one Canvas error.
 *
 * @param message - The error text.
 * @param icalFailed - Whether the calendar feed is what failed.
 * @returns The sync result.
 */
function canvasFailure(message: string, icalFailed: boolean): SyncResult {
  return {
    ...CLEAN_SYNC,
    canvas: { synced: 0, errors: [message], ...(icalFailed ? { ical_failed: true } : {}) },
  };
}

describe("buildHealthIssues", () => {
  it("reports nothing when everything is healthy", () => {
    expect(buildHealthIssues(HEALTHY, CLEAN_SYNC)).toEqual([]);
  });

  it("says nothing about a Canvas feed that is working", () => {
    const issues = buildHealthIssues(
      creds({ canvas_ical_url: "https://bcourses.berkeley.edu/feeds/u.ics" }),
      CLEAN_SYNC
    );

    expect(issues).toEqual([]);
  });
});

describe("buildHealthIssues: a stale token alongside a working feed", () => {
  /** The exact reported state: old dead token, freshly pasted feed URL. */
  const RECONNECTED_BY_FEED = creds({
    canvas_token: "old-token",
    canvas_token_expired: true,
    canvas_ical_url: "https://bcourses.berkeley.edu/feeds/u.ics",
    canvas_ical_failed: false,
  });

  it("reports no issues at all", () => {
    // This is the screenshot: "2 connections need attention" for a student
    // whose assignments were syncing perfectly well from the feed.
    expect(buildHealthIssues(RECONNECTED_BY_FEED, CLEAN_SYNC)).toEqual([]);
  });

  it("stays silent even while the token sync error is still in the result", () => {
    const issues = buildHealthIssues(
      RECONNECTED_BY_FEED,
      canvasFailure("bCourses token expired. Reconnect in Settings.", false)
    );

    expect(issues).toEqual([]);
  });

  it("stays silent when the token was rejected outright", () => {
    const issues = buildHealthIssues(
      creds({ ...RECONNECTED_BY_FEED, canvas_auth_failed: true }),
      CLEAN_SYNC
    );

    expect(issues).toEqual([]);
  });

  it("stays silent when the token is merely expiring soon", () => {
    const issues = buildHealthIssues(
      creds({ ...RECONNECTED_BY_FEED, canvas_token_expired: false, canvas_token_expiring_soon: true }),
      CLEAN_SYNC
    );

    expect(issues).toEqual([]);
  });
});

describe("buildHealthIssues: Canvas token path", () => {
  it("reports an expired token when the token is the only path", () => {
    const issues = buildHealthIssues(
      creds({ canvas_token: "old-token", canvas_token_expired: true }),
      CLEAN_SYNC
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("canvas");
    expect(issues[0].actionLabel).toBe("Reconnect");
    expect(issues[0].action).toEqual({ kind: "setup", provider: "canvas" });
  });

  it("prefers the outright rejection over the 120-day heuristic", () => {
    const issues = buildHealthIssues(
      creds({ canvas_token: "old-token", canvas_auth_failed: true, canvas_token_expired: true }),
      CLEAN_SYNC
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].detail).toContain("rejected your access token");
  });

  it("warns before a token dies", () => {
    const issues = buildHealthIssues(
      creds({ canvas_token: "ok-token", canvas_token_expiring_soon: true }),
      CLEAN_SYNC
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("canvas-expiring");
  });
});

describe("buildHealthIssues: Canvas feed path", () => {
  it("reports a feed the sync engine flagged as broken", () => {
    const issues = buildHealthIssues(
      creds({ canvas_ical_url: "https://bcourses.berkeley.edu/feeds/u.ics", canvas_ical_failed: true }),
      CLEAN_SYNC
    );

    expect(issues).toHaveLength(1);
    expect(issues[0].id).toBe("canvas-ical");
    expect(issues[0].actionLabel).toBe("Update URL");
  });

  it("reports a fresh in-session feed failure before the flag round-trips", () => {
    const issues = buildHealthIssues(
      creds({ canvas_ical_url: "https://bcourses.berkeley.edu/feeds/u.ics" }),
      canvasFailure("Canvas iCal fetch failed: 404", true)
    );

    expect(issues.map((i) => i.id)).toEqual(["canvas-ical"]);
  });

  it("does not blame the feed for a token-path error in the same list", () => {
    // Any Canvas failure lands in canvas.errors, so keying the feed row off
    // that list is what produced a warning re-pasting the URL could not clear.
    const issues = buildHealthIssues(
      creds({ canvas_ical_url: "https://bcourses.berkeley.edu/feeds/u.ics" }),
      canvasFailure("Canvas returned 401 unauthorized", false)
    );

    expect(issues).toEqual([]);
  });
});

describe("buildHealthIssues: other integrations", () => {
  it("names each broken extra Canvas school separately", () => {
    const issues = buildHealthIssues(
      creds({
        additional_canvas_accounts: [
          { id: "a1", label: "canvas.stanford.edu", auth_failed: true },
          { id: "a2", label: "canvas.mit.edu", auth_failed: false },
        ] as IntegrationCredentials["additional_canvas_accounts"],
      }),
      CLEAN_SYNC
    );

    expect(issues.map((i) => i.label)).toEqual(["canvas.stanford.edu"]);
  });

  it("sends a revoked Google Calendar grant straight to the OAuth route", () => {
    const issues = buildHealthIssues(creds({ google_auth_failed: true }), CLEAN_SYNC);

    expect(issues[0].action).toEqual({ kind: "href", url: "/api/gcal/auth" });
  });

  it("reports a failed Gradescope login", () => {
    const issues = buildHealthIssues(creds({ gradescope_auth_failed: true }), CLEAN_SYNC);

    expect(issues[0].actionLabel).toBe("Update password");
  });

  it("reports a broken Pensieve feed with the error the sync gave", () => {
    const issues = buildHealthIssues(
      creds({ pensieve_calendar_url: "https://pensieve.app/feed.ics" }),
      { ...CLEAN_SYNC, pensieve: { synced: 0, errors: ["Feed returned 403"] } }
    );

    expect(issues[0].detail).toBe("Feed returned 403");
  });

  it("ignores a feed error for a provider the user has not connected", () => {
    const issues = buildHealthIssues(HEALTHY, {
      ...CLEAN_SYNC,
      brightspace: { synced: 0, errors: ["Feed returned 500"] },
    });

    expect(issues).toEqual([]);
  });
});
