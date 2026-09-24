/**
 * Tests for heading scale, placeholder copy, and the request modal
 * (audit 2.18, 2.19, 2.20, 2.36).
 *
 * NavigationSection rendered an h1 text-2xl beside siblings' h2 text-lg;
 * the request-a-platform example listed Brightspace, which is already an
 * integration; and the request modal was a hand-rolled z-[9999] overlay.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { REQUEST_PLACEHOLDER } from "@/components/settings/sections/IntegrationsSection";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

const SECTIONS = [
  "components/settings/sections/IntegrationsSection.tsx",
  "components/settings/sections/NotificationsSection.tsx",
  "components/settings/sections/AppearanceSection.tsx",
  "components/settings/sections/NavigationSection.tsx",
  "components/settings/sections/AdvancedSection.tsx",
];

describe("settings section headings", () => {
  it.each(SECTIONS)("%s uses SectionHeading and no h1", (rel) => {
    const src = read(rel);
    expect(src).toContain("<SectionHeading");
    expect(src).not.toContain("<h1");
    expect(src).not.toContain("text-2xl font-bold");
  });

  it.each(SECTIONS)("%s keeps text-subtle-foreground for placeholders only", (rel) => {
    expect(read(rel)).not.toContain("text-subtle-foreground");
  });
});

describe("request a platform", () => {
  const src = read("components/settings/sections/IntegrationsSection.tsx");

  it("drops Brightspace from the example list", () => {
    expect(REQUEST_PLACEHOLDER).not.toMatch(/Brightspace/);
    expect(REQUEST_PLACEHOLDER).toMatch(/Schoology/);
  });

  it("is built on Modal and TextArea with token colours", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).toContain('import TextArea from "@/components/ui/TextArea";');
    expect(src).toContain("initialFocusRef={textareaRef}");
    expect(src).not.toContain("z-[9999]");
    expect(src).not.toContain("#0e89d6");
    expect(src).not.toContain("#3D8FE8");
    expect(src).not.toContain("addEventListener");
  });
});

describe("group labels", () => {
  it("IntegrationList uses the shared settings group recipe", () => {
    const src = read("components/settings/IntegrationList.tsx");
    expect(src).toContain("SETTINGS_GROUP_LABEL");
    expect(src).not.toContain("text-[11px] font-semibold");
  });

  it("NavigationSection uses the Badge primitive for Beta", () => {
    const src = read("components/settings/sections/NavigationSection.tsx");
    expect(src).toContain('<Badge variant="beta">Beta</Badge>');
    expect(src).not.toContain("text-[9px]");
  });
});
