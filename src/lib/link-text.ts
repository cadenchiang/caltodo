/**
 * Splits plain text into renderable segments so links become clickable.
 *
 * Canvas ships assignment descriptions as markdown, so attachments arrive as
 * `[UGBA103_Week2.pdf](https://bcourses.berkeley.edu/...)`. Rendered as plain
 * text that reads as noise and the file cannot be opened.
 *
 * @module link-text
 */

/** One piece of a description: literal text, or a link to render as an anchor. */
export type TextSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; label: string; href: string };

/**
 * Markdown inline link: `[label](href)`.
 * The label stops at `]` and the href at `)`, so nested brackets are not
 * supported — Canvas does not emit them.
 */
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

/** A bare URL not already inside a markdown link. */
const BARE_URL = /https?:\/\/[^\s<>()[\]]+/g;

/** Schemes safe to put in an href. Anything else is left as text. */
const SAFE_SCHEME = /^https?:\/\//i;

/**
 * Trims trailing punctuation that a sentence, not the URL, owns.
 *
 * @param url - Candidate URL
 * @returns The URL without a trailing `.`, `,`, `;`, `:` or closing bracket
 */
function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)\]}]+$/, "");
}

/**
 * Parses text into literal and link segments.
 *
 * @param text - Raw description text
 * @returns Segments in source order; text with no links yields one text segment
 * @remarks Markdown links are matched first so their URLs are not also caught
 *          by the bare-URL pass. Only http and https are linkified, so a
 *          `javascript:` payload in a synced description stays inert text.
 */
export function parseLinks(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  const consumed: Array<[number, number]> = [];

  // Pass 1: markdown links.
  const markdown: Array<{ start: number; end: number; label: string; href: string }> = [];
  for (const m of text.matchAll(MARKDOWN_LINK)) {
    const [full, label, href] = m;
    const start = m.index ?? 0;
    markdown.push({ start, end: start + full.length, label, href });
    consumed.push([start, start + full.length]);
  }

  // Pass 2: bare URLs outside any markdown link.
  const bare: Array<{ start: number; end: number; label: string; href: string }> = [];
  for (const m of text.matchAll(BARE_URL)) {
    const start = m.index ?? 0;
    const raw = trimTrailingPunctuation(m[0]);
    const end = start + raw.length;
    if (consumed.some(([s, e]) => start >= s && start < e)) continue;
    bare.push({ start, end, label: raw, href: raw });
  }

  const links = [...markdown, ...bare]
    .filter((l) => SAFE_SCHEME.test(l.href))
    .sort((a, b) => a.start - b.start);

  let cursor = 0;
  for (const link of links) {
    if (link.start > cursor) {
      segments.push({ kind: "text", value: text.slice(cursor, link.start) });
    }
    segments.push({ kind: "link", label: link.label, href: link.href });
    cursor = link.end;
  }
  if (cursor < text.length) {
    segments.push({ kind: "text", value: text.slice(cursor) });
  }

  return segments;
}

/**
 * Reports whether a link points at a document worth flagging with an icon.
 *
 * @param href - Link target
 * @param label - Link text, which often carries the filename
 * @returns True when either looks like a document file
 */
export function looksLikeDocument(href: string, label: string): boolean {
  return /\.(pdf|docx?|pptx?|xlsx?|csv|txt)(\?|#|$)/i.test(label) ||
    /\.(pdf|docx?|pptx?|xlsx?|csv|txt)(\?|#|$)/i.test(href);
}
