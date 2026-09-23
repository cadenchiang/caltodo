/**
 * Tests for TextField and TextArea: the canonical input recipe, label
 * wiring, and aria-describedby / aria-invalid error linkage.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describedBy, FIELD_INPUT, FIELD_INPUT_ERROR, FIELD_LABEL } from "@/components/ui/field-recipe";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("field recipe", () => {
  it("is the canonical input: input-border, ring-ring, rounded-lg", () => {
    expect(FIELD_INPUT).toContain("border-input-border");
    expect(FIELD_INPUT).toContain("focus:ring-2 focus:ring-ring");
    expect(FIELD_INPUT).toContain("rounded-lg");
    expect(FIELD_INPUT).toContain("bg-card");
    expect(FIELD_INPUT).not.toContain("rounded-xl");
  });

  it("marks errors with the danger token", () => {
    expect(FIELD_INPUT_ERROR).toContain("border-danger");
  });

  it("labels are normal-case foreground text, never gray uppercase", () => {
    expect(FIELD_LABEL).toContain("text-foreground");
    expect(FIELD_LABEL).not.toContain("uppercase");
  });

  it("describedBy joins only the parts that exist", () => {
    expect(describedBy("f", false, false)).toBeUndefined();
    expect(describedBy("f", true, false)).toBe("f-hint");
    expect(describedBy("f", false, true)).toBe("f-error");
    expect(describedBy("f", true, true)).toBe("f-hint f-error");
  });
});

describe.each([
  ["TextField", "components/ui/TextField.tsx", "<input"],
  ["TextArea", "components/ui/TextArea.tsx", "<textarea"],
])("%s", (_name, file, tag) => {
  const src = read(file);

  it("renders a native control with a label bound by id", () => {
    expect(src).toContain(tag);
    expect(src).toContain("<label htmlFor={id}");
    expect(src).toContain("const id = explicitId ?? generatedId;");
  });

  it("requires a label and supports sr-only", () => {
    expect(src).toContain("label: ReactNode;");
    expect(src).toContain('hideLabel && "sr-only"');
  });

  it("links hint and error through aria-describedby and flags aria-invalid", () => {
    expect(src).toContain("aria-describedby={describedBy(id, Boolean(hint), hasError)}");
    expect(src).toContain("aria-invalid={hasError || undefined}");
    expect(src).toContain('id={`${id}-error`} role="alert"');
  });
});
