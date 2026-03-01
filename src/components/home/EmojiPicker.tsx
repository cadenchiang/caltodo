"use client";

/**
 * Emoji picker popup modal for selecting a board icon.
 * Shows a grid of preset emojis organized by category.
 * Centered modal with backdrop, matching app modal style.
 *
 * @param open - Whether the picker is visible
 * @param onSelect - Callback with the selected emoji string
 * @param onClose - Callback to close the picker
 */

/** Preset emoji categories with curated selections. */
const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: ["😊", "😎", "🤓", "🧠", "💡", "✨", "🔥", "💪"],
  },
  {
    label: "Objects",
    emojis: ["📋", "📚", "📝", "📖", "🎯", "🏆", "⭐", "💼"],
  },
  {
    label: "Nature",
    emojis: ["🌱", "🌸", "🌊", "🌙", "☀️", "🌈", "🍀", "🌻"],
  },
  {
    label: "Activities",
    emojis: ["🎨", "🎵", "🎮", "🏃", "🧘", "🚀", "⚡", "🎓"],
  },
  {
    label: "Food",
    emojis: ["☕", "🍕", "🍩", "🧁", "🍎", "🥑", "🌮", "🍜"],
  },
  {
    label: "Symbols",
    emojis: ["❤️", "💜", "💙", "💚", "🤍", "🖤", "🩵", "🩷"],
  },
];

interface EmojiPickerProps {
  open: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({
  open,
  onSelect,
  onClose,
}: EmojiPickerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-announce-backdrop-in" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-xs mx-4 animate-announce-card-in overflow-hidden">
        <div className="p-4">
          <h2 className="text-base font-semibold text-foreground mb-3">Choose an icon</h2>

          {EMOJI_CATEGORIES.map((cat) => (
            <div key={cat.label} className="mb-3 last:mb-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 px-0.5">
                {cat.label}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSelect(emoji);
                      onClose();
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-muted transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
