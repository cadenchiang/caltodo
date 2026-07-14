"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useCredentials } from "@/components/settings/IntegrationSettings";
import { useTaskContext } from "@/contexts/TaskContext";

/**
 * A single integration that currently needs the user's attention.
 */
interface HealthIssue {
  id: string;
  /** Integration display name, e.g. "Google Calendar". */
  label: string;
  /** Plain-language explanation of what's wrong and why it matters. */
  detail: string;
  /** Label for the fix button, e.g. "Reconnect". */
  actionLabel: string;
  /** Runs when the user clicks the fix button. */
  onAction: () => void;
}

/**
 * Transparency banner shown at the top of the Integrations settings section.
 *
 * Students' credentials expire mid-semester — Canvas API tokens (120-day
 * lifetime), Gradescope passwords, Google Calendar grants, and iCal feed URLs.
 * When that happens sync silently stops. This surfaces every failing/expired
 * integration as a clear warning pill with a one-click way to fix it, so a
 * broken connection never fails invisibly.
 *
 * Sources of truth:
 *  - persistent DB flags for the connections that expire predictably
 *    (`canvas_token_expired`, `gradescope_auth_failed`, `google_auth_failed`);
 *  - the latest in-session `syncResult` for iCal feeds (Pensieve / Brightspace),
 *    which have no persistent flag — an error there means the URL is failing.
 *
 * Renders nothing when everything is healthy.
 */
export default function IntegrationHealthBanner() {
  const router = useRouter();
  const { credentials } = useCredentials();
  const { syncResult } = useTaskContext();

  const issues: HealthIssue[] = [];

  if (credentials.canvas_token_expired) {
    issues.push({
      id: "canvas",
      label: "bCourses / Canvas",
      detail: "Your access token expired (they last ~120 days). Reconnect to keep syncing assignments.",
      actionLabel: "Reconnect",
      onAction: () => router.push("/app/onboarding?setup=canvas"),
    });
  }

  if (credentials.gradescope_auth_failed) {
    issues.push({
      id: "gradescope",
      label: "Gradescope",
      detail: "Login failed — your password may have changed. Update it to resume syncing.",
      actionLabel: "Update password",
      onAction: () => router.push("/app/onboarding?setup=gradescope"),
    });
  }

  if (credentials.google_auth_failed) {
    issues.push({
      id: "gcal",
      label: "Google Calendar",
      detail: "Access was revoked, so your assignments have stopped syncing to your calendar. Reconnect to resume.",
      actionLabel: "Reconnect",
      onAction: () => { window.location.href = "/api/gcal/auth"; },
    });
  }

  // iCal feeds have no persistent flag — surface the latest sync error instead.
  if (credentials.pensieve_calendar_url && (syncResult?.pensieve.errors.length ?? 0) > 0) {
    issues.push({
      id: "pensieve",
      label: "Pensieve",
      detail: syncResult?.pensieve.errors[0] || "The feed failed to load — your Pensieve URL may have expired.",
      actionLabel: "Update URL",
      onAction: () => router.push("/app/onboarding?setup=pensieve"),
    });
  }

  if (credentials.brightspace_calendar_url && (syncResult?.brightspace.errors.length ?? 0) > 0) {
    issues.push({
      id: "brightspace",
      label: "Brightspace",
      detail: syncResult?.brightspace.errors[0] || "The feed failed to load — your Brightspace URL may have expired.",
      actionLabel: "Update URL",
      onAction: () => router.push("/app/onboarding?setup=brightspace"),
    });
  }

  if (issues.length === 0) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          {issues.length === 1
            ? "1 connection needs attention"
            : `${issues.length} connections need attention`}
        </p>
      </div>
      <ul className="mt-2 space-y-2">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="flex items-start justify-between gap-3 rounded-lg bg-amber-100/60 px-3 py-2 dark:bg-amber-500/10"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-amber-900 dark:text-amber-100">{issue.label}</p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/70">{issue.detail}</p>
            </div>
            <button
              type="button"
              onClick={issue.onAction}
              className="shrink-0 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
            >
              {issue.actionLabel}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
