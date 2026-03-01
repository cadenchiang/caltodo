"use client";

/**
 * Inline notes widget — user types directly in the widget.
 * Saves content to widget config on blur/debounce.
 *
 * @param config - Widget configuration containing notes content
 * @param onUpdateConfig - Callback to persist note content changes
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { FileText } from "lucide-react";

interface NotesWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

export default function NotesWidget({ config, onUpdateConfig }: NotesWidgetProps) {
  const [content, setContent] = useState(config?.content || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <div className="h-full w-full flex flex-col p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-blue-500 shrink-0" />
          <h3 className="text-sm font-semibold text-foreground">Notes</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {content ? (
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No notes yet
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-blue-500 shrink-0" />
        <h3 className="text-sm font-semibold text-foreground">Notes</h3>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => onUpdateConfig?.({ content })}
        placeholder="Type your notes here..."
        className="no-drag flex-1 w-full text-sm bg-transparent text-foreground placeholder-muted-foreground resize-none focus:outline-none leading-relaxed"
      />
    </div>
  );
}
