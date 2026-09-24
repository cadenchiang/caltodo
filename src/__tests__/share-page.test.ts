/**
 * Tests for /share: the sms: link and the fallback shown where Messages
 * cannot open, so a desktop visitor is never left on "opening" forever.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FALLBACK_AFTER_MS, SHARE_MESSAGE, SHARE_SMS_URL, canOpenSms } from "@/app/share/page";

const ROOT = path.resolve(__dirname, "../..");
const page = readFileSync(path.join(ROOT, "src/app/share/page.tsx"), "utf8");

describe("share message", () => {
  it("is sentence case with proper punctuation and the site link", () => {
    expect(SHARE_MESSAGE).toBe("Hey, you should try this. It is free for life right now: https://caltodo.me");
    expect(SHARE_MESSAGE).not.toContain("rn");
    expect(SHARE_MESSAGE).not.toContain(String.fromCharCode(0x2014));
  });

  it("encodes the same text into the sms: link", () => {
    expect(SHARE_SMS_URL.startsWith("sms:?body=")).toBe(true);
    expect(decodeURIComponent(SHARE_SMS_URL.slice("sms:?body=".length))).toBe(SHARE_MESSAGE);
  });
});

describe("canOpenSms", () => {
  it("is true for phones and tablets, false for desktop", () => {
    expect(canOpenSms("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(canOpenSms("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe(true);
    expect(canOpenSms("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Chrome/128")).toBe(false);
  });
});

describe("fallback", () => {
  it("appears after about 1.5 s on mobile and at once on desktop", () => {
    expect(FALLBACK_AFTER_MS).toBe(1500);
    expect(page).toContain("mobile ? FALLBACK_AFTER_MS : 0");
    expect(page).toContain("if (mobile) window.location.href = SHARE_SMS_URL;");
  });

  it("shows the message with a copy button and reports a failed copy", () => {
    expect(page).toContain("{SHARE_MESSAGE}");
    expect(page).toContain('{copied ? "Copied" : "Copy message"}');
    expect(page).toContain("navigator.clipboard.writeText(SHARE_MESSAGE)");
    expect(page).toContain("Could not copy.");
    expect(page).toContain("Opening Messages...");
    expect(page).not.toContain("opening messages...");
  });
});
