/**
 * Resolves one integration's accounts into a single list the card can render.
 *
 * A provider's accounts live in up to three places: the primary account is the
 * flat credential columns, Canvas keeps extra schools in
 * `additional_canvas_accounts`, and the feed providers keep theirs as rows in
 * `integration_accounts`. Flattening them is pure work over data the caller
 * already has, so it sits here rather than inside the hook that fetches it.
 */

import type { IntegrationCredentials } from "@/lib/types";
import type { DisclosureProvider } from "@/lib/integration-disclosure";
import { accountDisplayName, isFeedProvider } from "@/lib/integration-providers";
import {
  COURSE_SELECTION,
  hasCourseSelection,
  type SelectableCourse,
} from "@/lib/course-selection";
import type { DisclosureAccount } from "@/components/settings/ConnectedIntegrationCard";

/** One extra account as returned by /api/integration-accounts. */
export interface AccountRow {
  id: string;
  provider: string;
  label: string;
  connection: Record<string, unknown>;
  auth_failed: boolean;
  selected_courses?: SelectableCourse[] | null;
}

/**
 * Names the primary account in a way that identifies it.
 *
 * @param provider - Which provider the account belongs to.
 * @param credentials - Current credentials.
 * @returns The account's email, its Canvas host, or the provider's own name.
 * @remarks A feed URL is mostly opaque token, so only its host is worth
 *          showing; an email identifies itself.
 */
function primaryLabel(provider: DisclosureProvider, credentials: IntegrationCredentials): string {
  if (provider === "gradescope") return credentials.gradescope_email ?? "Primary account";
  const url =
    provider === "canvas"
      ? credentials.canvas_base_url || credentials.canvas_ical_url
      : provider === "pensieve"
        ? credentials.pensieve_calendar_url
        : provider === "brightspace"
          ? credentials.brightspace_calendar_url
          : credentials.blackboard_calendar_url;
  if (!url) return "Primary account";
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Reads the primary account's class selection from its credential column.
 *
 * @param provider - Which provider the account belongs to.
 * @param credentials - Current credentials.
 * @returns The selected courses, or null for a provider offering no choice.
 * @remarks Brightspace and Blackboard sync a whole feed, so they have no
 *          course endpoint and no column to save a selection into. Null and
 *          an empty array mean different things to the card: null hides the
 *          picker, [] shows it with nothing selected.
 */
export function primaryCourses(
  provider: DisclosureProvider,
  credentials: IntegrationCredentials
): SelectableCourse[] | null {
  if (!hasCourseSelection(provider)) return null;
  return (
    (credentials[COURSE_SELECTION[provider].primaryColumn as keyof IntegrationCredentials] as
      | SelectableCourse[]
      | null) ?? []
  );
}

/**
 * Flattens every store this provider keeps accounts in into one list.
 *
 * @param provider - Which provider to list.
 * @param credentials - Current credentials, holding the primary and Canvas's extras.
 * @param feedAccounts - Rows already fetched from /api/integration-accounts.
 * @returns The accounts, primary first.
 */
export function buildAccountList(
  provider: DisclosureProvider,
  credentials: IntegrationCredentials,
  feedAccounts: AccountRow[]
): DisclosureAccount[] {
  return [
    {
      id: "primary",
      label: primaryLabel(provider, credentials),
      isPrimary: true,
      authFailed: false,
      selectedCourses: primaryCourses(provider, credentials),
    },
    ...(provider === "canvas"
      ? (credentials.additional_canvas_accounts ?? []).map((a) => ({
          id: a.id,
          label: a.label || (() => {
            try {
              return new URL(a.base_url || a.ical_url || "").hostname;
            } catch {
              return "Canvas school";
            }
          })(),
          isPrimary: false,
          authFailed: !!a.auth_failed,
          selectedCourses: (a.selected_courses ?? []) as SelectableCourse[],
        }))
      : []),
    ...(isFeedProvider(provider)
      ? feedAccounts.map((a) => ({
          id: a.id,
          label: accountDisplayName(provider, a.label, a.connection),
          isPrimary: false,
          authFailed: a.auth_failed,
          selectedCourses: hasCourseSelection(provider) ? a.selected_courses ?? [] : null,
        }))
      : []),
  ];
}
