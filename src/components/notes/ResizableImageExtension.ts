import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ResizableImageView from "./ResizableImageView";

/**
 * Extended Image extension with resizable width and text wrap attributes.
 * Renders via a React NodeView with drag-to-resize handles.
 *
 * Attributes:
 * - width: CSS width string (e.g. "50%", "300px")
 * - float: "left" | "right" | null for text wrap
 * - textAlign: "left" | "center" | "right" for block alignment
 */
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { "data-width": attributes.width };
        },
      },
      float: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-float"),
        renderHTML: (attributes) => {
          if (!attributes.float) return {};
          return { "data-float": attributes.float };
        },
      },
      textAlign: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-text-align"),
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {};
          return { "data-text-align": attributes.textAlign };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;
