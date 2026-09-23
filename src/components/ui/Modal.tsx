"use client";

import { useId, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import IconButton from "@/components/ui/IconButton";
import { useDialog } from "@/components/ui/useDialog";

/** Card width. sm for confirms, md for forms (default), lg/xl for lists. */
export type ModalSize = "sm" | "md" | "lg" | "xl";

export const MODAL_SIZES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

/** The one modal surface recipe: solid, bordered, elevated, never translucent. */
export const MODAL_SURFACE =
  "relative flex flex-col w-full max-h-[85vh] bg-popover rounded-2xl border border-border shadow-2xl p-6 animate-announce-card-in";

/** The one scrim recipe. */
export const MODAL_BACKDROP = "absolute inset-0 bg-backdrop backdrop-blur-sm animate-announce-backdrop-in";

export interface ModalProps {
  /** Whether the modal is rendered. */
  open: boolean;
  /** Called on Escape, backdrop click, and the close button. */
  onClose: () => void;
  /** Heading shown in the header. Sets aria-labelledby. */
  title?: ReactNode;
  /** Muted line under the title. Sets aria-describedby. */
  description?: ReactNode;
  /** Body content. Scrolls when taller than 85vh. */
  children: ReactNode;
  /** Optional footer (usually the action buttons), right-aligned. */
  footer?: ReactNode;
  /** Card width. Defaults to md. */
  size?: ModalSize;
  /** Hides the standard close button. Use for confirms that need an explicit choice. */
  hideClose?: boolean;
  /** Close when the backdrop is clicked. Defaults to true. */
  closeOnBackdrop?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Element to focus on open. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Accessible name when no title is rendered. */
  "aria-label"?: string;
  /** Extra classes for the card. */
  className?: string;
  /** Extra classes for the body wrapper. */
  bodyClassName?: string;
}

/**
 * Accessible centered modal. Portals to document.body, locks scroll, traps
 * focus, restores focus to the opener on close, closes on Escape and backdrop
 * click, and always renders the solid bg-popover surface with the standard
 * entrance animation.
 *
 * @param open - Controls rendering
 * @param onClose - Dismiss callback
 * @param title - Header text (h2, text-base font-semibold)
 * @param description - Muted text under the title
 * @param footer - Action row
 * @param size - sm | md | lg | xl
 * @param hideClose - Remove the close IconButton
 * @remarks Returns null during SSR and when closed. A modal without a title
 *          should pass aria-label so the dialog still has a name.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideClose = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  initialFocusRef,
  "aria-label": ariaLabel,
  className,
  bodyClassName,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { containerRef, handleBackdropClick } = useDialog({
    open,
    onClose,
    initialFocusRef,
    closeOnEscape,
    closeOnBackdrop,
  });

  if (!open || typeof document === "undefined") return null;

  const hasHeader = Boolean(title) || Boolean(description);

  return createPortal(
    <div className="fixed inset-0 z-overlay flex items-center justify-center p-4">
      <div className={MODAL_BACKDROP} onClick={handleBackdropClick} aria-hidden="true" />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={cn(MODAL_SURFACE, MODAL_SIZES[size], "focus:outline-none", className)}
      >
        {!hideClose && (
          <IconButton
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <X size={16} />
          </IconButton>
        )}

        {hasHeader && (
          <div className={cn("shrink-0 mb-4", !hideClose && "pr-8")}>
            {title && (
              <h2 id={titleId} className="text-base font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={cn("flex-1 min-h-0 overflow-y-auto", bodyClassName)}>{children}</div>

        {footer && <div className="shrink-0 flex justify-end gap-2 mt-6">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
