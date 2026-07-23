"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BOARD_TEMPLATES, WIDGET_REGISTRY, type BoardTemplate } from "@/lib/widget-types";

/**
 * A tiny visual preview of a template's desktop (lg) layout — renders each
 * widget as a positioned, labeled block in an 8-column mini grid so the user
 * sees the board's shape before applying it.
 */
function TemplatePreview({ template }: { template: BoardTemplate }) {
  const cols = 8;
  const layout = template.layouts.lg ?? [];
  const rows = Math.max(4, ...layout.map((i) => i.y + i.h));
  const typeById = new Map(template.widgets.map((w) => [w.id, w.type]));
  return (
    <div className="relative w-full aspect-[8/5] rounded-lg bg-muted/50 overflow-hidden">
      {layout.map((item) => {
        const type = typeById.get(item.i);
        const label = type ? WIDGET_REGISTRY[type].label : "";
        return (
          <div
            key={item.i}
            className="absolute p-[3px]"
            style={{
              left: `${(item.x / cols) * 100}%`,
              top: `${(item.y / rows) * 100}%`,
              width: `${(item.w / cols) * 100}%`,
              height: `${(item.h / rows) * 100}%`,
            }}
          >
            <div className="w-full h-full rounded-[4px] bg-card border border-border flex items-center justify-center overflow-hidden">
              <span className="text-[7px] leading-none font-medium text-muted-foreground truncate px-1">
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Full-screen modal that lets the user pick a curated board template. Applying
 * one replaces the whole board (widgets + layout). Closes on Escape / backdrop.
 */
export default function TemplateGalleryModal({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (template: BoardTemplate) => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 py-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl my-auto animate-announce-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Start from a template</h2>
            <p className="text-xs text-subtle-foreground mt-0.5">
              Pick a starting layout. This replaces your current board — you can still edit everything after.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-subtle-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          {BOARD_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => { onApply(tpl); onClose(); }}
              className="text-left rounded-xl border border-border bg-card p-3 hover:border-[#0e89d6] hover:shadow-sm transition-all active:scale-[0.99]"
            >
              <TemplatePreview template={tpl} />
              <p className="mt-2.5 text-sm font-semibold text-foreground">{tpl.name}</p>
              <p className="text-xs text-subtle-foreground mt-0.5 leading-snug">{tpl.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
