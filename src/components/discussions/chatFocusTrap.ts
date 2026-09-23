/**
 * Focus-trap helpers for chat dialogs.
 *
 * Kept free of React so the arithmetic can be unit tested in the node
 * environment; ChatModal wires these into keydown handlers.
 *
 * @module chatFocusTrap
 */

/** Selector for elements a dialog can move focus to. */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Lists the focusable descendants of a container in DOM order.
 *
 * @param container - The dialog card element
 * @returns Focusable elements, excluding anything hidden via `hidden`
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return nodes.filter((el) => !el.hidden && el.getAttribute("aria-hidden") !== "true");
}

/**
 * Computes where Tab (or Shift+Tab) should move focus inside a trap.
 *
 * @param currentIndex - Index of the focused element within the focusable
 *                       list, or -1 when focus is outside the list
 * @param count - Number of focusable elements
 * @param shiftKey - Whether Shift was held (backwards)
 * @returns The index to focus next, or -1 when there is nothing to focus
 * @remarks Wraps at both ends. With focus outside the list, Tab goes to the
 *          first element and Shift+Tab to the last, matching what a user
 *          expects when the trap is entered from the backdrop.
 */
export function nextFocusIndex(currentIndex: number, count: number, shiftKey: boolean): number {
  if (count <= 0) return -1;
  if (currentIndex < 0) return shiftKey ? count - 1 : 0;
  if (shiftKey) return currentIndex === 0 ? count - 1 : currentIndex - 1;
  return currentIndex === count - 1 ? 0 : currentIndex + 1;
}

/**
 * Handles a Tab keydown inside a dialog by moving focus within the trap.
 *
 * @param event - The keydown event (only Tab is acted on)
 * @param container - The dialog card element
 * @returns true when the event was handled (and default prevented)
 */
export function trapTabKey(event: KeyboardEvent, container: HTMLElement): boolean {
  if (event.key !== "Tab") return false;
  const focusable = getFocusableElements(container);
  const current = focusable.indexOf(document.activeElement as HTMLElement);
  const next = nextFocusIndex(current, focusable.length, event.shiftKey);
  event.preventDefault();
  if (next >= 0) focusable[next].focus();
  return true;
}
