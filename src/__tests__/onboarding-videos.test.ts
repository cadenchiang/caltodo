/**
 * Tests for onboarding instruction video assets and deployment configuration.
 * Verifies that video files exist, are referenced correctly in components,
 * and are not excluded from deployment by .vercelignore.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT, "public");

/** Video assets required by the onboarding flow. */
const REQUIRED_VIDEOS = [
  { file: "bcourses-instructions.mp4", component: "CanvasStep.tsx" },
];

describe("onboarding video assets", () => {
  it.each(REQUIRED_VIDEOS)(
    "should have $file in public folder",
    ({ file }) => {
      const filePath = path.join(PUBLIC_DIR, file);
      expect(fs.existsSync(filePath)).toBe(true);
    },
  );

  it.each(REQUIRED_VIDEOS)(
    "$file should be non-empty",
    ({ file }) => {
      const filePath = path.join(PUBLIC_DIR, file);
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    },
  );

  it.each(REQUIRED_VIDEOS)(
    "$component should reference /$file",
    ({ file, component }) => {
      const componentPath = path.join(
        ROOT,
        "src/components/onboarding",
        component,
      );
      const source = fs.readFileSync(componentPath, "utf-8");
      expect(source).toContain(`/${file}`);
    },
  );
});

describe(".vercelignore must not exclude video assets", () => {
  it("should not contain *.mp4 exclusion pattern", () => {
    const vercelignorePath = path.join(ROOT, ".vercelignore");
    if (!fs.existsSync(vercelignorePath)) {
      // No .vercelignore means nothing is excluded — pass
      return;
    }
    const content = fs.readFileSync(vercelignorePath, "utf-8");
    const lines = content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));

    for (const line of lines) {
      // Fail if any line would match .mp4 files
      expect(line).not.toMatch(/^\*\.mp4$/);
    }
  });

  it.each(REQUIRED_VIDEOS)(
    "$file should not be individually excluded in .vercelignore",
    ({ file }) => {
      const vercelignorePath = path.join(ROOT, ".vercelignore");
      if (!fs.existsSync(vercelignorePath)) return;
      const content = fs.readFileSync(vercelignorePath, "utf-8");
      expect(content).not.toContain(file);
    },
  );
});
