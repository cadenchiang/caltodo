"use client";

import { useMemo } from "react";

/** TipTap JSON node shape. */
interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string }>;
}

/**
 * Converts a TipTap JSON document to HTML string.
 * Handles common node types: paragraphs, headings, lists, task lists,
 * blockquotes, code blocks, images, and inline marks.
 *
 * @param node - TipTap JSON node
 * @returns HTML string representation
 */
function tiptapToHtml(node: TipTapNode): string {
  if (node.type === "text") {
    let text = escapeHtml(node.text ?? "");
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") text = `<strong>${text}</strong>`;
        else if (mark.type === "italic") text = `<em>${text}</em>`;
        else if (mark.type === "underline") text = `<u>${text}</u>`;
        else if (mark.type === "strike") text = `<s>${text}</s>`;
        else if (mark.type === "code") text = `<code>${text}</code>`;
      }
    }
    return text;
  }

  const children = (node.content ?? []).map(tiptapToHtml).join("");

  switch (node.type) {
    case "doc": return children;
    case "paragraph": return `<p>${children || "<br>"}</p>`;
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      return `<h${level}>${children}</h${level}>`;
    }
    case "bulletList": return `<ul>${children}</ul>`;
    case "orderedList": return `<ol>${children}</ol>`;
    case "listItem": return `<li>${children}</li>`;
    case "taskList": return `<ul class="task-list">${children}</ul>`;
    case "taskItem": {
      const checked = node.attrs?.checked ? "checked" : "";
      return `<li><input type="checkbox" ${checked} disabled />${children}</li>`;
    }
    case "blockquote": return `<blockquote>${children}</blockquote>`;
    case "codeBlock": return `<pre><code>${children}</code></pre>`;
    case "image": {
      const src = escapeHtml(String(node.attrs?.src ?? ""));
      return `<img src="${src}" style="max-width:100%;border-radius:0.75rem" />`;
    }
    case "hardBreak": return "<br>";
    default: return children;
  }
}

/**
 * Escapes HTML special characters to prevent XSS in rendered preview.
 *
 * @param str - Raw text string
 * @returns Escaped HTML-safe string
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Props {
  content: Record<string, unknown>;
}

/**
 * Renders a zoomed-out, non-interactive preview of TipTap document content.
 * Used in grid view cards for a "mini page" snapshot effect.
 * Converts TipTap JSON to HTML without external dependencies.
 *
 * @param content - TipTap document JSON to preview
 */
export default function NoteContentPreview({ content }: Props) {
  const html = useMemo(() => {
    try {
      return tiptapToHtml(content as unknown as TipTapNode);
    } catch {
      return "";
    }
  }, [content]);

  if (!html) return null;

  return (
    <div className="h-36 overflow-hidden pointer-events-none relative">
      <div
        className="prose prose-xs dark:prose-invert max-w-none origin-top-left px-5 pt-3 text-[11px] leading-snug"
        style={{ transform: "scale(0.45)", width: "222%" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-popover to-transparent" />
    </div>
  );
}
