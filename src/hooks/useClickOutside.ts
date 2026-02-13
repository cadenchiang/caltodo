import { useEffect, type RefObject } from "react";

/**
 * Hook that detects clicks outside a referenced element and calls a handler.
 * Used to close popups, dropdowns, and panels when clicking away.
 *
 * @param ref - React ref attached to the element to monitor
 * @param handler - Callback invoked when a click occurs outside the ref element
 * @param enabled - Whether the listener is active (default true)
 */
export default function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    // Use mousedown so the popup closes before other click handlers fire
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, handler, enabled]);
}
