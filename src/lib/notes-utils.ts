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

  function walk(node: Record<string, unknown>) {
    if (node.type === "text" && typeof node.text === "string") {
      parts.push(node.text);
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child as Record<string, unknown>);
      }
    }
  }

  walk(content);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
