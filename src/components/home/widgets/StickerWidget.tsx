"use client";

/**
 * Sticker / Decorative widget — big emoji or text display.
 * Notion-style: purely aesthetic, adds personality to dashboards.
 * Configurable emoji, text, and size via widget config.
 *
 * @module StickerWidget
 */

interface StickerWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

export default function StickerWidget({ config, onUpdateConfig }: StickerWidgetProps) {
  const emoji = config?.stickerEmoji || "✨";
  const stickerText = config?.stickerText || "";

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center select-none">
      <span
        className="leading-none"
        style={{
          fontSize: "clamp(32px, 8vw, 72px)",
          animation: "float 3s ease-in-out infinite",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
        }}
        role="img"
        aria-label="Sticker"
      >
        {emoji}
      </span>
      {stickerText && (
        <p className="text-[11px] text-muted-foreground mt-3 truncate max-w-full">
          {stickerText}
        </p>
      )}
    </div>
  );
}
