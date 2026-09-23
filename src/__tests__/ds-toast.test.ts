/**
 * Tests for the toast stack rules: three visible, action toasts never
 * evicted, the toast layer above modals, and multi-line messages.
 */
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MAX_TOASTS, trimToastStack } from "@/contexts/ToastContext";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

interface T {
  id: number;
  action?: { label: string; onClick: () => void };
}

describe("trimToastStack", () => {
  it("allows three toasts", () => {
    expect(MAX_TOASTS).toBe(3);
    const stack: T[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const onEvict = vi.fn();
    expect(trimToastStack(stack, onEvict)).toEqual(stack);
    expect(onEvict).not.toHaveBeenCalled();
  });

  it("evicts the oldest action-less toast when a fourth arrives", () => {
    const onEvict = vi.fn();
    const next = trimToastStack<T>([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }], onEvict);
    expect(next.map((t) => t.id)).toEqual([2, 3, 4]);
    expect(onEvict).toHaveBeenCalledTimes(1);
    expect(onEvict).toHaveBeenCalledWith({ id: 1 });
  });

  it("never evicts a toast that carries an action", () => {
    const undo: T = { id: 1, action: { label: "Undo", onClick: () => {} } };
    const onEvict = vi.fn();
    const next = trimToastStack<T>([undo, { id: 2 }, { id: 3 }, { id: 4 }], onEvict);
    expect(next.map((t) => t.id)).toEqual([1, 3, 4]);
    expect(onEvict).toHaveBeenCalledWith({ id: 2 });
  });

  it("keeps every action toast even when that exceeds the limit", () => {
    const action = { label: "Undo", onClick: () => {} };
    const stack: T[] = [{ id: 1, action }, { id: 2, action }, { id: 3, action }, { id: 4, action }];
    const onEvict = vi.fn();
    expect(trimToastStack(stack, onEvict)).toHaveLength(4);
    expect(onEvict).not.toHaveBeenCalled();
  });
});

describe("toast rendering", () => {
  it("sits on the toast layer, above the overlay layer", () => {
    const ctx = read("contexts/ToastContext.tsx");
    expect(ctx).toContain("z-toast");
    expect(ctx).not.toContain("z-[200]");
  });

  it("wraps long messages to three lines and keeps the status role", () => {
    const toast = read("components/ui/Toast.tsx");
    expect(toast).toContain('<span className="line-clamp-3 min-w-0">{message}</span>');
    expect(toast).not.toContain('"truncate min-w-0"');
    expect(toast).toContain('role="status"');
    expect(toast).toContain('aria-live="polite"');
  });
});
