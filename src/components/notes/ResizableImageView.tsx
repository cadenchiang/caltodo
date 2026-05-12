"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";

/**
 * React NodeView for resizable images with text wrap support.
 * Shows a blue resize handle at the bottom-right when selected.
 * Drag the handle to resize; float/textAlign applied as data attributes.
 *
 * @param node - The TipTap node containing image attributes
 * @param updateAttributes - Callback to update node attributes (width, float, textAlign)
 * @param selected - Whether this node is currently selected in the editor
 */
export default function ResizableImageView({
  node,
  updateAttributes,
  selected,
}: ReactNodeViewProps) {
  const { src, alt, width, float: floatVal, textAlign } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  /** Stores active resize handlers so cleanup can remove them on unmount. */
  const handlersRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);

  // Clean up document listeners on unmount to prevent leaks during active resize
  useEffect(() => {
    return () => {
      if (handlersRef.current) {
        document.removeEventListener("mousemove", handlersRef.current.move);
        document.removeEventListener("mouseup", handlersRef.current.up);
        handlersRef.current = null;
      }
    };
  }, []);

  /**
   * Starts drag-to-resize on mousedown of the handle.
   * Tracks mousemove to compute new width as percentage of container parent.
   */
  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);

      const startX = e.clientX;
      const startWidth = containerRef.current?.offsetWidth ?? 200;
      const parentWidth = containerRef.current?.parentElement?.offsetWidth ?? 600;

      function onMouseMove(ev: MouseEvent) {
        const delta = ev.clientX - startX;
        const newWidth = Math.max(80, Math.min(startWidth + delta, parentWidth));
        const pct = Math.round((newWidth / parentWidth) * 100);
        updateAttributes({ width: `${pct}%` });
      }

      function onMouseUp() {
        setResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        handlersRef.current = null;
      }

      handlersRef.current = { move: onMouseMove, up: onMouseUp };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes]
  );

  const wrapperStyle: React.CSSProperties = {
    width: width || undefined,
    float: floatVal || undefined,
    ...(floatVal === "left" && { marginRight: "1rem", marginBottom: "0.5rem" }),
    ...(floatVal === "right" && { marginLeft: "1rem", marginBottom: "0.5rem" }),
    ...(!floatVal && textAlign === "center" && { marginLeft: "auto", marginRight: "auto" }),
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      data-float={floatVal || undefined}
      data-text-align={textAlign || undefined}
      className="relative inline-block max-w-full"
      style={wrapperStyle}
    >
      <img
        src={src}
        alt={alt || ""}
        className={`block max-w-full h-auto rounded-xl ${
          selected ? "ring-2 ring-blue-500" : ""
        }`}
        draggable={false}
      />
      {(selected || resizing) && (
        <div
          onMouseDown={onResizeStart}
          className="absolute bottom-1 right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-se-resize hover:bg-blue-400 transition-colors"
          title="Drag to resize"
        />
      )}
    </NodeViewWrapper>
  );
}
