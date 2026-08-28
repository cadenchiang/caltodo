/**
 * Search over the school list.
 *
 * The picker used a plain substring match against short display names, so a
 * student typing their school's official name found nothing: the list holds
 * "Georgia Tech", and "Georgia Institute of Technology" shares no substring
 * with it. This builds alias keys for each school and ranks matches in tiers,
 * falling back to fuzzy matching for typos.
 *
 * @module school-search
 */

import Fuse from "fuse.js";

/** A school plus every string that should find it. */
export interface SchoolEntry {
  /** The name shown in the picker. */
  name: string;
  /** Normalized strings that match this school, including the name itself. */
  keys: string[];
}

/**
 * Curated aliases for schools whose common and official names share too little
 * to be derived by rule. Keyed by the exact display name in the list.
 */
const CURATED_ALIASES: Record<string, string[]> = {
  MIT: ["Massachusetts Institute of Technology"],
  Caltech: ["California Institute of Technology"],
  "Georgia Tech": ["Georgia Institute of Technology", "GaTech", "GA Tech", "GT"],
  "Virginia Tech": ["Virginia Polytechnic Institute and State University", "VPI"],
  "Texas A&M": ["Texas A and M University", "Texas Agricultural and Mechanical"],
  "UC Berkeley": ["University of California Berkeley", "Cal", "Berkeley", "UCB"],
  UCLA: ["University of California Los Angeles"],
  UCSF: ["University of California San Francisco"],
  Penn: ["University of Pennsylvania", "UPenn"],
  "Penn State": ["Pennsylvania State University"],
  NYU: ["New York University"],
  USC: ["University of Southern California"],
  BYU: ["Brigham Young University"],
  SMU: ["Southern Methodist University"],
  TCU: ["Texas Christian University"],
  LSU: ["Louisiana State University"],
  "Ohio State": ["The Ohio State University", "OSU"],
  RIT: ["Rochester Institute of Technology"],
  "Illinois Tech": ["Illinois Institute of Technology", "IIT"],
  "Florida Tech": ["Florida Institute of Technology"],
  "NJIT (New Jersey Institute of Technology)": ["NJIT", "New Jersey Institute of Technology"],
  "New Mexico Tech": ["New Mexico Institute of Mining and Technology"],
  "Missouri S&T": ["Missouri University of Science and Technology"],
  "Stevens Institute of Technology": ["Stevens Tech"],
  "Carnegie Mellon": ["Carnegie Mellon University", "CMU"],
  "Johns Hopkins": ["Johns Hopkins University", "JHU"],
  "Notre Dame": ["University of Notre Dame"],
  "Boston College": ["BC"],
  "Boston University": ["BU"],
  Northeastern: ["Northeastern University", "NEU"],
  Rutgers: ["Rutgers University", "Rutgers The State University of New Jersey"],
  Purdue: ["Purdue University"],
  UIUC: ["University of Illinois Urbana-Champaign", "University of Illinois"],
  "Michigan State": ["Michigan State University", "MSU"],
  "Arizona State": ["Arizona State University", "ASU"],
  "Florida State": ["Florida State University", "FSU"],
  "Oregon State": ["Oregon State University"],
  "Washington State": ["Washington State University", "WSU"],
  "Colorado State": ["Colorado State University", "CSU"],
  "Iowa State": ["Iowa State University"],
  "Kansas State": ["Kansas State University", "K-State"],
  "Mississippi State": ["Mississippi State University"],
  "NC State": ["North Carolina State University"],
  "Cal Poly": ["California Polytechnic State University"],
  "Cal Poly Pomona": ["California State Polytechnic University Pomona"],
  RPI: ["Rensselaer Polytechnic Institute"],
  WPI: ["Worcester Polytechnic Institute"],
};

/** Words carrying no discriminating power in a school name. */
const STOPWORDS = new Set(["of", "the", "at", "and", "in", "for", "a"]);

/**
 * Normalizes a string for comparison.
 *
 * @param value - Raw text
 * @returns Lowercased, accent-stripped, punctuation-free, single-spaced text
 */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Splits normalized text into meaningful tokens.
 *
 * @param value - Raw or normalized text
 * @returns Tokens with stopwords removed
 */
export function tokenize(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/**
 * Derives extra searchable forms of a school name by rule.
 *
 * @param name - Display name from the school list
 * @returns Alternate names implied by common naming conventions
 * @remarks Rules cover the shapes that actually recur in the list: a
 *          parenthetical abbreviation, the "X Tech" / "X Institute of
 *          Technology" pair, the "UC X" expansion, and bare "X State".
 *          Derived names need not be officially correct — they only have to
 *          make the right school findable.
 */
export function deriveAliases(name: string): string[] {
  const aliases: string[] = [];

  // "Rensselaer Polytechnic Institute (RPI)" → both halves searchable.
  const paren = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    aliases.push(paren[1].trim(), paren[2].trim());
  }

  const base = paren ? paren[1].trim() : name;

  // "Georgia Tech" ↔ "Georgia Institute of Technology".
  const tech = base.match(/^(.*?)\s+Tech$/i);
  if (tech) {
    aliases.push(`${tech[1]} Institute of Technology`, `${tech[1]} Technological`);
  }
  const instituteOfTech = base.match(/^(.*?)\s+Institute of Technology$/i);
  if (instituteOfTech) {
    aliases.push(`${instituteOfTech[1]} Tech`);
  }

  // "UC Berkeley" → "University of California Berkeley".
  const uc = base.match(/^UC\s+(.+)$/i);
  if (uc) aliases.push(`University of California ${uc[1]}`);

  // "Georgia State" → "Georgia State University".
  if (/\bState$/i.test(base)) aliases.push(`${base} University`);

  // A bare name is also commonly written with "University".
  if (!/university|college|institute|school|academy/i.test(base)) {
    aliases.push(`${base} University`);
  }

  return aliases;
}

/**
 * Builds the searchable entry for one school.
 *
 * @param name - Display name from the school list
 * @returns The entry with its normalized key set
 */
export function buildEntry(name: string): SchoolEntry {
  const all = [name, ...deriveAliases(name), ...(CURATED_ALIASES[name] ?? [])];
  const keys = Array.from(new Set(all.map(normalize))).filter((k) => k.length > 0);
  return { name, keys };
}

/**
 * Builds searchable entries for a list of schools.
 *
 * @param names - Display names
 * @returns One entry per name
 */
export function buildEntries(names: string[]): SchoolEntry[] {
  return names.map(buildEntry);
}

/**
 * Reports whether every query token prefixes some token of a key.
 *
 * @param queryTokens - Tokens from the user's query
 * @param key - A normalized alias
 * @returns True when the key covers all query tokens
 * @remarks Prefix rather than equality so "mass inst tech" finds
 *          "massachusetts institute of technology", and order-insensitive so
 *          "berkeley uc" works as well as "uc berkeley".
 */
export function keyCoversTokens(queryTokens: string[], key: string): boolean {
  const keyTokens = key.split(" ");
  return queryTokens.every((qt) => keyTokens.some((kt) => kt.startsWith(qt)));
}

/** Match quality, lowest number ranks first. */
const enum Tier {
  Exact = 0,
  Prefix = 1,
  AllTokens = 2,
  Fuzzy = 3,
}

/**
 * Searches the school list.
 *
 * @param query - What the user typed
 * @param entries - Prebuilt entries from {@link buildEntries}
 * @param limit - Maximum results to return
 * @returns Matching school display names, best first
 * @remarks Ranked in tiers — exact alias, alias prefix, all query tokens
 *          present, then fuzzy — so a typo never outranks a real match. An
 *          empty query returns the list unchanged, preserving the curated
 *          ordering the picker shows before anyone types.
 */
export function searchSchools(
  query: string,
  entries: SchoolEntry[],
  limit = 50
): string[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return entries.slice(0, limit).map((e) => e.name);

  const queryTokens = tokenize(query);
  const scored = new Map<string, number>();

  for (const entry of entries) {
    let best: number | null = null;
    for (const key of entry.keys) {
      if (key === normalizedQuery) {
        best = Tier.Exact;
        break;
      }
      if (key.startsWith(normalizedQuery)) {
        best = Math.min(best ?? Tier.Prefix, Tier.Prefix);
        continue;
      }
      if (queryTokens.length > 0 && keyCoversTokens(queryTokens, key)) {
        best = Math.min(best ?? Tier.AllTokens, Tier.AllTokens);
      }
    }
    if (best !== null) scored.set(entry.name, best);
  }

  // Fuzzy pass fills the tail, so typos still land somewhere.
  if (scored.size < limit) {
    const fuse = new Fuse(entries, {
      keys: ["keys"],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
    for (const result of fuse.search(normalizedQuery, { limit })) {
      if (!scored.has(result.item.name)) scored.set(result.item.name, Tier.Fuzzy);
    }
  }

  return Array.from(scored.entries())
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}
