/**
 * Extracts a plain-text preview from Tiptap JSON content.
 * Walks the document tree and concatenates text nodes.
 *
 * @param content - Tiptap document JSON object
 * @param maxLength - Maximum characters to return (default 100)
 * @returns Plain text preview string, truncated with ellipsis if needed
 */
export function extractTextPreview(
  content: Record<string, unknown>,
  maxLength = 100
): string {
  const parts: string[] = [];

  function walk(node: Record<string, unknown>, depth = 0) {
    if (depth > 50) return;
    if (node.type === "text" && typeof node.text === "string") {
      parts.push(node.text);
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child as Record<string, unknown>, depth + 1);
      }
    }
  }

  walk(content);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * Extracts the first non-empty text line from Tiptap JSON content.
 * Used for auto-titling notes when the title field is empty.
 *
 * @param content - Tiptap document JSON
 * @returns First text string found (max 100 chars), or empty string
 */
export function extractFirstLine(content: Record<string, unknown>): string {
  if (!Array.isArray(content.content)) return "";
  for (const node of content.content) {
    const n = node as Record<string, unknown>;
    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        const c = child as Record<string, unknown>;
        if (c.type === "text" && typeof c.text === "string" && c.text.trim()) {
          return c.text.trim().slice(0, 100);
        }
      }
    }
  }
  return "";
}
