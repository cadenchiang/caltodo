/**
 * Tests for theme resolution logic in ThemeContext.
 * Verifies that resolveTheme correctly maps "light", "dark", and "auto"
 * preferences to their resolved theme values.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveTheme } from "@/contexts/ThemeContext";
import type { ThemePreference, ResolvedTheme } from "@/contexts/ThemeContext";

describe("resolveTheme", () => {
  let matchMediaSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Provide a default matchMedia stub for the "auto" tests
    matchMediaSpy = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as ReturnType<typeof vi.spyOn>;

    vi.stubGlobal("window", { matchMedia: matchMediaSpy });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return "light" for preference "light"', () => {
    const result: ResolvedTheme = resolveTheme("light");
    expect(result).toBe("light");
  });

  it('should return "dark" for preference "dark"', () => {
    const result: ResolvedTheme = resolveTheme("dark");
    expect(result).toBe("dark");
  });

  it('should return "light" for "auto" when OS prefers light', () => {
    (matchMediaSpy as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
    });

    const result: ResolvedTheme = resolveTheme("auto");
    expect(result).toBe("light");
  });

  it('should return "dark" for "auto" when OS prefers dark', () => {
    (matchMediaSpy as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      matches: true,
      media: "(prefers-color-scheme: dark)",
    });

    const result: ResolvedTheme = resolveTheme("auto");
    expect(result).toBe("dark");
  });

  it("should only accept valid ThemePreference values", () => {
    const validPrefs: ThemePreference[] = ["light", "dark", "auto"];
    for (const pref of validPrefs) {
      const result = resolveTheme(pref);
      expect(["light", "dark"]).toContain(result);
    }
  });
});
