import { describe, it, expect } from "vitest";
import { isAdmin, ADMIN_EMAIL } from "@/lib/admin";

describe("ADMIN_EMAIL", () => {
  it("should be the expected admin email", () => {
    expect(ADMIN_EMAIL).toBe("cadenchiang@berkeley.edu");
  });
});

describe("isAdmin", () => {
  it("should return true for the admin email", () => {
    expect(isAdmin("cadenchiang@berkeley.edu")).toBe(true);
  });

  it("should be case-insensitive", () => {
    expect(isAdmin("CadenChiang@Berkeley.EDU")).toBe(true);
    expect(isAdmin("CADENCHIANG@BERKELEY.EDU")).toBe(true);
  });

  it("should return false for a non-admin email", () => {
    expect(isAdmin("someone@example.com")).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isAdmin(undefined)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isAdmin("")).toBe(false);
  });
});
