/**
 * Tests for the connected integration card (audit 2.3, 2.5, 2.6, 2.7, 2.24,
 * Brightspace logo chip).
 *
 * Removing an extra account was an unconfirmed X that deleted its tasks; the
 * primary row could never say "Needs reconnecting" because buildAccountList
 * hardcoded authFailed: false; the Canvas predicate ignored canvas_auth_failed;
 * and the Brightspace tile differed between the connected and available cards.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { IntegrationCredentials } from "@/lib/types";
import {
  BRIGHTSPACE_LOGO_TILE,
  DISCLOSURE_META,
  DISCLOSURE_PROVIDERS,
  LOGO_TILE,
} from "@/lib/integration-disclosure";
import { buildAccountList } from "@/lib/integration-account-list";
import { syncedTaskPhrase } from "@/components/settings/ConnectedIntegrationCard";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

/** Minimal credentials with every flag off. */
function creds(overrides: Partial<IntegrationCredentials> = {}): IntegrationCredentials {
  return {
    has_canvas_token: true,
    canvas_base_url: "https://bcourses.berkeley.edu",
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
    has_completed_onboarding: true,
    email_digest_enabled: true,
    email_digest_hour: 15,
    email_digest_address: null,
    dismissed_modals: {},
    ...overrides,
  } as IntegrationCredentials;
}

describe("DISCLOSURE_META.canvas.authFailed", () => {
  const canvas = DISCLOSURE_META.canvas.authFailed;

  it("includes a rejected token (canvas_auth_failed)", () => {
    expect(canvas(creds({ canvas_auth_failed: true }))).toBe(true);
  });

  it("still flags an expired token and a broken feed", () => {
    expect(canvas(creds({ canvas_token_expired: true }))).toBe(true);
    expect(canvas(creds({ canvas_ical_url: "https://x/feed.ics", canvas_ical_failed: true }))).toBe(true);
  });

  it("ignores token flags once a feed is the sync path, matching the health banner", () => {
    expect(canvas(creds({ canvas_ical_url: "https://x/feed.ics", canvas_auth_failed: true }))).toBe(false);
    expect(canvas(creds({ canvas_ical_url: "https://x/feed.ics", canvas_token_expired: true }))).toBe(false);
  });

  it("is false when nothing is wrong", () => {
    expect(canvas(creds())).toBe(false);
  });
});

describe("buildAccountList primary row", () => {
  it("derives authFailed from the provider's predicate instead of hardcoding false", () => {
    const [primary] = buildAccountList("canvas", creds({ canvas_auth_failed: true }), []);
    expect(primary.isPrimary).toBe(true);
    expect(primary.authFailed).toBe(true);
    const [healthy] = buildAccountList("gradescope", creds({ gradescope_email: "a@b.edu" }), []);
    expect(healthy.authFailed).toBe(false);
    const [broken] = buildAccountList("gradescope", creds({ gradescope_email: "a@b.edu", gradescope_auth_failed: true }), []);
    expect(broken.authFailed).toBe(true);
  });
});

describe("logo tiles", () => {
  it("give every provider a tile recipe, with Brightspace on a white plate in dark mode", () => {
    for (const provider of DISCLOSURE_PROVIDERS) {
      expect(DISCLOSURE_META[provider].logoTileClassName).toBeTruthy();
    }
    expect(DISCLOSURE_META.brightspace.logoTileClassName).toBe(BRIGHTSPACE_LOGO_TILE);
    expect(BRIGHTSPACE_LOGO_TILE).toBe("bg-muted dark:bg-white");
    expect(DISCLOSURE_META.blackboard.logoTileClassName).toBe(LOGO_TILE);
  });

  it("are read by the connected card", () => {
    expect(read("components/settings/ConnectedIntegrationCard.tsx")).toContain("${meta.logoTileClassName}");
  });
});

describe("ConnectedIntegrationCard removal", () => {
  const src = read("components/settings/ConnectedIntegrationCard.tsx");

  it("confirms an extra account removal through ConfirmDialog with the task count", () => {
    expect(src).toContain('setPending({ kind: "remove", account })');
    expect(src).toContain("open={removing !== null}");
    expect(src).toContain("extraAccountTaskCount(removing)");
    expect(src).toContain('confirmLabel="Remove"');
  });

  it("counts an extra Canvas account's tasks by its external_id prefix", () => {
    expect(src).toContain("const prefix = `${account.id}:`;");
    expect(src).toContain('(t.external_id ?? "").startsWith(prefix)');
    expect(syncedTaskPhrase(1)).toBe("1 synced task");
    expect(syncedTaskPhrase(3)).toBe("3 synced tasks");
  });

  it("shows a Reconnect button next to every failed row", () => {
    expect(src).toMatch(/account\.authFailed && \(\s*<>\s*<span[^>]*>\{NEEDS_RECONNECT_LABEL\}<\/span>\s*<Button[^>]*onClick=\{reconnect\}/);
    expect(src).toContain("PROVIDER_META[provider].setupRoute");
  });

  it("no longer hand-rolls a z-[9999] confirm and uses the error toast variant", () => {
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("function DisconnectConfirm");
    expect(src).toContain('showToast(err instanceof Error ? err.message : "Failed to disconnect", { variant: "error" })');
  });

  it("useIntegrationAccounts failure toasts use the error variant", () => {
    const hook = read("hooks/useIntegrationAccounts.ts");
    const failures = hook.match(/showToast\([^;]*(Failed|did not update)[^;]*\);/g) ?? [];
    expect(failures.length).toBe(3);
    for (const call of failures) expect(call).toContain('variant: "error"');
  });
});
