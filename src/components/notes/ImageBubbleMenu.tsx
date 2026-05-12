"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  WrapText,
} from "lucide-react";

interface Props {
  editor: Editor;
}

/**
 * Bubble menu shown when an image node is selected.
 * Provides alignment (left/center/right) and text wrap (left/right) controls.
 *
 * @param editor - The TipTap editor instance
 */
export default function ImageBubbleMenu({ editor }: Props) {
  const buttons: Array<{
    icon: typeof AlignLeft;
    label: string;
    action: () => void;
    isActive: boolean;
  }> = [
    {
      icon: AlignLeft,
      label: "Align left",
      action: () =>
        editor
          .chain()
          .focus()
          .updateAttributes("image", { textAlign: "left", float: null })
          .run(),
      isActive:
        editor.getAttributes("image").textAlign === "left" &&
        !editor.getAttributes("image").float,
    },
    {
      icon: AlignCenter,
      label: "Center",
      action: () =>
        editor
          .chain()
          .focus()
          .updateAttributes("image", { textAlign: "center", float: null })
          .run(),
      isActive: editor.getAttributes("image").textAlign === "center",
    },
    {
      icon: AlignRight,
      label: "Align right",
      action: () =>
        editor
          .chain()
          .focus()
          .updateAttributes("image", { textAlign: "right", float: null })
          .run(),
      isActive:
        editor.getAttributes("image").textAlign === "right" &&
        !editor.getAttributes("image").float,
    },
    {
      icon: WrapText,
      label: "Wrap left",
      action: () =>
        editor
          .chain()
          .focus()
          .updateAttributes("image", { float: "left", textAlign: null })
          .run(),
      isActive: editor.getAttributes("image").float === "left",
    },
    {
      icon: WrapText,
      label: "Wrap right",
      action: () =>
        editor
          .chain()
          .focus()
          .updateAttributes("image", { float: "right", textAlign: null })
          .run(),
      isActive: editor.getAttributes("image").float === "right",
    },
  ];

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: ed }) => ed.isActive("image")}
    >
      <div className="flex items-center gap-0.5 rounded-xl border border-border bg-popover px-1.5 py-1 shadow-lg">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          const mirrorClass = btn.label === "Wrap right" ? "scale-x-[-1]" : "";
          return (
            <button
              key={btn.label}
              onClick={btn.action}
              title={btn.label}
              className={`p-1.5 rounded transition-colors ${
                btn.isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon size={16} className={mirrorClass} />
            </button>
          );
        })}
      </div>
    </BubbleMenu>
  );
}
