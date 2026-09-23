/**
 * Tests for the smaller primitives: Badge, EmptyState, Skeleton, Spinner,
 * PageHeader, SectionHeading, IntegrationLogo, and the copy glossary.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { BADGE_BASE, BADGE_VARIANTS } from "@/components/ui/Badge";
import { SKELETON_SHAPES } from "@/components/ui/Skeleton";
import { SPINNER_SIZES } from "@/components/ui/Spinner";
import { PAGE_TITLE } from "@/components/ui/PageHeader";
import { SECTION_TITLE } from "@/components/ui/SectionHeading";
import { LOGO_SIZES, PROVIDER_ASSETS } from "@/components/ui/IntegrationLogo";
import { ACTIONS, AUTH, BCOURSES_HINT, BRAND, CLASS_NOUN, PROVIDER_LABELS, SKIP_LABEL, providerLabel } from "@/lib/copy";
import { PROVIDER_META } from "@/lib/integration-providers";

const root = path.resolve(__dirname, "..", "..");
const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("Badge", () => {
  it("uses the badge text step, one radius and one blue tint", () => {
    expect(BADGE_BASE).toContain("text-3xs");
    expect(BADGE_BASE).toContain("rounded-md");
    expect(BADGE_VARIANTS.info).toBe(BADGE_VARIANTS.beta);
    expect(BADGE_VARIANTS.info).toContain("bg-blue-50 text-blue-600");
  });

  it("covers the seven variants and keeps count as the only rounded-full one", () => {
    expect(Object.keys(BADGE_VARIANTS).sort()).toEqual(["beta", "count", "danger", "info", "neutral", "success", "warning"]);
    for (const [name, classes] of Object.entries(BADGE_VARIANTS)) {
      if (name === "count") expect(classes).toContain("rounded-full");
      else expect(classes, name).not.toContain("rounded-full");
    }
  });

  it("status tints use the semantic tint tokens with 600/400 text", () => {
    expect(BADGE_VARIANTS.success).toContain("bg-success-tint text-emerald-600 dark:text-emerald-400");
    expect(BADGE_VARIANTS.warning).toContain("bg-warning-tint text-amber-600 dark:text-amber-400");
    expect(BADGE_VARIANTS.danger).toContain("bg-danger-tint text-red-600 dark:text-red-400");
  });
});

describe("EmptyState", () => {
  const src = read("components/ui/EmptyState.tsx");
  it("has one padding recipe and an optional icon, description and action", () => {
    expect(src).toContain("py-12 px-6");
    expect(src).toContain("{action && <div className=\"mt-4\">{action}</div>}");
    expect(src).toContain('aria-hidden="true"');
  });
});

describe("Skeleton and Spinner", () => {
  it("skeleton is a muted pulsing block with a few shapes", () => {
    expect(read("components/ui/Skeleton.tsx")).toContain('"bg-muted animate-pulse"');
    expect(Object.keys(SKELETON_SHAPES)).toEqual(["text", "title", "circle", "block", "pill"]);
  });

  it("spinner wraps Loader2 with a status role and a default label", () => {
    const src = read("components/ui/Spinner.tsx");
    expect(src).toContain('role="status" aria-label={label}');
    expect(src).toContain('"aria-label": label = "Loading"');
    expect(src).toContain('className="animate-spin"');
    expect(SPINNER_SIZES).toEqual({ sm: 14, md: 18, lg: 24 });
  });
});

describe("headings", () => {
  it("page is h1 text-xl font-bold, section is h2 text-lg font-semibold", () => {
    expect(PAGE_TITLE).toContain("text-xl font-bold");
    expect(read("components/ui/PageHeader.tsx")).toContain("<h1 className={PAGE_TITLE}>");
    expect(SECTION_TITLE).toBe("text-lg font-semibold text-foreground");
    expect(read("components/ui/SectionHeading.tsx")).toContain("<h2 className={SECTION_TITLE}>");
    expect(read("components/ui/SectionHeading.tsx")).toContain("text-sm text-muted-foreground");
  });
});

describe("IntegrationLogo", () => {
  it("maps every provider to one asset that exists in public/", () => {
    for (const [provider, asset] of Object.entries(PROVIDER_ASSETS)) {
      expect(existsSync(path.join(root, "public", asset)), `${provider} -> ${asset}`).toBe(true);
    }
    expect(PROVIDER_ASSETS.canvas).toBe("/canvas-logo.png");
    expect(Object.values(PROVIDER_ASSETS)).not.toContain("/bcourses-logo.png");
  });

  it("takes alt text from PROVIDER_LABELS and supports a decorative mode", () => {
    const src = read("components/ui/IntegrationLogo.tsx");
    expect(src).toContain('alt={decorative ? "" : PROVIDER_LABELS[provider]}');
    expect(LOGO_SIZES.md).toBe("w-7 h-7");
  });
});

describe("copy glossary", () => {
  it("fixes the vocabulary", () => {
    expect(BRAND).toBe("caltodo");
    expect(CLASS_NOUN).toBe("class");
    expect(SKIP_LABEL).toBe("Skip for now");
    expect(AUTH.signIn).toBe("Sign in");
    expect(AUTH.signOut).toBe("Sign out");
    expect(PROVIDER_LABELS.canvas).toBe("Canvas");
    expect(PROVIDER_LABELS.pensieve).toBe("Pensive");
    expect(PROVIDER_LABELS.gcal).toBe("Google Calendar");
    expect(BCOURSES_HINT).toContain("bCourses");
  });

  it("agrees with PROVIDER_META for every account provider", () => {
    for (const [id, meta] of Object.entries(PROVIDER_META)) {
      expect(providerLabel(id), id).toBe(meta.label);
    }
    expect(providerLabel("unknown")).toBe("unknown");
  });

  it("never says GCal, Pensieve, or CalTodo, and uses no em dashes", () => {
    const src = read("lib/copy.ts");
    const values = [...Object.values(PROVIDER_LABELS), ...Object.values(AUTH), ...Object.values(ACTIONS), BRAND, SKIP_LABEL];
    for (const v of values) {
      expect(v).not.toMatch(/GCal|Pensieve|CalTodo/);
      expect(v).not.toContain("—");
    }
    expect(src).not.toContain("—");
  });
});

describe("Pensieve label leaks", () => {
  it("no user-facing label or error message says Pensieve", () => {
    const files = [
      "lib/sync-result-summary.ts",
      "lib/integration-health-issues.ts",
      "app/api/credentials/route.ts",
      "app/api/pensieve/ical-preview/route.ts",
      "app/api/pensieve/courses/route.ts",
    ];
    for (const f of files) {
      const src = read(f);
      const leaks = src.match(/(label|error): "[^"]*Pensieve[^"]*"/g) ?? [];
      expect(leaks, f).toEqual([]);
    }
  });

  it("the brand is lowercase in the offline page and service worker", () => {
    expect(read("app/offline/page.tsx")).not.toContain("CalTodo");
    expect(read("app/sw.ts")).not.toContain("CalTodo");
  });
});
