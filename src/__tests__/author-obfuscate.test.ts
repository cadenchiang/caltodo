import { describe, it, expect } from "vitest";
import { obfuscateAuthorId } from "@/lib/author-obfuscate";

describe("obfuscateAuthorId", () => {
  const authorA = "aaaaaaaa-1111-2222-3333-444444444444";
  const authorB = "bbbbbbbb-5555-6666-7777-888888888888";
  const course1 = "course-1111";
  const course2 = "course-2222";

  it("returns deterministic output for same inputs", () => {
    const first = obfuscateAuthorId(authorA, course1);
    const second = obfuscateAuthorId(authorA, course1);
    expect(first).toBe(second);
  });

  it("returns different output for different authors", () => {
    const a = obfuscateAuthorId(authorA, course1);
    const b = obfuscateAuthorId(authorB, course1);
    expect(a).not.toBe(b);
  });

  it("returns different output for same author in different courses", () => {
    const c1 = obfuscateAuthorId(authorA, course1);
    const c2 = obfuscateAuthorId(authorA, course2);
    expect(c1).not.toBe(c2);
  });

  it("produces anon_ prefix with 16 hex characters", () => {
    const result = obfuscateAuthorId(authorA, course1);
    expect(result).toMatch(/^anon_[0-9a-f]{16}$/);
  });

  it("does not contain the original author ID", () => {
    const result = obfuscateAuthorId(authorA, course1);
    expect(result).not.toContain(authorA);
  });
});
