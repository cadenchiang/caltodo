"use client";

/**
 * Inline notes widget — user types directly in the widget.
 * Saves content to widget config on blur/debounce.
 * Supports blank, lined, and grid paper styles.
 *
 * @param config - Widget configuration containing notes content and notesStyle
 * @param onUpdateConfig - Callback to persist note content changes
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { NotesStyleId } from "@/lib/notes-styles";
import { WidgetShell, WidgetHeader } from "./WidgetPrimitives";

/** Line height in pixels for lined/grid backgrounds. */
const LINE_HEIGHT_PX = 24;

interface NotesWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

/**
 * Returns inline CSS style for the paper background.
 *
 * @param styleId - Notes style identifier (blank, lined, grid)
 * @param lineColor - CSS color string for the lines
 * @returns React CSSProperties object for the background
 */
function getPaperStyle(
  styleId: NotesStyleId,
  lineColor: string
): React.CSSProperties {
  switch (styleId) {
    case "lined":
      return {
        backgroundImage: `repeating-linear-gradient(transparent, transparent ${LINE_HEIGHT_PX - 1}px, ${lineColor} ${LINE_HEIGHT_PX - 1}px, ${lineColor} ${LINE_HEIGHT_PX}px)`,
        backgroundSize: `100% ${LINE_HEIGHT_PX}px`,
        lineHeight: `${LINE_HEIGHT_PX}px`,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
        backgroundSize: `${LINE_HEIGHT_PX}px ${LINE_HEIGHT_PX}px`,
        lineHeight: `${LINE_HEIGHT_PX}px`,
      };
    default:
      return {};
  }
}

export default function NotesWidget({ config, onUpdateConfig }: NotesWidgetProps) {
  const [content, setContent] = useState(config?.content || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleId = (config?.notesStyle as NotesStyleId) || "blank";

  const lineColor = "var(--color-border)";
  const paperStyle = useMemo(() => getPaperStyle(styleId, lineColor), [styleId, lineColor]);

  // Sync from external config changes (e.g. hydration)
  useEffect(() => {
    setContent(config?.content || "");
  }, [config?.content]);

  /** Debounced save — persists 500ms after user stops typing. */
  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdateConfig?.({ content: value });
      }, 500);
    },
    [onUpdateConfig]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!onUpdateConfig) {
    // View mode — render notes as plain text
    return (
      <WidgetShell>
        <WidgetHeader title="Notes" />
        <div className="flex-1 overflow-y-auto" style={paperStyle}>
          {content ? (
            <p className="text-sm text-foreground whitespace-pre-wrap" style={{ lineHeight: paperStyle.lineHeight || "1.625" }}>
              {content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No notes yet
            </p>
          )}
        </div>
      </WidgetShell>
    );
  }

  return (
    <WidgetShell>
      <WidgetHeader title="Notes" />
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => onUpdateConfig?.({ content })}
        placeholder="Type your notes here..."
        className="no-drag flex-1 w-full text-sm bg-transparent text-foreground placeholder-muted-foreground resize-none focus:outline-none"
        style={{ ...paperStyle, lineHeight: paperStyle.lineHeight || "1.625" }}
      />
    </WidgetShell>
  );
}
