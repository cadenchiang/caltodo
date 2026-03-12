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

  it("allows any public HTTPS .edu domain", () => {
    expect(isAllowedCanvasUrl("https://canvas.ucsd.edu")).toBe(true);
    expect(isAllowedCanvasUrl("https://canvas.stanford.edu")).toBe(true);
    expect(isAllowedCanvasUrl("https://some-random.edu")).toBe(true);
  });

  it("allows any public HTTPS domain", () => {
    expect(isAllowedCanvasUrl("https://canvas.example.com")).toBe(true);
  });

  it("rejects HTTP (non-HTTPS)", () => {
    expect(isAllowedCanvasUrl("http://bcourses.berkeley.edu")).toBe(false);
  });

  it("rejects localhost", () => {
    expect(isAllowedCanvasUrl("https://localhost")).toBe(false);
    expect(isAllowedCanvasUrl("https://0.0.0.0")).toBe(false);
  });

  it("rejects private IP ranges", () => {
    expect(isAllowedCanvasUrl("https://127.0.0.1")).toBe(false);
    expect(isAllowedCanvasUrl("https://10.0.0.1")).toBe(false);
    expect(isAllowedCanvasUrl("https://192.168.1.1")).toBe(false);
    expect(isAllowedCanvasUrl("https://172.16.0.1")).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isAllowedCanvasUrl("not-a-url")).toBe(false);
    expect(isAllowedCanvasUrl("")).toBe(false);
  });

  it("allows bcourses with path", () => {
    expect(isAllowedCanvasUrl("https://bcourses.berkeley.edu/api/v1")).toBe(true);
  });
});
