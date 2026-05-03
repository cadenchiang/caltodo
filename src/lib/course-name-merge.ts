/**
 * Utilities for merging duplicate courses that appear on both Canvas and Gradescope.
 * Extracts a normalized "core" course code from long platform-specific names
 * and builds a mapping from verbose names to the canonical short name.
 *
 * Example:
 *   Canvas:     "UGBA 101A-LEC-002 Microeconomics for Business Decisions"
 *   Gradescope: "UGBA 101A"
 *   Canonical:  "UGBA 101A"
 *
 * @module course-name-merge
 */

import { logger } from "@/lib/logger";

/** Pattern for a single course code token (e.g. "UGBA 101A", "CS 188"). */
const CODE_PATTERN = /[A-Z]{2,6}\s*\d{1,4}[A-Z]?/i;

/**
 * Extracts the core course code from a platform-specific course name.
 * Tries, in order:
 *   1. Code at start:           "UGBA 101A-LEC-002 ..."   → "UGBA 101A"
 *   2. Parenthesized code:      "Calculus II (MATH 53)"   → "MATH 53"
 *   3. Code after a separator:  "Intro to AI - CS 188"    → "CS 188"
 *   4. Code at the very end:    "Section 1 MATH 53"       → "MATH 53"
 *
 * Returns null when no code-shaped token is present
 * (e.g. "History and Culture of Afghanistan").
 *
 * @param name - Raw course name from Canvas or Gradescope
 * @returns Extracted course code in uppercase, or null if no code pattern found
 */
export function extractCourseCode(name: string): string | null {
  if (!name) return null;

  const startMatch = name.match(new RegExp(`^(${CODE_PATTERN.source})\\b`, "i"));
  if (startMatch) return normalizeCode(startMatch[1]);

  const parenMatch = name.match(new RegExp(`\\((${CODE_PATTERN.source})\\)`, "i"));
  if (parenMatch) return normalizeCode(parenMatch[1]);

  const sepMatch = name.match(new RegExp(`[-–—:]\\s*(${CODE_PATTERN.source})\\b`, "i"));
  if (sepMatch) return normalizeCode(sepMatch[1]);

  const endMatch = name.match(new RegExp(`\\b(${CODE_PATTERN.source})\\s*$`, "i"));
  if (endMatch) return normalizeCode(endMatch[1]);

  return null;
}

/** Uppercases the code and collapses internal whitespace. */
function normalizeCode(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().toUpperCase();
}

/**
 * A course entry with source and name, used for building the merge map.
 */
interface CourseEntry {
  source: string;
  name: string;
}

/**
 * Builds a mapping from raw course names to canonical (merged) names.
 * When the same course code appears on multiple platforms, picks the
 * shortest name as canonical (usually Gradescope's cleaner name).
 *
 * @param courses - All courses from all platforms (Canvas, Gradescope, Pensieve)
 * @returns Map from raw course name → canonical course name
 */
export function buildCourseNameMap(courses: CourseEntry[]): Map<string, string> {
  // Group courses by extracted code
  const codeGroups = new Map<string, CourseEntry[]>();
  for (const c of courses) {
    const code = extractCourseCode(c.name);
    if (!code) continue;
    const group = codeGroups.get(code);
    if (group) {
      group.push(c);
    } else {
      codeGroups.set(code, [c]);
    }
  }

  // Build the name map
  const nameMap = new Map<string, string>();
  for (const [code, group] of codeGroups) {
    // Check if this code appears on multiple platforms
    const sources = new Set(group.map((c) => c.source));
    if (sources.size <= 1 && group.length <= 1) continue;

    // Pick the shortest name as canonical (tends to be the cleanest)
    const canonical = group.reduce((shortest, c) =>
      c.name.length < shortest.name.length ? c : shortest
    ).name;

    for (const c of group) {
      if (c.name !== canonical) {
        nameMap.set(c.name, canonical);
        logger.info("course-name-merge: mapping course name", {
          from: c.name,
          to: canonical,
          code,
          source: c.source,
        });
      }
    }
  }

  return nameMap;
}

/**
 * Returns the canonical name for a course, or the original if no mapping exists.
 *
 * @param name - Raw course name
 * @param nameMap - Map built by buildCourseNameMap
 * @returns Canonical course name
 */
export function getCanonicalName(name: string, nameMap: Map<string, string>): string {
  return nameMap.get(name) ?? name;
}
