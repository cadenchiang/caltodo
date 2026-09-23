/**
 * User-facing vocabulary. One constant per word the product must say the
 * same way everywhere, so labels are imported rather than retyped.
 *
 * Rules (UI_STYLE_GUIDE.md, Copy):
 * - Sentence case for every label, heading and button ("Skip for now").
 * - The brand is lowercase "caltodo" in running text and UI chrome.
 * - No em dashes; use commas, periods or parentheses.
 * - "Google Calendar", never "GCal", anywhere a user can read it.
 */

/** Product name as users see it. Lowercase on purpose. */
export const BRAND = "caltodo";

/** What we call a course everywhere in the UI ("Add a class", "3 classes"). */
export const CLASS_NOUN = "class";

/** Plural of CLASS_NOUN. */
export const CLASS_NOUN_PLURAL = "classes";

/** Every integration id the UI can name, including the two non-account entries. */
export type ProviderKey =
  | "canvas"
  | "gradescope"
  | "pensieve"
  | "brightspace"
  | "blackboard"
  | "classroom"
  | "gcal"
  | "syllabus";

/**
 * Product labels per provider. "Canvas" is the product; "bCourses" is only
 * Berkeley's name for it and belongs in Berkeley-specific help text
 * (BCOURSES_HINT), never as the label. The Pensive key stays spelled
 * "pensieve" in code and data because that is the storage id; only the
 * label is user-facing.
 */
export const PROVIDER_LABELS: Record<ProviderKey, string> = {
  canvas: "Canvas",
  gradescope: "Gradescope",
  pensieve: "Pensive",
  brightspace: "Brightspace",
  blackboard: "Blackboard",
  classroom: "Google Classroom",
  gcal: "Google Calendar",
  syllabus: "Syllabus",
};

/** Berkeley-only clarifier, used in help text next to a Canvas field. */
export const BCOURSES_HINT = "At Berkeley, Canvas is called bCourses.";

/** The one label for a wizard step the user may pass over. */
export const SKIP_LABEL = "Skip for now";

/** Auth verbs. "Sign", not "Log". */
export const AUTH = {
  signIn: "Sign in",
  signInWithGoogle: "Sign in with Google",
  signOut: "Sign out",
  signOutConfirmTitle: "Sign out of your account?",
  signOutConfirmBody: "You will need to sign in again to pick up where you left off.",
  signingOut: "Signing out...",
} as const;

/** Standard action labels shared by dialogs. */
export const ACTIONS = {
  cancel: "Cancel",
  close: "Close",
  confirm: "Confirm",
  delete: "Delete",
  dismiss: "Dismiss",
  done: "Done",
  goToSettings: "Go to settings",
  save: "Save",
  send: "Send",
  undo: "Undo",
} as const;

/**
 * Returns the user-facing label for a provider id.
 *
 * @param key - Provider id as stored in data
 * @returns The product label, or the key itself for an unknown id
 */
export function providerLabel(key: string): string {
  return (PROVIDER_LABELS as Record<string, string>)[key] ?? key;
}
