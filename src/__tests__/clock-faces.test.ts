/**
 * Tests for clock face registry and face→component map.
 * Validates that all face IDs are registered and mapped correctly.
 */

import { describe, it, expect } from "vitest";
import { CLOCK_FACES, DEFAULT_CLOCK_FACE } from "@/lib/clock-faces";
import type { ClockFaceId } from "@/lib/clock-faces";
import { CLOCK_FACE_MAP } from "@/components/home/widgets/clock-faces";

const EXPECTED_IDS: ClockFaceId[] = ["digital", "analog", "minimal", "flip", "stacked", "split"];

describe("clock-faces registry", () => {
  it("contains exactly 6 face entries", () => {
    expect(CLOCK_FACES).toHaveLength(6);
  });

  it("has correct IDs in order", () => {
    const ids = CLOCK_FACES.map((f) => f.id);
    expect(ids).toEqual(EXPECTED_IDS);
  });

  it("each entry has a non-empty label and description", () => {
    for (const face of CLOCK_FACES) {
      expect(face.label).toBeTruthy();
      expect(face.description).toBeTruthy();
    }
  });

  it("DEFAULT_CLOCK_FACE is 'digital'", () => {
    expect(DEFAULT_CLOCK_FACE).toBe("digital");
  });
});

describe("CLOCK_FACE_MAP", () => {
  it("has an entry for every registered face ID", () => {
    for (const face of CLOCK_FACES) {
      expect(CLOCK_FACE_MAP).toHaveProperty(face.id);
    }
  });

  it("each mapped value is a truthy component (function)", () => {
    for (const id of EXPECTED_IDS) {
      const component = CLOCK_FACE_MAP[id];
      expect(component).toBeTruthy();
      expect(typeof component).toBe("function");
    }
  });

  it("has no extra entries beyond the registered faces", () => {
    const mapKeys = Object.keys(CLOCK_FACE_MAP);
    expect(mapKeys).toHaveLength(EXPECTED_IDS.length);
    for (const key of mapKeys) {
      expect(EXPECTED_IDS).toContain(key);
    }
  });
});
