/**
 * Tests for the login surface: the Google button's pending state, one
 * analytics event per click, the right panel's real count in place of the
 * fabricated testimonials, tokens, and the 44px toggle link.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { formatSyncedLine } from "@/components/auth/LoginRightPanel";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");
const hook = read("src/hooks/useGoogleSignIn.ts");
const form = read("src/components/auth/LoginForm.tsx");
const panel = read("src/components/auth/LoginRightPanel.tsx");
const page = read("src/app/login/page.tsx");

describe("useGoogleSignIn", () => {
  it("returns a pending flag that turns on at the click and off on every failure path", () => {
    expect(hook).toContain("const [pending, setPending] = useState(false);");
    expect(hook).toMatch(/setError\(null\);\s*setPending\(true\);/);
    expect(hook).toContain("return { handleGoogleSignIn, error, pending };");
    // oauth_start (desktop + mobile), popup closed without session, callback error, session never visible.
    expect(hook.match(/setPending\(false\)/g)?.length).toBe(5);
  });

  it("fires only the funnel step, not the duplicate google_oauth_clicked", () => {
    expect(hook).toContain('trackAuthSubmitted(mode, "google")');
    expect(hook).not.toContain('trackEvent("google_oauth_clicked")');
    expect(read("src/lib/analytics.ts")).not.toContain("google_oauth_clicked");
  });
});

describe("LoginForm", () => {
  it("disables the Google button while pending and says so", () => {
    expect(form).toContain("disabled={pending}");
    expect(form).toContain("aria-busy={pending || undefined}");
    expect(form).toContain('{pending ? "Opening Google..." : buttonLabel}');
  });

  it("keeps the retry handler that clears stale errors", () => {
    expect(form).toMatch(/function handleRetry\(\) \{\s*setError\(null\);\s*void handleGoogleSignIn\(\);/);
  });

  it("uses Sign in wording from the glossary and a 44px toggle link", () => {
    expect(form).toContain("AUTH.signInWithGoogle");
    expect(form).toContain("AUTH.signIn");
    expect(form).toMatch(/<a[^>]*min-h-11[^>]*>\s*\{altPromptLink\}/);
  });

  it("uses tokens, sentence case, and no brand hex", () => {
    expect(form).not.toMatch(/#0e89d6|#3D8FE8/);
    expect(form).not.toMatch(/text-gray-[0-9]+/);
    expect(form).not.toContain("thanks for checking out");
    expect(form).toContain("Thanks for checking out {BRAND}!");
    expect(form).not.toContain(EM_DASH);
  });
});

describe("LoginRightPanel", () => {
  it("has no fabricated testimonials, names or schools attributed to quotes", () => {
    expect(panel).not.toContain("TESTIMONIALS");
    expect(panel).not.toMatch(/quote:/);
    expect(panel).not.toContain("Alex Nguyen");
  });

  it("shows a product statement and the real synced count from the landing cache", () => {
    expect(panel).toContain("assignmentCount: number");
    expect(page).toContain("<LoginRightPanel assignmentCount={assignmentCount} />");
    expect(page).toContain('import { getCachedAssignmentCount } from "@/lib/landing-counts"');
    expect(read("src/app/(landing)/page.tsx")).toContain('from "@/lib/landing-counts"');
  });

  it("formats the count line and hides it when unknown", () => {
    expect(formatSyncedLine(0)).toBeNull();
    expect(formatSyncedLine(-1)).toBeNull();
    expect(formatSyncedLine(Number.NaN)).toBeNull();
    expect(formatSyncedLine(12345)).toBe("12,345+ assignments synced so far");
  });

  it("uses tokens on the panel and page", () => {
    expect(panel).not.toMatch(/text-gray-[0-9]+/);
    expect(page).not.toContain("#f6f5f4");
    expect(page).not.toContain(EM_DASH);
  });
});
