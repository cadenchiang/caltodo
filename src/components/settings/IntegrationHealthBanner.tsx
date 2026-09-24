"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useCredentials } from "@/components/settings/IntegrationSettings";
import { useTaskContext } from "@/contexts/TaskContext";
import { buildHealthIssues, type HealthAction } from "@/lib/integration-health-issues";

/**
 * Transparency banner shown at the top of the Integrations settings section.
 *
 * Students' credentials expire mid-semester: Canvas API tokens (120-day
 * lifetime), Gradescope passwords, Google Calendar grants, and iCal feed URLs.
 * When that happens sync silently stops. This surfaces every failing/expired
 * integration as a clear warning pill with a one-click way to fix it, so a
 * broken connection never fails invisibly.
 *
 * Which connections are broken is decided by `buildHealthIssues`; this renders
 * that list and turns each issue's action into navigation.
 *
 * Renders nothing when everything is healthy.
 */
export default function IntegrationHealthBanner() {
  const router = useRouter();
  const { credentials } = useCredentials();
  const { syncResult } = useTaskContext();

  const issues = buildHealthIssues(credentials, syncResult);

  /**
   * Runs an issue's fix action.
   *
   * @param action - What the issue's button should do.
   */
  function runAction(action: HealthAction) {
    if (action.kind === "href") {
      // assign(), not a location.href write: the OAuth route is a full page
      // navigation out of the app, and the lint rule reads the assignment
      // form as mutating a value from outside the component.
      window.location.assign(action.url);
      return;
    }
    router.push(`/app/onboarding?setup=${action.provider}`);
  }

  if (issues.length === 0) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <AlertTriangle size={14} className="shrink-0 text-amber-500" />
        <p className="text-sm font-semibold text-foreground">
          {issues.length === 1
            ? "1 connection needs attention"
            : `${issues.length} connections need attention`}
        </p>
      </div>
      <ul className="divide-y divide-border border-t border-border">
        {issues.map((issue) => (
          <li key={issue.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <p className="text-sm text-foreground truncate">{issue.label}</p>
              <p className="text-xs text-muted-foreground truncate">{issue.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => runAction(issue.action)}
              className="shrink-0 text-xs font-medium px-3 py-1 rounded-lg border border-border text-secondary-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {issue.actionLabel}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
