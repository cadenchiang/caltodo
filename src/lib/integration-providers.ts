/**
 * Provider metadata for the multi-account integrations model.
 *
 * `integration_accounts` can hold any number of rows per (user, provider), but
 * not every provider can actually be connected twice. The table deliberately
 * stores no secrets, so a provider whose connection needs one cannot be
 * represented by a second row alone. This map is the single place that records
 * which providers support "add another" and why, so the settings UI never
 * offers a second account the backend cannot hold.
 */

/** Every provider the accounts table accepts, matching its CHECK constraint. */
export const INTEGRATION_PROVIDERS = [
  "canvas",
  "gradescope",
  "pensieve",
  "brightspace",
  "blackboard",
  "classroom",
] as const;

/** A provider key stored in integration_accounts.provider. */
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

/** Why a provider cannot hold more than one account. */
export type SingleAccountReason =
  /** Connecting needs a stored secret, which the accounts table excludes. */
  | "needs-secret"
  /** Connecting is an OAuth grant tied to one external identity. */
  | "oauth-identity";

/** How a provider behaves in the accounts model. */
export interface ProviderMeta {
  /** Stable key, matching the DB CHECK constraint. */
  id: IntegrationProvider;
  /** Product name as shown to users. Pensive is spelled without the second e. */
  label: string;
  /**
   * Noun completing "Add another ___". Canvas accounts are schools in
   * practice, which is how students refer to them.
   */
  accountNoun: string;
  /**
   * Key inside `connection` holding the thing that identifies this account,
   * or null when the provider stores nothing non-secret worth showing.
   */
  connectionKey: string | null;
  /** `?setup=` value that opens this provider's first-time connect flow. */
  setupRoute: string;
  /**
   * `?setup=` value that opens the add-another flow, or null when the
   * provider supports only one account.
   */
  addRoute: string | null;
  /** Populated only when addRoute is null, explaining the limitation. */
  singleAccountReason: SingleAccountReason | null;
}

/**
 * Metadata for every provider, in the order they appear in settings.
 *
 * Gradescope and Google Classroom are the two that cannot be added twice.
 * Gradescope authenticates with an email and password, and the password is
 * AES-encrypted in integration_credentials rather than in this table, so a
 * second account has nowhere to keep its own. Classroom is an OAuth grant
 * against one Google identity, and a second grant would need its own token
 * pair, which likewise lives elsewhere. Both are solvable, but neither is
 * solved by the accounts table alone, and offering the row before that work
 * exists would promise something that silently fails.
 */
export const PROVIDER_META: Record<IntegrationProvider, ProviderMeta> = {
  canvas: {
    id: "canvas",
    label: "Canvas",
    accountNoun: "Canvas school",
    connectionKey: "base_url",
    setupRoute: "canvas",
    addRoute: "canvas-add",
    singleAccountReason: null,
  },
  gradescope: {
    id: "gradescope",
    label: "Gradescope",
    accountNoun: "Gradescope account",
    connectionKey: "email",
    setupRoute: "gradescope",
    addRoute: null,
    singleAccountReason: "needs-secret",
  },
  pensieve: {
    id: "pensieve",
    label: "Pensive",
    accountNoun: "Pensive calendar",
    connectionKey: "calendar_url",
    setupRoute: "pensieve",
    addRoute: "pensieve-add",
    singleAccountReason: null,
  },
  brightspace: {
    id: "brightspace",
    label: "Brightspace",
    accountNoun: "Brightspace calendar",
    connectionKey: "calendar_url",
    setupRoute: "brightspace",
    addRoute: "brightspace-add",
    singleAccountReason: null,
  },
  blackboard: {
    id: "blackboard",
    label: "Blackboard",
    accountNoun: "Blackboard calendar",
    connectionKey: "calendar_url",
    setupRoute: "blackboard",
    addRoute: "blackboard-add",
    singleAccountReason: null,
  },
  classroom: {
    id: "classroom",
    label: "Google Classroom",
    accountNoun: "Google Classroom account",
    connectionKey: null,
    setupRoute: "classroom",
    addRoute: null,
    singleAccountReason: "oauth-identity",
  },
};

/**
 * Providers connected by an iCal feed URL alone.
 *
 * These are the ones a second account costs nothing to support: the whole
 * connection is a URL, so an extra row in integration_accounts is a complete
 * account with no secret and no OAuth grant behind it.
 */
export const FEED_PROVIDERS = ["pensieve", "brightspace", "blackboard"] as const;

/** A provider whose entire connection is a feed URL. */
export type FeedProvider = (typeof FEED_PROVIDERS)[number];

/**
 * Narrows a provider to one connected purely by feed URL.
 *
 * @param provider - Provider key to test.
 * @returns True when the provider's connection is just a calendar URL.
 */
export function isFeedProvider(provider: string): provider is FeedProvider {
  return (FEED_PROVIDERS as readonly string[]).includes(provider);
}

/**
 * Narrows an arbitrary string to a known provider.
 *
 * @param value - Candidate provider key, e.g. from a query parameter.
 * @returns True when the value is one the accounts table accepts.
 */
export function isIntegrationProvider(value: unknown): value is IntegrationProvider {
  return typeof value === "string"
    && (INTEGRATION_PROVIDERS as readonly string[]).includes(value);
}

/**
 * Reports whether a provider can hold more than one account today.
 *
 * @param provider - Provider key to test.
 * @returns True when settings should offer an "Add another" row for it.
 */
export function supportsMultipleAccounts(provider: IntegrationProvider): boolean {
  return PROVIDER_META[provider].addRoute !== null;
}

/**
 * Resolves the `?setup=` value that adds a further account.
 *
 * @param provider - Provider key.
 * @returns The add route, or null when the provider is single-account.
 */
export function addRouteFor(provider: IntegrationProvider): string | null {
  return PROVIDER_META[provider].addRoute;
}

/**
 * Builds the label for one account row.
 *
 * Prefers the user's own label, falls back to the identifying value in
 * `connection`, and finally to the product name, so a row is never blank.
 *
 * @param provider - Provider the account belongs to.
 * @param label - The account's stored label; may be empty.
 * @param connection - The account's connection object.
 * @returns A non-empty display string.
 */
export function accountDisplayName(
  provider: IntegrationProvider,
  label: string,
  connection: Record<string, unknown>
): string {
  const trimmed = label.trim();
  if (trimmed) return trimmed;

  const key = PROVIDER_META[provider].connectionKey;
  const raw = key ? connection[key] : null;
  if (typeof raw === "string" && raw.trim()) {
    return hostOrValue(raw.trim());
  }
  return PROVIDER_META[provider].label;
}

/**
 * Reduces a URL to its hostname, leaving non-URLs untouched.
 *
 * A raw feed URL is long and mostly opaque token, so the host is the only
 * part that tells a user which account they are looking at. Plain values such
 * as an email address pass straight through.
 *
 * @param value - A URL or an ordinary string.
 * @returns The hostname, or the original value when it does not parse.
 */
function hostOrValue(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}
