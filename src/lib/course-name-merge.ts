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

/**
 * Extracts the core course code from a platform-specific course name.
 * Handles common UC Berkeley patterns like:
 *   "UGBA 101A-LEC-002 Microeconomics..." → "UGBA 101A"
 *   "CS 188 - Introduction to AI"         → "CS 188"
 *   "EE 16A"                              → "EE 16A"
 *   "History and Culture of Afghanistan"   → null (no extractable code)
 *
 * @param name - Raw course name from Canvas or Gradescope
 * @returns Extracted course code in uppercase, or null if no code pattern found
 */
export function extractCourseCode(name: string): string | null {
  // Match patterns like "UGBA 101A", "CS 188", "EE 16B", "MATH 53", "EECS 126"
  // Optionally followed by section info like "-LEC-002" or " - Title"
  const match = name.match(/^([A-Z]{2,6}\s*\d{1,4}[A-Z]?)\b/i);
  if (!match) return null;
  // Normalize: uppercase, collapse whitespace
  return match[1].replace(/\s+/g, " ").trim().toUpperCase();
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
