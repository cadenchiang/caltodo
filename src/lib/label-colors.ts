/**
 * Stable colours for tags and classes.
 *
 * Neither tags nor classes are stored as rows of their own - both are derived
 * from the tasks that carry them - so there is nowhere to hang a chosen
 * colour. Instead a colour is derived from the name, which gives the same tag
 * the same colour everywhere it appears, on every device, with no schema and
 * nothing to keep in sync. A class keeps whatever colour its assignments
 * already use and falls back to the derived one only when it has none.
 *
 * Two names can land on the same colour: the palette holds eight and the
 * names do not. That is the accepted cost of a colour that needs no storage.
 * The dot is an aid beside a name that is always shown in full, never the
 * thing that identifies it.
 *
 * @module label-colors
 */

import { TASK_COLORS } from "@/lib/constants";

/**
 * Colours a label may be given.
 *
 * The palette's first entry is the neutral grey used as the task default.
 * It is skipped here: a grey dot beside a grey label conveys nothing, and the
 * point of colouring the list is to tell entries apart at a glance.
 */
const LABEL_COLORS: readonly string[] = TASK_COLORS.slice(1);

/**
 * Hashes a string to a non-negative integer.
 *
 * @param text - Text to hash
 * @returns A non-negative 32-bit integer
 * @remarks djb2, chosen for being short, dependency-free, and well spread
 *          over the short strings a tag or class name actually is. The `>>> 0`
 *          keeps it unsigned so the modulo below cannot go negative.
 */
function hash(text: string): number {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = (h * 33) ^ text.charCodeAt(i);
  }
  return h >>> 0;
}

/**
 * Picks a label's colour from its name.
 *
 * @param label - Tag or class name
 * @returns A hex colour from the task palette
 * @remarks Case- and space-insensitive, so "Hong Kong" and "hong kong" cannot
 *          end up as two differently coloured entries in the same list. An
 *          empty name still returns a real colour rather than null, so callers
 *          never have to handle a missing one.
 */
export function labelColor(label: string): string {
  const key = label.trim().toLowerCase();
  return LABEL_COLORS[hash(key) % LABEL_COLORS.length];
}

/**
 * Picks a class's colour, preferring the one its assignments already use.
 *
 * @param courseName - Class name
 * @param courseColors - Class name to the colour its tasks mostly carry
 * @returns A hex colour
 * @remarks The stored colour wins so the dropdown agrees with the calendar,
 *          where the same class is already drawn in that colour. Only a class
 *          with no coloured task falls back to the derived colour.
 */
export function courseColor(
  courseName: string,
  courseColors: Map<string, string>,
): string {
  return courseColors.get(courseName) || labelColor(courseName);
}
