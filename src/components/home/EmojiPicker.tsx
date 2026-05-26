"use client";

/**
 * Shared icon picker modal — 2-tab design: Icons (Lucide) and Emojis (curated).
 * Used by the home board icon picker.
 * Supports optional palette color preview for Lucide icons.
 *
 * @param open - Whether the picker is visible
 * @param onSelect - Callback with the selected icon string (emoji or "lucide:name")
 * @param onClose - Callback to close the picker
 * @param paletteColors - Optional array of hex colors from banner palette
 */

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import emojiMartData from "@emoji-mart/data";
import SegmentedControl from "@/components/ui/SegmentedControl";
import {
  EMOJI_CATEGORIES, LUCIDE_CATEGORIES,
} from "./emoji-picker-data";

/**
 * Reverse lookup: native emoji string → searchable keywords.
 * Built once from emoji-mart data for keyword-based emoji search.
 */
const emojiKeywordMap: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  const emojis = (emojiMartData as { emojis: Record<string, { name: string; keywords: string[]; skins: { native: string }[] }> }).emojis;
  for (const entry of Object.values(emojis)) {
    for (const skin of entry.skins) {
      map.set(skin.native, [
        entry.name.toLowerCase(),
        ...entry.keywords.map((k) => k.toLowerCase()),
      ]);
    }
  }
  return map;
})();

// Re-export constants used by consumers
export { LUCIDE_ICON_MAP, isFilledIcon } from "./emoji-picker-data";

/** Tab identifiers for the picker. */
type PickerTab = "icons" | "emojis";

interface EmojiPickerProps {
  open: boolean;
  onSelect: (icon: string) => void;
  onClose: () => void;
  paletteColors?: string[];
}

export default function EmojiPicker({
  open,
  onSelect,
  onClose,
  paletteColors = [],
}: EmojiPickerProps) {
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PickerTab>("icons");
  const [iconSearch, setIconSearch] = useState("");
  const [emojiSearch, setEmojiSearch] = useState("");

  /** Flat list of all icons filtered by search query. */
  const filteredIcons = useMemo(() => {
    const q = iconSearch.toLowerCase().trim();
    if (!q) return null;
    return LUCIDE_CATEGORIES.flatMap((cat) =>
      cat.icons.filter(({ name }) =>
        name.includes(q) || cat.label.toLowerCase().includes(q)
      )
    );
  }, [iconSearch]);

  /** Filtered emoji categories by search query — matches individual emoji keywords. */
  const filteredEmojiCategories = useMemo(() => {
    const q = emojiSearch.toLowerCase().trim();
    if (!q) return null;
    const results = EMOJI_CATEGORIES.map((cat) => {
      const matchedEmojis = cat.emojis.filter((emoji) => {
        if (cat.label.toLowerCase().includes(q)) return true;
        const keywords = emojiKeywordMap.get(emoji);
        return keywords?.some((kw) => kw.includes(q)) ?? false;
      });
      return { label: cat.label, emojis: matchedEmojis };
    }).filter((cat) => cat.emojis.length > 0);
    return results;
  }, [emojiSearch]);

  if (!open) return null;

  /** Select a Lucide icon — store as "lucide:name" format. */
  function selectLucide(name: string) {
    onSelect(`lucide:${name}`);
    onClose();
  }

  /** Select an emoji. */
  function selectEmoji(emoji: string) {
    onSelect(emoji);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-announce-backdrop-in"
        onClick={onClose}
      />

      <div className="relative bg-popover rounded-2xl shadow-xl border border-border w-full w-[calc(100%-2rem)] max-w-sm animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col">
        <div className="shrink-0 border-b border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <h2 className="text-base font-semibold text-foreground">
              Choose Icon
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab bar */}
          <div className="px-4 pb-3">
            <SegmentedControl
              options={[
                { value: "icons" as const, label: "Icons" },
                { value: "emojis" as const, label: "Emojis" },
              ]}
              value={activeTab}
              onChange={(v) => setActiveTab(v as PickerTab)}
            />
          </div>

          {/* Search — sticky below tabs */}
          <div className="px-4 pb-3">
            {activeTab === "icons" && (
              <input
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder="Search icons..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                autoFocus
              />
            )}
            {activeTab === "emojis" && (
              <input
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                placeholder="Search emojis..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
            )}
          </div>
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeTab === "icons" && (
            <div className="space-y-3">

              {/* Filtered results */}
              {filteredIcons ? (
                filteredIcons.length > 0 ? (
                  <div className="grid grid-cols-9 gap-0.5">
                    {filteredIcons.map(({ name, icon: Icon, filled }) => (
                      <button
                        key={name}
                        onClick={() => selectLucide(name)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        title={name}
                      >
                        <Icon
                          size={20}
                          fill={filled ? "currentColor" : "none"}
                          style={previewColor ? { color: previewColor } : undefined}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-foreground text-center py-6">No icons found</p>
                )
              ) : (
              <>
              {paletteColors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-2 px-0.5">
                    Banner Colors
                  </p>
                  <div className="flex items-center gap-2">
                    {paletteColors.slice(0, 5).map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setPreviewColor(previewColor === color ? null : color)
                        }
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          previewColor === color
                            ? "border-blue-500 scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Preview icons in ${color}`}
                      />
                    ))}
                    {previewColor && (
                      <button
                        onClick={() => setPreviewColor(null)}
                        className="text-xs text-foreground hover:text-foreground ml-1 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}

              {LUCIDE_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs font-medium text-foreground mb-2 px-0.5">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-9 gap-0.5">
                    {cat.icons.map(({ name, icon: Icon, filled }) => (
                      <button
                        key={name}
                        onClick={() => selectLucide(name)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        title={name}
                      >
                        <Icon
                          size={20}
                          fill={filled ? "currentColor" : "none"}
                          style={
                            previewColor ? { color: previewColor } : undefined
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              </>
              )}
            </div>
          )}

          {activeTab === "emojis" && (
            <div className="space-y-3">
              {/* Filtered or all categories */}
              {filteredEmojiCategories ? (
                filteredEmojiCategories.length > 0 ? (
                  filteredEmojiCategories.map((cat) => (
                    <div key={cat.label}>
                      <p className="text-xs font-medium text-foreground mb-2 px-0.5">
                        {cat.label}
                      </p>
                      <div className="grid grid-cols-9 gap-0.5">
                        {cat.emojis.map((emoji, i) => (
                          <button
                            key={`${cat.label}-${i}`}
                            onClick={() => selectEmoji(emoji)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-muted transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-foreground text-center py-6">No emojis found</p>
                )
              ) : (
                EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.label}>
                    <p className="text-xs font-medium text-foreground mb-2 px-0.5">
                      {cat.label}
                    </p>
                    <div className="grid grid-cols-9 gap-0.5">
                      {cat.emojis.map((emoji, i) => (
                        <button
                          key={`${cat.label}-${i}`}
                          onClick={() => selectEmoji(emoji)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-muted transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
