/**
 * Google Calendar event color names and lookup.
 *
 * Google's event palette is eleven fixed colors addressed by numeric `colorId`.
 * Chat requests name a color rather than an id ("make it red"), so this module
 * resolves Google's own palette names, plain-color aliases, and raw ids onto
 * the id the API expects.
 *
 * @module mcp/gcal-colors
 */

/** Google's official name for each event colorId. */
export const GCAL_COLOR_NAMES: Record<string, string> = {
  "1": "Lavender",
  "2": "Sage",
  "3": "Grape",
  "4": "Flamingo",
  "5": "Banana",
  "6": "Tangerine",
  "7": "Peacock",
  "8": "Graphite",
  "9": "Blueberry",
  "10": "Basil",
  "11": "Tomato",
};

/**
 * Plain-color aliases onto Google's palette, so "make it blue" resolves.
 *
 * Each alias points at the palette entry a person would most likely mean:
 * Peacock is Google's standard blue, Tomato its standard red, Basil its
 * standard green.
 */
const COLOR_ALIASES: Record<string, string> = {
  blue: "7",
  red: "11",
  green: "10",
  yellow: "5",
  orange: "6",
  purple: "3",
  violet: "3",
  pink: "4",
  grey: "8",
  gray: "8",
  teal: "7",
  indigo: "9",
  navy: "9",
  "light blue": "1",
  "light green": "2",
  "dark blue": "9",
  "dark green": "10",
};

/**
 * Words that clear an event's color, returning it to its calendar's default.
 * Setting a color has to be undoable, so "make it default again" must work.
 */
const RESET_WORDS = new Set(["default", "none", "clear", "reset", "no color"]);

/** Every accepted color word, for error messages and tool descriptions. */
export const ACCEPTED_COLOR_WORDS: string[] = [
  ...Object.values(GCAL_COLOR_NAMES),
  ...Object.keys(COLOR_ALIASES),
];

/**
 * Resolves a user-supplied color into a Google `colorId`.
 *
 * @param input - A palette name ("Peacock"), a plain color ("blue"), an id ("7"),
 *                or a reset word ("default") to clear the event's own color
 * @returns The matching colorId as a string "1"-"11", or null to clear the color
 * @throws Error naming the accepted values when the input matches nothing
 * @remarks Matching is case-insensitive and ignores surrounding whitespace.
 *          A numeric id outside 1-11 is rejected rather than passed to Google,
 *          which would answer with an opaque 400.
 */
export function resolveColorId(input: string): string | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) throw new Error("A color is required.");

  if (RESET_WORDS.has(normalized)) return null;

  // Raw id, e.g. "7".
  if (/^\d+$/.test(normalized)) {
    if (GCAL_COLOR_NAMES[normalized]) return normalized;
    throw new Error(
      `Invalid colorId "${input}". Google Calendar event colors are 1-11.`
    );
  }

  const byName = Object.entries(GCAL_COLOR_NAMES).find(
    ([, name]) => name.toLowerCase() === normalized
  );
  if (byName) return byName[0];

  const byAlias = COLOR_ALIASES[normalized];
  if (byAlias) return byAlias;

  throw new Error(
    `Unknown color "${input}". Use a Google Calendar color name (${Object.values(
      GCAL_COLOR_NAMES
    ).join(", ")}), a plain color like "blue" or "red", or an id 1-11.`
  );
}

/**
 * Names a colorId for display.
 *
 * @param colorId - The event's colorId, or null when it inherits the calendar's color
 * @returns The palette name, or "default (calendar color)" when unset
 */
export function describeColor(colorId: string | null | undefined): string {
  if (!colorId) return "default (calendar color)";
  return GCAL_COLOR_NAMES[colorId] ?? `colorId ${colorId}`;
}
