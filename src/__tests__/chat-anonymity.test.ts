/**
 * Anonymous mode must not leak the author through side channels.
 *
 * Three leaks existed: the typing indicator broadcast the sender's name
 * while they composed an anonymous message, the reply composer silently
 * reset anonymous mode to off, and the karma endpoint counted anonymous
 * rows per user. Pseudonymity (#N is one person within a chat) is now
 * disclosed in the composer and the welcome modal rather than implied
 * to be full anonymity.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel: string) => fs.existsSync(path.join(ROOT, rel));

describe("typing indicator", () => {
  const input = read("src/components/discussions/ChatInput.tsx");
  const hook = read("src/hooks/useTypingIndicator.ts");

  it("is not broadcast while anonymous mode is on", () => {
    expect(input).toContain("if (!anonymous) onTyping?.();");
  });

  it("takes the display name as a parameter instead of fetching per resume", () => {
    expect(hook).not.toContain("auth.getUser()");
    expect(hook).toContain("currentUserName: string | null");
    expect(hook).toContain("user_name: userNameRef.current");
  });
});

describe("anonymous state is lifted to ChatView", () => {
  const view = read("src/components/discussions/ChatView.tsx");
  const input = read("src/components/discussions/ChatInput.tsx");

  it("ChatInput no longer owns the flag", () => {
    expect(input).not.toContain("useState(false);\n  const [showEmojiPicker");
    expect(input).toContain("anonymous: boolean;");
    expect(input).toContain("onAnonymousChange: (anonymous: boolean) => void;");
  });

  it("both composers receive the same anonymous state", () => {
    const occurrences = view.split("anonymous={anonymous}").length - 1;
    expect(occurrences).toBe(2);
    expect(view.split("onAnonymousChange={handleAnonymousChange}").length - 1).toBe(2);
  });

  it("stops any typing broadcast when anonymous is switched on", () => {
    expect(view).toContain("if (next) onSendComplete?.();");
  });
});

describe("pseudonymity is disclosed", () => {
  it("in the composer helper text", () => {
    const input = read("src/components/discussions/ChatInput.tsx");
    expect(input).toContain("#N is the same person within this chat");
    expect(input).toContain("{ANONYMOUS_HELPER_TEXT}");
  });

  it("in the welcome modal", () => {
    const modal = read("src/components/discussions/CalChatWelcomeModal.tsx");
    expect(modal).toContain("The same number is the same person within a chat");
    expect(modal).not.toContain("your identity is hidden from other students");
  });
});

describe("karma is gone", () => {
  it("has no route", () => {
    expect(exists("src/app/api/users/karma/route.ts")).toBe(false);
  });

  it("is not fetched or rendered anywhere", () => {
    const files = [
      "src/components/discussions/UserProfileModal.tsx",
      "src/components/settings/sections/ProfileSection.tsx",
    ];
    for (const f of files) {
      const src = read(f);
      expect(src).not.toMatch(/karma/i);
    }
  });

  it("chat profiles no longer show a friend count", () => {
    const modal = read("src/components/discussions/UserProfileModal.tsx");
    expect(modal).not.toContain("/api/friends/count");
  });
});
