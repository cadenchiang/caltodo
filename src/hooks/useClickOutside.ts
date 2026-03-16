import { useEffect, type RefObject } from "react";

/**
 * Hook that detects clicks outside a referenced element and calls a handler.
 * Used to close popups, dropdowns, and panels when clicking away.
 *
 * @param ref - React ref attached to the element to monitor
 * @param handler - Callback invoked when a click occurs outside the ref element
 * @param enabled - Whether the listener is active (default true)
 * @param excludeRefs - Optional refs to exclude from outside-click detection (e.g. trigger buttons)
 */
export default function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled: boolean = true,
  excludeRefs?: RefObject<HTMLElement | null>[]
) {
  useEffect(() => {
    if (!enabled) return;

    function handleClick(event: MouseEvent | TouchEvent) {
      const target = ("touches" in event ? event.touches[0]?.target : event.target) as Node | null;
      if (!target) return;

      if (ref.current && !ref.current.contains(target)) {
        // Skip if click landed inside any excluded ref (e.g. the trigger button)
        if (excludeRefs?.some((r) => r.current?.contains(target))) {
          return;
        }
        handler();
      }
    }

    // Use mousedown + touchstart so popups close on both desktop and mobile
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [ref, handler, enabled, excludeRefs]);
}
