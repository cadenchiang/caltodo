"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type RefObject } from "react";

/** Selector for elements that can take keyboard focus. */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Lists the focusable descendants of a node in DOM order.
 *
 * @param root - Container to search
 * @returns Focusable elements, excluding ones hidden from layout
 */
export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/**
 * Keeps Tab and Shift+Tab inside a container. Call from a keydown handler.
 *
 * @param event - The Tab keydown event
 * @param root - Container whose focusables form the cycle
 * @returns True when the event was handled (focus moved and default prevented)
 */
export function trapTab(event: KeyboardEvent, root: HTMLElement): boolean {
  const items = getFocusable(root);
  if (items.length === 0) {
    event.preventDefault();
    root.focus();
    return true;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  const inside = active !== null && root.contains(active);
  if (event.shiftKey) {
    if (!inside || active === first) {
      event.preventDefault();
      last.focus();
      return true;
    }
  } else if (!inside || active === last) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

/**
 * Stack of open dialogs, most recent last. Escape only closes the top one, so
 * a confirm dialog opened over another modal does not close both.
 */
const openStack: symbol[] = [];

export interface UseDialogOptions {
  /** Whether the dialog is currently rendered. */
  open: boolean;
  /** Called on Escape or backdrop click. */
  onClose: () => void;
  /** Element to focus on open. Defaults to the first focusable, then the container. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Close when the backdrop itself is clicked. Defaults to true. */
  closeOnBackdrop?: boolean;
}

export interface UseDialogResult {
  /** Attach to the dialog surface (the element with role="dialog"). */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Attach to the backdrop's onClick. Ignores clicks that bubble from children. */
  handleBackdropClick: (event: MouseEvent<HTMLElement>) => void;
}

/**
 * Dialog behaviour shared by Modal and Popover: focus trap, initial focus,
 * focus restore to the opener, Escape to close, and body scroll lock.
 *
 * @param options - See UseDialogOptions
 * @returns Refs and handlers to spread onto the surface and backdrop
 * @remarks The container must have tabIndex={-1} so it can take focus when it
 *          has no focusable children. Scroll lock restores the previous
 *          overflow value, so nested dialogs unwind correctly.
 */
export function useDialog({
  open,
  onClose,
  initialFocusRef,
  closeOnEscape = true,
  closeOnBackdrop = true,
}: UseDialogOptions): UseDialogResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const node = containerRef.current;
    const id = Symbol("dialog");
    openStack.push(id);
    const opener = document.activeElement as HTMLElement | null;

    const target = initialFocusRef?.current ?? (node ? getFocusable(node)[0] : null) ?? node;
    target?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (openStack[openStack.length - 1] !== id) return;
      if (event.key === "Escape" && closeOnEscape) {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key === "Tab" && node) trapTab(event, node);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const index = openStack.indexOf(id);
      if (index !== -1) openStack.splice(index, 1);
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === "function" && document.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [open, closeOnEscape, initialFocusRef]);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!closeOnBackdrop) return;
      if (event.target !== event.currentTarget) return;
      onCloseRef.current();
    },
    [closeOnBackdrop]
  );

  return { containerRef, handleBackdropClick };
}
