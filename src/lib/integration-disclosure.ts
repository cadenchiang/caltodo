/**
 * What the connected-integration card needs to draw and manage one provider.
 *
 * The provider cards each hard-code their own logo, subtitle, disconnect
 * payload and confirmation copy. Every one of those disconnects turned out to
 * be the same shape - null the credential columns, then delete that source's
 * tasks - so the differences between them are pure data, and keeping them as
 * data is what lets a single card render any provider with an accounts
 * dropdown instead of five near-identical components.
 *
 * Only providers whose connection can be described this way appear here.
 * Google Calendar is an OAuth grant with its own revoke flow and Classroom
 * rides on that grant, so both keep their own cards.
 */

import type { IntegrationCredentials } from "@/lib/types";

/** Every `tasks.source` value that can be bulk-deleted, per TaskContext. */
type TaskSource = "canvas" | "gradescope" | "pensieve" | "brightspace" | "blackboard" | "syllabus";

/** Providers the disclosure card can render. */
export const DISCLOSURE_PROVIDERS = [
  "canvas",
  "gradescope",
  "pensieve",
  "brightspace",
  "blackboard",
] as const;

/** A provider the disclosure card can render. */
export type DisclosureProvider = (typeof DISCLOSURE_PROVIDERS)[number];

/** Everything the card needs for one provider. */
export interface DisclosureMeta {
  /** Image in /public. */
  logo: string;
  /** Tailwind sizing for that image, which differs by artwork. */
  logoClassName: string;
  /**
   * Classes for the tile behind the image. One recipe per provider so the
   * connected card and the available card paint the same tile.
   */
  logoTileClassName: string;
  /**
   * Line under the provider name, given the current credentials.
   *
   * Says which kind of connection this is, or which account it is, so the
   * collapsed row still identifies the account without being expanded.
   */
  subtitle: (credentials: IntegrationCredentials) => string;
  /**
   * Credential columns to null out on disconnect.
   *
   * Written as a literal payload rather than a column list so the request
   * body is visible at the point it is declared.
   */
  disconnectPayload: Record<string, null>;
  /**
   * `tasks.source` value whose rows are removed alongside the credentials.
   *
   * Typed as the union TaskContext accepts rather than a bare string, so a
   * provider added here cannot name a source the delete call would reject.
   */
  taskSource: TaskSource;
  /**
   * Whether this provider's connection has failed authentication and needs
   * setting up again.
   */
  authFailed: (credentials: IntegrationCredentials) => boolean;
}

/** The default logo tile: a muted rounded square. */
export const LOGO_TILE = "bg-muted";

/**
 * Brightspace's tile is white in dark mode: the D2L mark is a black wordmark
 * on its own white plate, which otherwise reads as a harsh square inside a
 * grey rounded tile.
 */
export const BRIGHTSPACE_LOGO_TILE = "bg-muted dark:bg-white";

/**
 * Per-provider data for the connected card.
 *
 * The subtitles match what each provider's own card used to render, so moving
 * to the shared card changes no wording.
 */
export const DISCLOSURE_META: Record<DisclosureProvider, DisclosureMeta> = {
  canvas: {
    logo: "/canvas-logo.png",
    logoClassName: "w-7 h-7 object-contain",
    logoTileClassName: LOGO_TILE,
    // Which of the two ways Canvas can be connected, since they behave
    // differently: a token lists courses, a feed only carries events.
    subtitle: (c) => (c.has_canvas_token ? "API token" : "Calendar feed"),
    disconnectPayload: { canvas_token: null, canvas_ical_url: null },
    taskSource: "canvas",
    // canvas_auth_failed is a real 401 from Canvas; canvas_token_expired is
    // the 120-day age heuristic. Both concern the token, which is not what
    // syncs once a calendar feed is stored (see buildHealthIssues), so they
    // are suppressed then. A broken feed always counts.
    authFailed: (c) =>
      (!c.canvas_ical_url && (!!c.canvas_auth_failed || !!c.canvas_token_expired)) ||
      !!c.canvas_ical_failed,
  },
  gradescope: {
    logo: "/gradescope-logo.png",
    logoClassName: "w-5 h-5",
    logoTileClassName: LOGO_TILE,
    subtitle: (c) => c.gradescope_email ?? "Sync assignments from Gradescope",
    disconnectPayload: { gradescope_email: null, gradescope_password: null },
    taskSource: "gradescope",
    authFailed: (c) => !!c.gradescope_auth_failed,
  },
  pensieve: {
    logo: "/pensieve-logo.png",
    logoClassName: "w-5 h-5",
    logoTileClassName: LOGO_TILE,
    subtitle: () => "Assignments from your Pensive calendar",
    disconnectPayload: { pensieve_calendar_url: null },
    taskSource: "pensieve",
    authFailed: (c) => !!c.pensieve_auth_failed,
  },
  brightspace: {
    logo: "/brightspace-logo.svg",
    logoClassName: "w-6 h-6 object-contain",
    logoTileClassName: BRIGHTSPACE_LOGO_TILE,
    subtitle: () => "Assignments from your D2L calendar",
    disconnectPayload: { brightspace_calendar_url: null },
    taskSource: "brightspace",
    authFailed: (c) => !!c.brightspace_auth_failed,
  },
  blackboard: {
    logo: "/blackboard-logo.svg",
    logoClassName: "w-6 h-6 object-contain",
    // No white plate: the Blackboard mark is already a dark rounded tile.
    logoTileClassName: LOGO_TILE,
    subtitle: () => "Assignments from your Blackboard calendar",
    disconnectPayload: { blackboard_calendar_url: null },
    taskSource: "blackboard",
    authFailed: (c) => !!c.blackboard_auth_failed,
  },
};

/**
 * Narrows a catalog id to one the disclosure card can render.
 *
 * @param id - Catalog entry id.
 * @returns True when there is disclosure metadata for it.
 */
export function hasDisclosure(id: string): id is DisclosureProvider {
  return (DISCLOSURE_PROVIDERS as readonly string[]).includes(id);
}
