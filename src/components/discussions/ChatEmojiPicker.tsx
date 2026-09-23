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

interface ChatEmojiPickerProps {
  /** Called with the picked emoji's native character. */
  onSelect: (native: string) => void;
}

/**
 * Renders the emoji grid.
 *
 * @param onSelect - Receives the native character of the chosen emoji.
 * @returns The picker, sized and themed for the chat input popover.
 */
export default function ChatEmojiPicker({ onSelect }: ChatEmojiPickerProps) {
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
      theme="auto"
      previewPosition="none"
      skinTonePosition="none"
      maxFrequentRows={2}
      perLine={8}
    />
  );
}
