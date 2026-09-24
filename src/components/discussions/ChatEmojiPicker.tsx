"use client";

/**
 * The emoji picker popover for the chat input.
 *
 * Split out of ChatInput so the ~432KB `@emoji-mart/data` dataset and the
 * picker that reads it can be loaded on demand rather than on first paint of
 * the discussions route. The home board splits its own picker the same way,
 * for the same reason: nobody sees this until they click the smiley.
 */

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatEmojiPickerProps {
  /** Called with the picked emoji's native character. */
  onSelect: (native: string) => void;
}

/**
 * Renders the emoji grid.
 *
 * The picker follows the app's resolved theme (the `.dark` class), not the
 * OS preference: "auto" made the picker dark inside a light app whenever
 * the user's OS was dark, and the reverse.
 *
 * @param onSelect - Receives the native character of the chosen emoji.
 * @returns The picker, sized and themed for the chat input popover.
 */
export default function ChatEmojiPicker({ onSelect }: ChatEmojiPickerProps) {
  const { resolvedTheme } = useTheme();
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      previewPosition="none"
      skinTonePosition="none"
      maxFrequentRows={2}
      perLine={8}
    />
  );
}
