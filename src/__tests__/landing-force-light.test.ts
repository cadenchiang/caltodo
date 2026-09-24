/**
 * Tests for two small landing/billing hygiene fixes.
 *
 * Audit L19: the landing layout hardcoded bg-white without force-light, so
 * after sunset the contact form got dark native-control styling.
 * Audit L20: billing/success pointed at "Settings -> Account", which does
 * not exist.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("landing layout", () => {
  it("applies force-light like /login does", () => {
    // The layout renders through LandingShell, which owns the wrapper.
    expect(read("src/app/(landing)/layout.tsx")).toContain("<LandingShell>{children}</LandingShell>");
    expect(read("src/components/landing/LandingShell.tsx")).toMatch(/className="[^"]*\bbg-white\b[^"]*\bforce-light\b/);
    expect(read("src/app/login/page.tsx")).toMatch(/className="[^"]*\bforce-light\b/);
  });

  it("force-light forces light native controls", () => {
    const css = read("src/app/globals.css");
    expect(css).toMatch(/\.force-light \{\s*color-scheme: light !important;/);
    expect(css).toMatch(/\.force-light input,\s*\.force-light textarea,\s*\.force-light select \{\s*color-scheme: light !important;/);
  });
});

describe("billing success copy", () => {
  const page = read("src/app/app/billing/success/page.tsx");

  it("redirects into the app instead of naming a settings destination", () => {
    // The page is a redirect now (audit 2.27); it renders no links at all.
    expect(page).not.toContain("Settings &rarr; Account");
    expect(page).toContain("redirect(BILLING_SUCCESS_REDIRECT)");
    // The billing portal still returns to settings.
    expect(read("src/app/api/stripe/portal/route.ts")).toContain("return_url: `${origin}/app/settings`");
  });

  it("names no settings section that is not in the config", () => {
    const config = read("src/lib/settingsConfig.ts");
    expect(config).not.toContain('id: "account"');
  });
});
