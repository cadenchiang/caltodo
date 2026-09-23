/**
 * Which connections the health banner should warn about, and why.
 *
 * Split out of the banner component so the decisions are testable on their
 * own. They are worth testing: this list is the app's only account of what is
 * broken, and it was telling students to fix a Canvas calendar feed that had
 * nothing wrong with it, over and over, however many times they re-pasted it.
 *
 * Sources of truth:
 *  - persistent DB flags for every connection (`canvas_token_expired`,
 *    `canvas_auth_failed`, `canvas_ical_failed`, `gradescope_auth_failed`,
 *    `google_auth_failed`, `pensieve_auth_failed`, `brightspace_auth_failed`,
 *    `blackboard_auth_failed`, `classroom_auth_failed`),
 *    so a break surfaces on a cold load / other device / after a background
 *    sync, not only when the failing sync ran in this browser session;
 *  - the latest in-session `syncResult` as an immediate supplement for the
 *    feeds, so a fresh failure shows before the flag round-trips.
 */

import type { IntegrationCredentials, SyncResult } from "@/lib/types";
import { CLASSROOM_AVAILABLE } from "@/lib/classroom-availability";
import { PROVIDER_LABELS } from "@/lib/copy";

/** Providers whose fix is an onboarding setup step. */
export type SetupProvider = "canvas" | "gradescope" | "pensieve" | "brightspace" | "blackboard";

/** What the fix button does. */
export type HealthAction =
  /** Send the user to an onboarding step to re-enter this connection. */
  | { kind: "setup"; provider: SetupProvider }
  /** Navigate straight to a URL, for OAuth flows that have no setup step. */
  | { kind: "href"; url: string };

/** The one wording for every reconnect action. */
export const RECONNECT_ACTION = "Reconnect";

/** Where Classroom re-consent lives: the Google grant with the Classroom scopes. */
export const CLASSROOM_RECONNECT_URL = "/api/gcal/auth?classroom=1";

/** A single integration that currently needs the user's attention. */
export interface HealthIssue {
  /** Stable key for the list row. */
  id: string;
  /** Integration display name, e.g. "Google Calendar". */
  label: string;
  /** Plain-language explanation of what's wrong and why it matters. */
  detail: string;
  /** Label for the fix button, e.g. "Reconnect". */
  actionLabel: string;
  /** What the fix button should do. */
  action: HealthAction;
}

/** Sends the user to the Canvas step of onboarding. */
const CANVAS_SETUP: HealthAction = { kind: "setup", provider: "canvas" };

/**
 * Lists every connection currently needing attention, worst first.
 *
 * @param credentials - The user's stored integration credentials.
 * @param syncResult - The most recent in-session sync result, if any.
 * @returns One issue per broken connection; empty when everything is healthy.
 * @remarks Canvas syncs through exactly one path, and the calendar feed wins
 *          when both are stored (see `syncCanvas`). Every token warning is
 *          therefore suppressed once a feed exists: the token is not what
 *          syncs assignments any more, so "reconnect to keep syncing" would be
 *          untrue, and it is the warning students kept seeing after they had
 *          already fixed things by switching to a feed.
 */
export function buildHealthIssues(
  credentials: IntegrationCredentials,
  syncResult: SyncResult | null
): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const canvasSyncsViaToken = !credentials.canvas_ical_url;

  if (canvasSyncsViaToken && credentials.canvas_auth_failed) {
    // A real 401 from Canvas: definitive, and can happen before the 120-day
    // heuristic (token revoked/regenerated early). Takes priority.
    issues.push({
      id: "canvas",
      label: PROVIDER_LABELS.canvas,
      detail:
        "Canvas rejected your access token (it may have been reset). Reconnect to resume syncing assignments.",
      actionLabel: RECONNECT_ACTION,
      action: CANVAS_SETUP,
    });
  } else if (canvasSyncsViaToken && credentials.canvas_token_expired) {
    issues.push({
      id: "canvas",
      label: PROVIDER_LABELS.canvas,
      detail: "Your access token expired (they last about 120 days). Reconnect to keep syncing assignments.",
      actionLabel: RECONNECT_ACTION,
      action: CANVAS_SETUP,
    });
  } else if (canvasSyncsViaToken && credentials.canvas_token_expiring_soon) {
    // Proactive warning BEFORE the token dies, so sync never silently stops.
    issues.push({
      id: "canvas-expiring",
      label: PROVIDER_LABELS.canvas,
      detail: "Your access token expires within a week. Reconnect now so assignment sync does not stop.",
      actionLabel: RECONNECT_ACTION,
      action: CANVAS_SETUP,
    });
  }

  // Canvas iCal feed (separate from the API token above): a reset/expired feed
  // URL breaks sync just as silently. Persistent flag + in-session marker.
  //
  // The in-session half reads `ical_failed`, not `errors.length`. Canvas puts
  // every failure of either path into that one error list, so keying off it
  // reported a broken feed whenever the token died: a row no amount of
  // re-pasting the feed URL could clear, because the feed was never at fault.
  if (
    credentials.canvas_ical_url &&
    (credentials.canvas_ical_failed || syncResult?.canvas.ical_failed === true)
  ) {
    issues.push({
      id: "canvas-ical",
      label: `${PROVIDER_LABELS.canvas} (calendar feed)`,
      detail: "Your Canvas calendar feed stopped loading. The URL may have been reset, so update it to resume syncing.",
      actionLabel: "Update URL",
      action: CANVAS_SETUP,
    });
  }

  // Additional Canvas accounts each carry their own token, so each can die
  // independently of the primary one. Named individually: "Canvas is broken"
  // is useless when the user has three of them.
  for (const account of credentials.additional_canvas_accounts ?? []) {
    if (!account.auth_failed) continue;
    issues.push({
      id: `canvas-account-${account.id}`,
      label: account.label,
      detail: "Access token rejected",
      actionLabel: RECONNECT_ACTION,
      action: CANVAS_SETUP,
    });
  }

  if (credentials.gradescope_auth_failed) {
    issues.push({
      id: "gradescope",
      label: PROVIDER_LABELS.gradescope,
      detail: "Login failed",
      actionLabel: "Update password",
      action: { kind: "setup", provider: "gradescope" },
    });
  }

  if (credentials.google_auth_failed) {
    issues.push({
      id: "gcal",
      label: PROVIDER_LABELS.gcal,
      detail: "Access revoked",
      actionLabel: RECONNECT_ACTION,
      action: { kind: "href", url: "/api/gcal/auth" },
    });
  }

  // iCal feeds: the persistent DB flag is the primary signal (it survives a
  // reload and reflects background/cron/other-device syncs); the in-session
  // error is an immediate supplement so a fresh failure shows before the flag
  // round-trips. All three providers are feed-only, so any error is a feed
  // error.
  if (
    credentials.pensieve_calendar_url &&
    (credentials.pensieve_auth_failed || (syncResult?.pensieve.errors.length ?? 0) > 0)
  ) {
    issues.push(feedIssue("pensieve", syncResult?.pensieve.errors[0]));
  }

  if (
    credentials.brightspace_calendar_url &&
    (credentials.brightspace_auth_failed || (syncResult?.brightspace.errors.length ?? 0) > 0)
  ) {
    issues.push(feedIssue("brightspace", syncResult?.brightspace.errors[0]));
  }

  if (
    credentials.blackboard_calendar_url &&
    (credentials.blackboard_auth_failed || (syncResult?.blackboard?.errors.length ?? 0) > 0)
  ) {
    issues.push(feedIssue("blackboard", syncResult?.blackboard?.errors[0]));
  }

  // Classroom rides on the Google grant. Its failure is Google refusing the
  // Classroom scopes, so the fix is re-consenting with them, not a setup step.
  // Suppressed while Classroom is not offered at all: a "fix" for a sync that
  // cannot run would send the user to a consent screen that rejects them.
  if (CLASSROOM_AVAILABLE && credentials.classroom_enabled && credentials.classroom_auth_failed) {
    issues.push({
      id: "classroom",
      label: PROVIDER_LABELS.classroom,
      detail: "Google has not granted Classroom access",
      actionLabel: RECONNECT_ACTION,
      action: { kind: "href", url: CLASSROOM_RECONNECT_URL },
    });
  }

  return issues;
}

/**
 * Builds the issue for a broken calendar feed.
 *
 * @param provider - Which feed provider
 * @param firstError - The in-session error, if any, shown over the generic line
 * @returns The issue, whose fix is that provider's setup step
 */
function feedIssue(
  provider: "pensieve" | "brightspace" | "blackboard",
  firstError: string | undefined
): HealthIssue {
  return {
    id: provider,
    label: PROVIDER_LABELS[provider],
    detail: firstError || "Feed stopped loading",
    actionLabel: "Update URL",
    action: { kind: "setup", provider },
  };
}
