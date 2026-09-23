/**
 * Tests for Modal, ConfirmDialog, and useDialog: dialog semantics, the solid
 * surface, focus management, Escape, backdrop target check, and scroll lock.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FOCUSABLE_SELECTOR } from "@/components/ui/useDialog";
import { MODAL_BACKDROP, MODAL_SIZES, MODAL_SURFACE } from "@/components/ui/Modal";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("useDialog", () => {
  const src = read("components/ui/useDialog.ts");

  it("matches the standard focusable set and skips tabindex=-1", () => {
    expect(FOCUSABLE_SELECTOR).toContain("button:not([disabled])");
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
  });

  it("records the opener and restores focus to it on close", () => {
    expect(src).toContain("const opener = document.activeElement as HTMLElement | null;");
    expect(src).toContain("opener.focus({ preventScroll: true });");
  });

  it("sets initial focus from initialFocusRef, then the first focusable, then the container", () => {
    expect(src).toContain("initialFocusRef?.current ?? (node ? getFocusable(node)[0] : null) ?? node");
  });

  it("locks body scroll and restores the previous value", () => {
    expect(src).toContain('document.body.style.overflow = "hidden";');
    expect(src).toContain("document.body.style.overflow = previousOverflow;");
  });

  it("closes on Escape only for the topmost dialog and traps Tab", () => {
    expect(src).toContain("if (openStack[openStack.length - 1] !== id) return;");
    expect(src).toContain('if (event.key === "Escape" && closeOnEscape)');
    expect(src).toContain('if (event.key === "Tab" && node) trapTab(event, node);');
  });

  it("ignores backdrop clicks that bubble from children", () => {
    expect(src).toContain("if (event.target !== event.currentTarget) return;");
  });
});

describe("Modal", () => {
  const src = read("components/ui/Modal.tsx");

  it("renders a solid popover surface with the documented entrance animation", () => {
    expect(MODAL_SURFACE).toContain("bg-popover");
    expect(MODAL_SURFACE).toContain("animate-announce-card-in");
    expect(MODAL_SURFACE).toContain("rounded-2xl");
    expect(MODAL_SURFACE).toContain("p-6");
    expect(MODAL_SURFACE).not.toMatch(/bg-popover\/\d/);
    expect(MODAL_SURFACE).not.toContain("backdrop-blur");
  });

  it("uses the backdrop token with blur and the fade animation", () => {
    expect(MODAL_BACKDROP).toBe("absolute inset-0 bg-backdrop backdrop-blur-sm animate-announce-backdrop-in");
  });

  it("sits on the overlay layer of the z ladder", () => {
    expect(src).toContain("fixed inset-0 z-overlay");
    expect(src).not.toContain("z-[9999]");
  });

  it("declares dialog semantics", () => {
    expect(src).toContain('role="dialog"');
    expect(src).toContain('aria-modal="true"');
    expect(src).toContain("aria-labelledby={title ? titleId : undefined}");
    expect(src).toContain("aria-describedby={description ? descriptionId : undefined}");
    expect(src).toContain("tabIndex={-1}");
  });

  it("portals to document.body and returns null when closed or on the server", () => {
    expect(src).toContain("createPortal(");
    expect(src).toContain('if (!open || typeof document === "undefined") return null;');
  });

  it("renders the standard close IconButton", () => {
    expect(src).toContain('aria-label="Close"');
    expect(src).toContain("<X size={16} />");
  });

  it("offers four sizes", () => {
    expect(MODAL_SIZES).toEqual({ sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" });
  });

  it("uses the modal title step", () => {
    expect(src).toContain('className="text-base font-semibold text-foreground"');
  });
});

describe("ConfirmDialog", () => {
  const src = read("components/ui/ConfirmDialog.tsx");

  it("is built on Modal with no close button and a small card", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).toContain("hideClose");
    expect(src).toContain('size="sm"');
  });

  it("paints destructive confirms red and moves initial focus to Cancel", () => {
    expect(src).toContain('variant={destructive ? "destructive-filled" : "primary"}');
    expect(src).toContain("initialFocusRef={destructive ? cancelRef : confirmRef}");
  });

  it("blocks every dismissal while loading", () => {
    expect(src).toContain("closeOnBackdrop={!loading}");
    expect(src).toContain("closeOnEscape={!loading}");
    expect(src).toContain("onClose={loading ? () => {} : onCancel}");
    expect(src).toContain("disabled={loading}");
  });
});
