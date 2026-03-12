import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("admin", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV, ADMIN_EMAIL: "cadenchiang@berkeley.edu" };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("ADMIN_EMAIL should read from env var", async () => {
    const { ADMIN_EMAIL } = await import("@/lib/admin");
    expect(ADMIN_EMAIL).toBe("cadenchiang@berkeley.edu");
  });

  it("ADMIN_EMAIL should default to empty string when env var is missing", async () => {
    delete process.env.ADMIN_EMAIL;
    const { ADMIN_EMAIL } = await import("@/lib/admin");
    expect(ADMIN_EMAIL).toBe("");
  });

  it("isAdmin should return true for the admin email", async () => {
    const { isAdmin } = await import("@/lib/admin");
    expect(isAdmin("cadenchiang@berkeley.edu")).toBe(true);
  });

  it("isAdmin should be case-insensitive", async () => {
    const { isAdmin } = await import("@/lib/admin");
    expect(isAdmin("CadenChiang@Berkeley.EDU")).toBe(true);
    expect(isAdmin("CADENCHIANG@BERKELEY.EDU")).toBe(true);
  });

  it("isAdmin should return false for a non-admin email", async () => {
    const { isAdmin } = await import("@/lib/admin");
    expect(isAdmin("someone@example.com")).toBe(false);
  });

  it("isAdmin should return false for undefined", async () => {
    const { isAdmin } = await import("@/lib/admin");
    expect(isAdmin(undefined)).toBe(false);
  });

  it("isAdmin should return false for null", async () => {
    const { isAdmin } = await import("@/lib/admin");
    expect(isAdmin(null)).toBe(false);
  });

  it("isAdmin should return false for empty string", async () => {
    const { isAdmin } = await import("@/lib/admin");
    expect(isAdmin("")).toBe(false);
  });

  it("isAdmin should return false when ADMIN_EMAIL is unset", async () => {
    delete process.env.ADMIN_EMAIL;
    const { isAdmin } = await import("@/lib/admin");
    expect(isAdmin("cadenchiang@berkeley.edu")).toBe(false);
  });
});
