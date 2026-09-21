/**
 * Tests that the login error banner clears on retry.
 *
 * Audit L16: LoginForm only ever set the banner (from the hook's error or
 * the callback's ?error= param) and never cleared it, so a retry ran
 * behind stale failure text.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const form = fs.readFileSync(path.join(ROOT, "src/components/auth/LoginForm.tsx"), "utf8");

describe("LoginForm", () => {
  it("clears the banner before starting a new sign-in", () => {
    expect(form).toMatch(/function handleRetry\(\) \{\s*setError\(null\);\s*void handleGoogleSignIn\(\);/);
    expect(form).toContain("onClick={handleRetry}");
    expect(form).not.toContain("onClick={handleGoogleSignIn}");
  });

  it("mirrors the hook's error in both directions", () => {
    expect(form).toMatch(/useEffect\(\(\) => \{\s*setError\(oauthError\);\s*\}, \[oauthError\]\);/);
    expect(form).not.toContain("if (oauthError) setError(oauthError);");
  });
});
