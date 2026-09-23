/**
 * Content moderation module for chat messages.
 * Blocks slurs and common evasion variants (leet speak,
 * repeated characters, spaced-out letters, zero-width chars).
 *
 * @module content-moderation
 */

/**
 * Blocked slurs: n-word variants and "faggot".
 */
const BLOCKED_WORDS: string[] = ["nigger", "nigga", "faggot"];

/**
 * Leet speak character class map for letters used in blocked words.
 * Maps each letter to a regex character class matching common substitutes.
 */
const LEET_CLASSES: Record<string, string> = {
  a: "[a@4]",
  e: "[e3]",
  f: "[f]",
  g: "[g9]",
  i: "[i1!]",
  n: "[n]",
  o: "[o0]",
  r: "[r]",
  t: "[t7]",
};

/**
 * Groups consecutive identical characters in a word.
 * E.g. "nigger" → [{ ch: "n", count: 1 }, { ch: "i", count: 1 }, { ch: "g", count: 2 }, ...]
 *
 * @param word - The word to group
 * @returns Array of character groups with their run lengths
 */
function groupChars(word: string): Array<{ ch: string; count: number }> {
  const groups: Array<{ ch: string; count: number }> = [];
  for (const ch of word) {
    const last = groups[groups.length - 1];
    if (last && last.ch === ch) {
      last.count++;
    } else {
      groups.push({ ch, count: 1 });
    }
  }
  return groups;
}

/**
 * Builds a regex pattern for a blocked word that matches:
 * - Leet speak substitutions (e.g. `1` for `i`, `@` for `a`)
 * - Repeated characters (e.g. "niggger")
 * - Consecutive identical chars merged (e.g. "gg" → `[g9]{2,}`)
 * - Optional separators between characters (spaces, dots, dashes, underscores)
 *
 * @param word - The blocked word to build a pattern for
 * @returns Compiled regex with boundary matching
 */
function buildPattern(word: string): RegExp {
  const sep = "[\\s.\\-_]*";
  const groups = groupChars(word);
  const parts = groups.map(({ ch, count }) => {
    const cls = LEET_CLASSES[ch] ?? ch;
    if (count === 1) {
      return `${cls}+`;
    }
    // For consecutive identical chars (e.g. "gg"), allow separators between each.
    // "gg" → [g9]+[\s.\-_]*[g9]+ (at least 2, with optional separators between)
    const single = `${cls}+`;
    const repeated = Array.from({ length: count }, () => single).join(sep);
    return repeated;
  });
  const pattern = parts.join(sep);
  // Use lookahead/lookbehind instead of \b because leet substitutes
  // like @ are not word characters, breaking standard word boundaries.
  return new RegExp(`(?<![\\w])${pattern}(?![\\w])`, "i");
}

/** Pre-compiled regex patterns for each blocked word. */
const BLOCKED_PATTERNS: RegExp[] = BLOCKED_WORDS.map(buildPattern);

/**
 * Normalizes text by stripping zero-width characters and lowercasing.
 * Used as a pre-processing step before pattern matching.
 *
 * @param text - Raw input text
 * @returns Cleaned text for pattern matching
 */
export function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  // Decompose Unicode to strip combining characters (accent marks, diacritics)
  // that can bypass word filters (e.g. n̄igger → nigger)
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Strip zero-width characters (U+200B, U+200C, U+200D, U+FEFF)
  normalized = normalized.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
  return normalized;
}

/**
 * Checks whether a message contains blocked content (the n-word).
 * Patterns match leet speak, repeated chars, and spaced-out evasion.
 *
 * @param text - The raw message text to check
 * @returns true if the message contains blocked content, false otherwise
 *
 * @example
 * ```ts
 * containsBlockedContent("hello world");   // false
 * containsBlockedContent("nigger");        // true
 * containsBlockedContent("n1gga");         // true
 * containsBlockedContent("n i g g e r");   // true
 * ```
 */
export function containsBlockedContent(text: string): boolean {
  const normalized = normalizeText(text);

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }

  return false;
}
