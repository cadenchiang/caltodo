/**
 * Tests for school picker search.
 * Covers the reported failure (official names finding short-name entries),
 * alias derivation, token and prefix matching, typo tolerance, and ranking.
 */

import { describe, it, expect } from "vitest";
import {
  normalize,
  tokenize,
  deriveAliases,
  buildEntry,
  buildEntries,
  keyCoversTokens,
  searchSchools,
} from "@/lib/school-search";
import { SCHOOL_OPTIONS } from "@/components/onboarding/onboardingOptions";

const ENTRIES = buildEntries(SCHOOL_OPTIONS);

/** Runs a query against the real school list. */
function search(query: string): string[] {
  return searchSchools(query, ENTRIES);
}

describe("normalize", () => {
  it("lowercases, strips punctuation and collapses whitespace", () => {
    expect(normalize("  Georgia   Tech!  ")).toBe("georgia tech");
    expect(normalize("Texas A&M")).toBe("texas a and m");
  });

  it("strips accents", () => {
    expect(normalize("Université")).toBe("universite");
  });
});

describe("tokenize", () => {
  it("drops stopwords", () => {
    expect(tokenize("Georgia Institute of Technology")).toEqual([
      "georgia",
      "institute",
      "technology",
    ]);
  });
});

describe("deriveAliases", () => {
  it("expands 'X Tech' into the institute form", () => {
    expect(deriveAliases("Georgia Tech")).toContain("Georgia Institute of Technology");
  });

  it("contracts 'X Institute of Technology' into the short form", () => {
    expect(deriveAliases("Stevens Institute of Technology")).toContain("Stevens Tech");
  });

  it("splits a parenthetical abbreviation into both halves", () => {
    const aliases = deriveAliases("Rensselaer Polytechnic Institute (RPI)");
    expect(aliases).toContain("Rensselaer Polytechnic Institute");
    expect(aliases).toContain("RPI");
  });

  it("expands a UC campus", () => {
    expect(deriveAliases("UC Berkeley")).toContain("University of California Berkeley");
  });

  it("adds the University suffix for a bare state name", () => {
    expect(deriveAliases("Georgia State")).toContain("Georgia State University");
  });
});

describe("buildEntry", () => {
  it("includes the display name and curated aliases as normalized keys", () => {
    const entry = buildEntry("MIT");
    expect(entry.name).toBe("MIT");
    expect(entry.keys).toContain("mit");
    expect(entry.keys).toContain("massachusetts institute of technology");
  });

  it("does not repeat keys", () => {
    const entry = buildEntry("Georgia Tech");
    expect(new Set(entry.keys).size).toBe(entry.keys.length);
  });
});

describe("keyCoversTokens", () => {
  it("matches on token prefixes in any order", () => {
    expect(keyCoversTokens(["mass", "inst"], "massachusetts institute of technology")).toBe(true);
    expect(keyCoversTokens(["berkeley", "uc"], "uc berkeley")).toBe(true);
  });

  it("rejects a token that prefixes nothing", () => {
    expect(keyCoversTokens(["stanford"], "uc berkeley")).toBe(false);
  });
});

describe("searchSchools — the reported failure", () => {
  it("finds Georgia Tech by its official name", () => {
    expect(search("Georgia Institute of Technology")).toContain("Georgia Tech");
  });

  it("finds it from a partial official name too", () => {
    expect(search("georgia institute")).toContain("Georgia Tech");
  });

  it("finds MIT by its official name", () => {
    expect(search("Massachusetts Institute of Technology")).toContain("MIT");
  });

  it("finds Caltech by its official name", () => {
    expect(search("California Institute of Technology")).toContain("Caltech");
  });

  it("finds UC Berkeley written out in full", () => {
    expect(search("University of California Berkeley")).toContain("UC Berkeley");
  });

  it("finds RPI by either half of its listed name", () => {
    expect(search("RPI")).toContain("Rensselaer Polytechnic Institute (RPI)");
    expect(search("Rensselaer")).toContain("Rensselaer Polytechnic Institute (RPI)");
  });
});

describe("searchSchools — behavior", () => {
  it("returns the untouched list for an empty query", () => {
    expect(search("")).toEqual(SCHOOL_OPTIONS.slice(0, 50));
    expect(search("   ")).toEqual(SCHOOL_OPTIONS.slice(0, 50));
  });

  it("ranks an exact name first", () => {
    expect(search("Harvard")[0]).toBe("Harvard");
  });

  it("still supports plain substring-style prefix queries", () => {
    expect(search("stanf")).toContain("Stanford");
  });

  it("tolerates a typo", () => {
    expect(search("stanfrod")).toContain("Stanford");
    expect(search("massachusets institute of technology")).toContain("MIT");
  });

  it("matches tokens out of order", () => {
    expect(search("berkeley uc")).toContain("UC Berkeley");
  });

  it("returns nothing for a query matching no school", () => {
    expect(search("zzzzqqqq notaschool")).toEqual([]);
  });

  it("respects the result limit", () => {
    expect(search("university").length).toBeLessThanOrEqual(50);
  });
});

describe("SCHOOL_OPTIONS", () => {
  it("has no duplicate entries", () => {
    expect(new Set(SCHOOL_OPTIONS).size).toBe(SCHOOL_OPTIONS.length);
  });

  it("still lists a healthy number of schools", () => {
    expect(SCHOOL_OPTIONS.length).toBeGreaterThan(600);
  });
});
