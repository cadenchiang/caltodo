"use client";

/**
 * Board icon picker — 3-tab design: Featured (curated), All Emoji (emoji-mart), Icons (Lucide).
 * Supports icon size control and palette color preview for Lucide icons.
 *
 * @param open - Whether the picker is visible
 * @param onSelect - Callback with the selected icon string (emoji or "lucide:name")
 * @param onClose - Callback to close the picker
 * @param paletteColors - Optional array of hex colors from banner palette
 * @param iconSize - Current icon size ("sm" | "md" | "lg" | "xl")
 * @param onSizeChange - Callback when icon size changes
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";
import {
  Sparkles,
  Star,
  Heart,
  Flower2,
  Leaf,
  TreePine,
  Mountain,
  Waves,
  Sun,
  Moon,
  Cloud,
  Zap,
  Coffee,
  BookOpen,
  GraduationCap,
  Palette,
  Music,
  Camera,
  Gem,
  Crown,
  Feather,
  Flame,
  Rocket,
  Globe,
  Compass,
  Anchor,
  Shell,
  Citrus,
  Cherry,
  Clover,
  Snowflake,
  Bird,
  Cat,
  Dog,
  Fish,
  Bug,
  Rabbit,
  Squirrel,
  Pencil,
  PenTool,
  Brush,
  Shapes,
  Lightbulb,
  Target,
  Trophy,
  Medal,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

/** Dynamically import emoji-mart Picker to avoid SSR issues. */
const Picker = dynamic(() => import("@emoji-mart/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

/** Icon size options. */
export const ICON_SIZES: { label: string; value: string; px: number }[] = [
  { label: "S", value: "sm", px: 48 },
  { label: "M", value: "md", px: 80 },
  { label: "L", value: "lg", px: 112 },
  { label: "XL", value: "xl", px: 144 },
];

/** Lucide icon name to component mapping for rendering stored icons. */
export const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  star: Star,
  heart: Heart,
  flower2: Flower2,
  leaf: Leaf,
  "tree-pine": TreePine,
  mountain: Mountain,
  waves: Waves,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  zap: Zap,
  coffee: Coffee,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  palette: Palette,
  music: Music,
  camera: Camera,
  gem: Gem,
  crown: Crown,
  feather: Feather,
  flame: Flame,
  rocket: Rocket,
  globe: Globe,
  compass: Compass,
  anchor: Anchor,
  shell: Shell,
  citrus: Citrus,
  cherry: Cherry,
  clover: Clover,
  snowflake: Snowflake,
  bird: Bird,
  cat: Cat,
  dog: Dog,
  fish: Fish,
  bug: Bug,
  rabbit: Rabbit,
  squirrel: Squirrel,
  pencil: Pencil,
  "pen-tool": PenTool,
  brush: Brush,
  shapes: Shapes,
  lightbulb: Lightbulb,
  target: Target,
  trophy: Trophy,
  medal: Medal,
};

/** Curated aesthetic emoji categories — Apple emoji shine on macOS. */
const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "Cute Animals",
    emojis: [
      "\u{1F98C}", "\u{1F98A}", "\u{1F430}", "\u{1F98B}", "\u{1F54A}\u{FE0F}", "\u{1F9A2}",
      "\u{1F994}", "\u{1F43B}", "\u{1F428}", "\u{1F43E}", "\u{1F43F}\u{FE0F}", "\u{1F427}",
      "\u{1F424}", "\u{1F431}", "\u{1F436}",
    ],
  },
  {
    label: "Botanicals",
    emojis: [
      "\u{1F338}", "\u{1FAB7}", "\u{1F33B}", "\u{1F337}", "\u{1F339}", "\u{1F343}",
      "\u{1F340}", "\u{1F33A}", "\u{1F33C}", "\u{1F490}", "\u{2618}\u{FE0F}", "\u{1F33E}",
      "\u{1FAB4}", "\u{1F335}", "\u{1F332}",
    ],
  },
  {
    label: "Celestial",
    emojis: [
      "\u{1F319}", "\u{2B50}", "\u{2728}", "\u{1F31F}", "\u{2600}\u{FE0F}", "\u{1F308}",
      "\u{2601}\u{FE0F}", "\u{1F30C}", "\u{1FA90}", "\u{1F31B}", "\u{1F31E}", "\u{26C5}",
      "\u{1F320}", "\u{1F4AB}", "\u{1F525}",
    ],
  },
  {
    label: "Cozy",
    emojis: [
      "\u{1F375}", "\u{2615}", "\u{1F382}", "\u{1F56F}\u{FE0F}", "\u{1F4D6}", "\u{1F9F8}",
      "\u{1F380}", "\u{1F36A}", "\u{1F370}", "\u{1F36B}", "\u{1F3B5}", "\u{1F3B6}",
      "\u{1F9F6}", "\u{1F6CB}\u{FE0F}", "\u{2764}\u{FE0F}",
    ],
  },
  {
    label: "Creative",
    emojis: [
      "\u{1F3A8}", "\u{1F3B5}", "\u{1F4F7}", "\u{270F}\u{FE0F}", "\u{1F4A1}", "\u{1F3C6}",
      "\u{1F680}", "\u{1F397}\u{FE0F}", "\u{1F3AD}", "\u{1F3AC}", "\u{1F4DD}", "\u{1F58C}\u{FE0F}",
      "\u{1F4DA}", "\u{1F310}", "\u{1F9ED}",
    ],
  },
  {
    label: "Nature",
    emojis: [
      "\u{1F30A}", "\u{26F0}\u{FE0F}", "\u{1F3D4}\u{FE0F}", "\u{1F305}", "\u{1F3D6}\u{FE0F}", "\u{1F344}",
      "\u{1F334}", "\u{1F33F}", "\u{1F490}", "\u{1F341}", "\u{1F342}", "\u{1F4A7}",
      "\u{2744}\u{FE0F}", "\u{1F30B}", "\u{1F33E}",
    ],
  },
  {
    label: "Aesthetic",
    emojis: [
      "\u{1F48E}", "\u{1F451}", "\u{1F380}", "\u{1FAA9}", "\u{1F98B}", "\u{1F496}",
      "\u{1F49C}", "\u{1F49B}", "\u{1FA77}", "\u{1F4AE}", "\u{1F381}", "\u{1F488}",
      "\u{269C}\u{FE0F}", "\u{1F397}\u{FE0F}", "\u{1F4AB}",
    ],
  },
  {
    label: "Kawaii",
    emojis: [
      "\u{1F9F8}", "\u{1F380}", "\u{1F495}", "\u{2B50}", "\u{1F361}", "\u{1F353}",
      "\u{1F351}", "\u{1F36D}", "\u{1F366}", "\u{1F36E}", "\u{1F423}", "\u{1F308}",
      "\u{1F31F}", "\u{1F496}", "\u{1F36C}",
    ],
  },
];

/** Lucide icon categories (secondary section). */
const LUCIDE_CATEGORIES: {
  label: string;
  icons: { name: string; icon: LucideIcon }[];
}[] = [
  {
    label: "Aesthetic",
    icons: [
      { name: "sparkles", icon: Sparkles },
      { name: "star", icon: Star },
      { name: "heart", icon: Heart },
      { name: "gem", icon: Gem },
      { name: "crown", icon: Crown },
      { name: "feather", icon: Feather },
      { name: "flame", icon: Flame },
      { name: "zap", icon: Zap },
    ],
  },
  {
    label: "Nature",
    icons: [
      { name: "flower2", icon: Flower2 },
      { name: "leaf", icon: Leaf },
      { name: "tree-pine", icon: TreePine },
      { name: "mountain", icon: Mountain },
      { name: "waves", icon: Waves },
      { name: "sun", icon: Sun },
      { name: "moon", icon: Moon },
      { name: "cloud", icon: Cloud },
    ],
  },
  {
    label: "Creative",
    icons: [
      { name: "palette", icon: Palette },
      { name: "music", icon: Music },
      { name: "camera", icon: Camera },
      { name: "pencil", icon: Pencil },
      { name: "brush", icon: Brush },
      { name: "lightbulb", icon: Lightbulb },
      { name: "target", icon: Target },
      { name: "trophy", icon: Trophy },
    ],
  },
];

/** Tab identifiers for the picker. */
type PickerTab = "featured" | "all" | "icons";

interface EmojiPickerProps {
  open: boolean;
  onSelect: (icon: string) => void;
  onClose: () => void;
  paletteColors?: string[];
  iconSize?: string;
  onSizeChange?: (size: string) => void;
}

export default function EmojiPicker({
  open,
  onSelect,
  onClose,
  paletteColors = [],
  iconSize = "md",
  onSizeChange,
}: EmojiPickerProps) {
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [lucideExpanded, setLucideExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<PickerTab>("featured");

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

  /** Tab button styling helper. */
  function tabClass(tab: PickerTab): string {
    return `px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-blue-500 text-white"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-announce-backdrop-in"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-popover rounded-2xl shadow-xl border border-border w-full max-w-sm mx-4 animate-announce-card-in overflow-hidden max-h-[80vh] flex flex-col">
        <div className="p-4 pb-2 shrink-0">
          <h2 className="text-base font-semibold text-foreground mb-2">
            Choose an icon
          </h2>

          {/* Tab bar */}
          <div className="flex gap-1 mb-2">
            <button onClick={() => setActiveTab("featured")} className={tabClass("featured")}>
              Featured
            </button>
            <button onClick={() => setActiveTab("all")} className={tabClass("all")}>
              All Emoji
            </button>
            <button onClick={() => setActiveTab("icons")} className={tabClass("icons")}>
              Icons
            </button>
          </div>

          {/* Size picker */}
          {onSizeChange && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Size
              </span>
              <div className="flex gap-1 ml-1">
                {ICON_SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => onSizeChange(s.value)}
                    className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                      iconSize === s.value
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Featured tab — curated Pinterest aesthetic emoji */}
          {activeTab === "featured" && (
            <div className="space-y-3">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 px-0.5">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-8 gap-0.5">
                    {cat.emojis.map((emoji, i) => (
                      <button
                        key={`${cat.label}-${i}`}
                        onClick={() => selectEmoji(emoji)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-lg hover:bg-muted transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Emoji tab — emoji-mart full picker */}
          {activeTab === "all" && (
            <div className="[&>em-emoji-picker]:w-full [&>em-emoji-picker]:border-0 [&>em-emoji-picker]:bg-transparent">
              <Picker
                data={data}
                onEmojiSelect={(emoji: { native: string }) => selectEmoji(emoji.native)}
                theme="auto"
                set="native"
                skinTonePosition="search"
                previewPosition="none"
                navPosition="top"
                perLine={8}
              />
            </div>
          )}

          {/* Icons tab — Lucide icons with palette */}
          {activeTab === "icons" && (
            <div className="space-y-3">
              {/* Palette suggestions */}
              {paletteColors.length > 0 && (
                <div className="pb-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-0.5">
                    Banner Colors
                  </p>
                  <div className="flex gap-1.5">
                    {paletteColors.slice(0, 5).map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setPreviewColor(previewColor === color ? null : color)
                        }
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
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
                        className="text-[10px] text-muted-foreground hover:text-foreground ml-1"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}

              {LUCIDE_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 px-0.5">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-8 gap-0.5">
                    {cat.icons.map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        onClick={() => selectLucide(name)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        title={name}
                      >
                        <Icon
                          size={20}
                          style={
                            previewColor ? { color: previewColor } : undefined
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
