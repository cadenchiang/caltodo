/**
 * Shared class recipes and helpers for TextField and TextArea, so both
 * controls paint the same border, radius, focus ring, and error state.
 */

/** The canonical input recipe (UI_STYLE_GUIDE.md, Form inputs). */
export const FIELD_INPUT =
  "w-full px-3 py-2 pointer-coarse:min-h-11 rounded-lg border border-input-border bg-card text-foreground text-sm placeholder:text-subtle-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-input-border disabled:opacity-50 disabled:cursor-not-allowed";

/** Border and ring override when the field has an error. */
export const FIELD_INPUT_ERROR = "border-danger focus:ring-danger-tint";

/** Visible label recipe. */
export const FIELD_LABEL = "block text-xs font-medium text-foreground mb-1";

/** Helper text under the control. */
export const FIELD_HINT = "mt-1 text-xs text-muted-foreground";

/** Error message under the control. */
export const FIELD_ERROR = "mt-1 text-xs text-danger";

/**
 * Joins the ids of the hint and error elements for aria-describedby.
 *
 * @param id - The control id
 * @param hasHint - Whether a hint is rendered
 * @param hasError - Whether an error is rendered
 * @returns Space-separated ids, or undefined when nothing describes the control
 */
export function describedBy(id: string, hasHint: boolean, hasError: boolean): string | undefined {
  const ids: string[] = [];
  if (hasHint) ids.push(`${id}-hint`);
  if (hasError) ids.push(`${id}-error`);
  return ids.length ? ids.join(" ") : undefined;
}
