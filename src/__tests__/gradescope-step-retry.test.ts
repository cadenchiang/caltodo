/**
 * Tests for the standalone Gradescope retry path.
 *
 * Audit L14: the saved email arrived after mount and was only read in the
 * useState initializer, so the retry form was empty; a 401 set authFailed
 * with no toast, so nothing visibly happened on a wrong password.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const step = fs.readFileSync(path.join(ROOT, "src/components/onboarding/GradescopeStep.tsx"), "utf8");

describe("GradescopeStep", () => {
  it("adopts initialEmail when it arrives after mount, without overwriting typed input", () => {
    expect(step).toContain("const [seenInitialEmail, setSeenInitialEmail] = useState(initialEmail);");
    expect(step).toMatch(/if \(initialEmail !== seenInitialEmail\) \{\s*setSeenInitialEmail\(initialEmail\);\s*if \(initialEmail && email === ""\) setEmail\(initialEmail\);/);
  });

  it("toasts on a 401 as well as showing the help dropdown", () => {
    const branch = step.slice(step.indexOf("if (res.status === 401) {"), step.indexOf("if (res.status >= 500"));
    expect(branch).toContain("setAuthFailed(true);");
    expect(branch).toContain('showToast("Gradescope rejected that email or password.", { variant: "error", duration: 4000 });');
  });

  it("is fed the saved email by the standalone page", () => {
    const page = fs.readFileSync(path.join(ROOT, "src/app/app/onboarding/page.tsx"), "utf8");
    expect(page).toContain("initialEmail={standaloneGradescopeEmail}");
    expect(page).toContain("setStandaloneGradescopeEmail(data.gradescope_email)");
  });
});
