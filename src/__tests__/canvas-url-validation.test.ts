import { describe, it, expect } from "vitest";
import { isAllowedCanvasUrl } from "@/lib/canvas-url-validation";

describe("isAllowedCanvasUrl", () => {
  it("allows https://bcourses.berkeley.edu", () => {
    expect(isAllowedCanvasUrl("https://bcourses.berkeley.edu")).toBe(true);
  });

  it("allows https://instructure.com", () => {
    expect(isAllowedCanvasUrl("https://instructure.com")).toBe(true);
  });

  it("allows https://canvas.instructure.com", () => {
    expect(isAllowedCanvasUrl("https://canvas.instructure.com")).toBe(true);
  });

  it("allows https://myschool.instructure.com", () => {
    expect(isAllowedCanvasUrl("https://myschool.instructure.com")).toBe(true);
  });

  it("rejects arbitrary .edu domains", () => {
    expect(isAllowedCanvasUrl("https://evil.edu")).toBe(false);
  });

  it("rejects HTTP (non-HTTPS)", () => {
    expect(isAllowedCanvasUrl("http://bcourses.berkeley.edu")).toBe(false);
  });

  it("rejects attacker.com", () => {
    expect(isAllowedCanvasUrl("https://attacker.com")).toBe(false);
  });

  it("rejects instructure.com.evil.com (subdomain impersonation)", () => {
    expect(isAllowedCanvasUrl("https://instructure.com.evil.com")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isAllowedCanvasUrl("not-a-url")).toBe(false);
    expect(isAllowedCanvasUrl("")).toBe(false);
  });

  it("allows bcourses with path", () => {
    expect(isAllowedCanvasUrl("https://bcourses.berkeley.edu/api/v1")).toBe(true);
  });
});
