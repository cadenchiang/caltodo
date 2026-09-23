/**
 * Tests for the Button and IconButton primitives: class recipes, loading and
 * disabled wiring, the required aria-label, and the touch-target rule.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ComponentProps } from "react";
import Button, { BUTTON_BASE, BUTTON_SIZES, BUTTON_VARIANTS, buttonClasses } from "@/components/ui/Button";
import IconButton, { ICON_BUTTON_SIZES, TOUCH_TARGET } from "@/components/ui/IconButton";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("Button recipes", () => {
  it("primary is brand blue with a darker hover", () => {
    expect(BUTTON_VARIANTS.primary).toContain("bg-blue-500");
    expect(BUTTON_VARIANTS.primary).toContain("hover:bg-blue-600");
    expect(BUTTON_VARIANTS.primary).toContain("text-white");
  });

  it("inverted uses the explicit gray-900/white idiom and drops its shadow in dark mode", () => {
    expect(BUTTON_VARIANTS.inverted).toContain("bg-gray-900 text-white");
    expect(BUTTON_VARIANTS.inverted).toContain("dark:bg-white dark:text-gray-900");
    expect(BUTTON_VARIANTS.inverted).toContain("dark:shadow-none");
    expect(BUTTON_VARIANTS.inverted).not.toContain("bg-foreground");
  });

  it("secondary is bordered on the card surface with an accent hover", () => {
    expect(BUTTON_VARIANTS.secondary).toContain("border-border");
    expect(BUTTON_VARIANTS.secondary).toContain("bg-card");
    expect(BUTTON_VARIANTS.secondary).toContain("hover:bg-accent");
  });

  it("destructive is the text-red-500 with 10% tint recipe, and the filled variant is solid red", () => {
    expect(BUTTON_VARIANTS.destructive).toBe("rounded-lg text-red-500 hover:bg-red-500/10");
    expect(BUTTON_VARIANTS["destructive-filled"]).toContain("bg-red-500 text-white hover:bg-red-600");
  });

  it("controls are rounded-lg and pills are rounded-full", () => {
    for (const [name, classes] of Object.entries(BUTTON_VARIANTS)) {
      if (name === "pill") expect(classes).toContain("rounded-full");
      else expect(classes, name).toContain("rounded-lg");
    }
  });

  it("carries a focus-visible ring and never relies on outline removal alone", () => {
    expect(BUTTON_BASE).toContain("focus-visible:ring-2 focus-visible:ring-ring");
    expect(BUTTON_BASE).toContain("disabled:opacity-50");
  });

  it("exposes three sizes", () => {
    expect(Object.keys(BUTTON_SIZES)).toEqual(["sm", "md", "lg"]);
    expect(BUTTON_SIZES.md).toBe("px-4 py-2 text-sm");
  });

  it("buttonClasses merges and lets the caller override", () => {
    const classes = buttonClasses("primary", "md", "w-full");
    expect(classes).toContain("bg-blue-500");
    expect(classes).toContain("w-full");
    expect(buttonClasses("pill", "sm", "rounded-lg")).toContain("rounded-lg");
    expect(buttonClasses("pill", "sm", "rounded-lg")).not.toContain("rounded-full");
  });
});

describe("Button component source", () => {
  const src = read("components/ui/Button.tsx");

  it("defaults type to button and wires loading to aria-busy and disabled", () => {
    expect(src).toContain('type = "button"');
    expect(src).toContain("disabled={disabled || loading}");
    expect(src).toContain("aria-busy={loading || undefined}");
    expect(src).toContain('<Loader2 size={SPINNER_SIZE[size]} className="animate-spin shrink-0" aria-hidden="true" />');
  });

  it("accepts a ref prop (React 19)", () => {
    expect(src).toContain("ref?: Ref<HTMLButtonElement>;");
  });
});

describe("IconButton", () => {
  const src = read("components/ui/IconButton.tsx");

  it("requires aria-label at the type level", () => {
    type Props = ComponentProps<typeof IconButton>;
    const ok: Props = { "aria-label": "Close", children: null };
    // @ts-expect-error aria-label is mandatory for icon-only buttons
    const missing: Props = { children: null };
    expect(ok["aria-label"]).toBe("Close");
    expect(missing).toBeDefined();
  });

  it("enforces a 44px hit area on coarse pointers", () => {
    expect(TOUCH_TARGET).toBe("pointer-coarse:min-h-11 pointer-coarse:min-w-11");
    expect(src).toContain("TOUCH_TARGET,");
  });

  it("offers a negative-margin bleed per size", () => {
    expect(src).toContain('sm: "pointer-coarse:-m-2"');
    expect(src).toContain('md: "pointer-coarse:-m-1.5"');
    expect(src).toContain('lg: "pointer-coarse:-m-0.5"');
  });

  it("uses the documented 32px default box and hides the icon from assistive tech", () => {
    expect(ICON_BUTTON_SIZES.md).toBe("w-8 h-8");
    expect(src).toContain('<span className="inline-flex" aria-hidden="true">');
  });

  it("is a real button, not a div", () => {
    expect(Button).toBeTypeOf("function");
    expect(src).toContain("<button");
    expect(src).not.toContain('role="button"');
  });
});
