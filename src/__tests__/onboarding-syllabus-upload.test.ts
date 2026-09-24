/**
 * Tests for the syllabus upload step: the dropzone is a real label over a
 * focusable file input, validation lives in one helper, the mock query
 * param is inert outside development, and the purple accent is gone.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { ACCEPTED_TYPES, MAX_FILE_SIZE, validateSyllabusFile } from "@/components/onboarding/SyllabusDropzone";
import { MOCK_ASSIGNMENTS, shouldLoadSyllabusMock } from "@/components/onboarding/syllabusMock";

/** The em dash, spelled out so this file never contains one itself. */
const EM_DASH = String.fromCharCode(0x2014);

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");
const step = read("src/components/onboarding/SyllabusStep.tsx");
const dropzone = read("src/components/onboarding/SyllabusDropzone.tsx");

describe("validateSyllabusFile", () => {
  it("accepts every listed type under the limit", () => {
    for (const type of ACCEPTED_TYPES) expect(validateSyllabusFile({ type, size: 1024 })).toBeNull();
  });

  it("rejects other types and oversize files with a message", () => {
    expect(validateSyllabusFile({ type: "text/plain", size: 10 })).toMatch(/Unsupported/);
    expect(validateSyllabusFile({ type: "application/pdf", size: MAX_FILE_SIZE + 1 })).toMatch(/10 MB/);
  });
});

describe("shouldLoadSyllabusMock", () => {
  const params = (mock: string | null) => ({ get: (name: string) => (name === "mock" ? mock : null) });

  it("loads only in development with ?mock=true", () => {
    expect(shouldLoadSyllabusMock(params("true"), "development")).toBe(true);
  });

  it("is inert in production and test, and without the param", () => {
    expect(shouldLoadSyllabusMock(params("true"), "production")).toBe(false);
    expect(shouldLoadSyllabusMock(params("true"), "test")).toBe(false);
    expect(shouldLoadSyllabusMock(params("true"), undefined)).toBe(false);
    expect(shouldLoadSyllabusMock(params(null), "development")).toBe(false);
  });

  it("the step reads the gate with NODE_ENV", () => {
    expect(step).toContain("shouldLoadSyllabusMock(searchParams, process.env.NODE_ENV)");
    expect(MOCK_ASSIGNMENTS.length).toBeGreaterThan(0);
  });
});

describe("SyllabusDropzone", () => {
  it("is a label over a focusable file input, not a clickable div", () => {
    expect(dropzone).toContain("<label");
    expect(dropzone).toContain("htmlFor={inputId}");
    expect(dropzone).toContain('type="file"');
    expect(dropzone).toContain('className="sr-only"');
    expect(dropzone).not.toContain('className="hidden"');
    expect(dropzone).toContain("focus-within:ring-2");
    expect(step).not.toContain("fileInputRef");
  });

  it("still accepts drag and drop", () => {
    expect(dropzone).toContain("onDrop={handleDrop}");
    expect(dropzone).toContain("e.dataTransfer.files[0]");
  });

  it("describes the accepted formats to the input", () => {
    expect(dropzone).toContain("aria-describedby={`${inputId}-hint`}");
    expect(dropzone).toContain("PDF, PNG, JPG, or WebP (max 10 MB)");
  });
});

describe("SyllabusStep upload phase", () => {
  it("submits through a form with a Button so Enter extracts", () => {
    expect(step).toContain("<form onSubmit={handleExtract} noValidate>");
    expect(step).toMatch(/<Button type="submit" variant="inverted" size="lg"[^>]*disabled=\{!file \|\| !fileBase64\}/);
    expect(step).toContain("Extract assignments");
    expect(step).not.toContain("Extract Assignments");
  });

  it("uses the shared heading and error banner", () => {
    expect(step).toContain('<StepHeading');
    expect(step).toContain("<ErrorBanner message={error} />");
  });
});

describe("syllabus accent", () => {
  it("no onboarding file uses the purple accent or brand hex", () => {
    const dir = path.join(ROOT, "src/components/onboarding");
    for (const file of readdirSync(dir).filter((f) => f.startsWith("Syllabus") || f === "syllabusMock.ts")) {
      const src = read(`src/components/onboarding/${file}`);
      expect(src, file).not.toMatch(/purple/);
      expect(src, file).not.toMatch(/#0e89d6|#3D8FE8|#D1D1D6|#3A3A3C/);
      expect(src, file).not.toContain(EM_DASH);
    }
  });

  it("paints errors at the readable red step", () => {
    const preview = read("src/components/onboarding/SyllabusPreview.tsx");
    expect(preview).not.toMatch(/"text-red-400"/);
    expect(preview).not.toMatch(/text-xs text-red-400"/);
    expect(preview).toContain("text-red-600 dark:text-red-400");
  });
});
