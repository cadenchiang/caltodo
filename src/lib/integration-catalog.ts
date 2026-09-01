/**
 * One ordered catalog of every integration the settings page can show.
 *
 * The cards were previously split across two components and rendered in a
 * fixed order that mixed connected accounts in with ones the user had never
 * touched, so the list read as noise: "Connected", "Connect", a dashed
 * Canvas-only add row, "Connect" again. Deciding what is connected has to
 * happen in one place before the list can be grouped, and that is what this
 * module is: the id, the display order, and the single predicate that reads
 * the credential columns for each provider.
 *
 * It holds no JSX. The cards stay where they are and keep owning their own
 * connect and disconnect flows; this only says which group each one belongs
 * in and whether it can hold a second account.
 */

import type { IntegrationCredentials } from "@/lib/types";
import {
  PROVIDER_META,
  type IntegrationProvider,
} from "@/lib/integration-providers";

/**
 * Everything the integrations list can render, including the two entries that
 * are not rows in `integration_accounts`.
 *
 * `gcal` is the Google Calendar OAuth grant, which predates the accounts table
 * and lives in its own credential columns. `syllabus` is not a connection at
 * all: it is a one-off PDF upload that creates tasks and holds no account.
 */
export type CatalogId = IntegrationProvider | "gcal" | "syllabus";

/** How one integration behaves in the settings list. */
export interface CatalogEntry {
  /** Stable key. Matches a provider id where one exists. */
  id: CatalogId;
  /** Product name as shown to users. */
  label: string;
  /**
   * Whether this entry can ever report a connection.
   *
   * False only for Syllabus, which is an upload action. An entry that cannot
   * connect is never sorted into the connected group and never offers an
   * "add another" row, because there is nothing to add another of.
   */
  connectable: boolean;
  /**
   * Reads the credentials for this integration's connected state.
   *
   * Mirrors the same expression each card computes internally, so the group
   * an entry lands in always agrees with the badge the card itself renders.
   */
  isConnected: (credentials: IntegrationCredentials) => boolean;
}

/**
 * Every integration, in the order the settings list renders them.
 *
 * Order is by how many students use the thing, not alphabetically: the two
 * that nearly everyone connects come first so the connected group reads
 * top-down in the order it is usually filled in.
 */
export const INTEGRATION_CATALOG: readonly CatalogEntry[] = [
  {
    id: "gcal",
    label: "Google Calendar",
    connectable: true,
    isConnected: (c) => !!c.has_google_calendar,
  },
  {
    id: "canvas",
    label: PROVIDER_META.canvas.label,
    connectable: true,
    // Either half of a Canvas connection counts: an API token, or the
    // calendar feed URL used when a school blocks token creation.
    isConnected: (c) => !!c.canvas_token || !!c.canvas_ical_url,
  },
  {
    id: "gradescope",
    label: PROVIDER_META.gradescope.label,
    connectable: true,
    // The email can outlive a cleared password, so either proves a setup.
    isConnected: (c) => !!c.gradescope_email || !!c.has_gradescope_password,
  },
  {
    id: "pensieve",
    label: PROVIDER_META.pensieve.label,
    connectable: true,
    isConnected: (c) => !!c.pensieve_calendar_url,
  },
  {
    id: "brightspace",
    label: PROVIDER_META.brightspace.label,
    connectable: true,
    isConnected: (c) => !!c.brightspace_calendar_url,
  },
  {
    id: "blackboard",
    label: PROVIDER_META.blackboard.label,
    connectable: true,
    isConnected: (c) => !!c.blackboard_calendar_url,
  },
  {
    id: "classroom",
    label: PROVIDER_META.classroom.label,
    connectable: true,
    // Classroom rides on the Google grant, but holding the scope is not
    // consent to sync: it counts as connected only once syncing is on.
    isConnected: (c) => c.classroom_enabled === true,
  },
  {
    id: "syllabus",
    label: "Syllabus",
    connectable: false,
    isConnected: () => false,
  },
] as const;

/**
 * Splits the catalog into what is connected and what is still on offer.
 *
 * @param credentials - The user's current integration credentials.
 * @returns Two arrays in catalog order: connected entries, and the rest.
 * @remarks An entry that cannot connect always falls in `available`, so the
 *          Syllabus upload sits with the things you can act on rather than
 *          claiming to be an account.
 */
export function splitByConnection(credentials: IntegrationCredentials): {
  connected: CatalogEntry[];
  available: CatalogEntry[];
} {
  const connected: CatalogEntry[] = [];
  const available: CatalogEntry[] = [];
  for (const entry of INTEGRATION_CATALOG) {
    if (entry.connectable && entry.isConnected(credentials)) connected.push(entry);
    else available.push(entry);
  }
  return { connected, available };
}

/**
 * Resolves the `?setup=` route that adds a further account to an entry.
 *
 * @param id - Catalog entry to look up.
 * @returns The add route, or null when this entry holds only one account.
 * @remarks Google Calendar and Syllabus are not providers in the accounts
 *          table at all, so neither can be added twice; every other answer
 *          comes from PROVIDER_META, which is the one record of which
 *          providers the backend can actually store a second account for.
 */
export function addRouteForCatalogId(id: CatalogId): string | null {
  if (id === "gcal" || id === "syllabus") return null;
  return PROVIDER_META[id].addRoute;
}

/**
 * Noun completing "Add another ___" for one entry.
 *
 * @param id - Catalog entry to look up.
 * @returns The provider's account noun, or null when it supports only one.
 */
export function accountNounForCatalogId(id: CatalogId): string | null {
  if (id === "gcal" || id === "syllabus") return null;
  return PROVIDER_META[id].accountNoun;
}
