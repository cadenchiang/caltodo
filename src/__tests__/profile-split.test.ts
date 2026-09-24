/**
 * Tests for the profile split (audit 2.21, 2.22, 4 ProfileSection findings).
 *
 * The 1,073-line ProfileSection becomes focused components under
 * components/profile. Friend cards are buttons with the add/remove control
 * outside them, the viewer uses Modal, report and remove-friend confirm
 * through ConfirmDialog (report with a reason), failed loads show an error
 * state with retry, and the karma stat is gone.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  getHiResAvatar,
  getInitials,
  getRelationship,
  REPORT_REASONS,
  toSearchUser,
  type FriendLists,
} from "@/components/profile/profile-utils";
import { isFreshCache, SUGGESTIONS_TTL_MS } from "@/components/profile/useSuggestions";

const DIR = path.resolve(__dirname, "..", "components/profile");
const read = (name: string) => readFileSync(path.join(DIR, name), "utf8");
const files = readdirSync(DIR);

const friend = { friendshipId: "f1", userId: "u1", email: "a@b.edu", fullName: "Ada Lovelace", avatarUrl: null };
const lists: FriendLists = {
  friends: [friend],
  pendingSent: [{ ...friend, friendshipId: "f2", userId: "u2" }],
  pendingReceived: [{ ...friend, friendshipId: "f3", userId: "u3" }],
};

describe("profile-utils", () => {
  it("upgrades Google avatars and leaves others alone", () => {
    expect(getHiResAvatar("https://lh3.googleusercontent.com/x=s96-c")).toBe("https://lh3.googleusercontent.com/x=s256-c");
    expect(getHiResAvatar("https://example.com/a.png")).toBe("https://example.com/a.png");
  });

  it("builds initials from the name, then the email, then ?", () => {
    expect(getInitials("Ada Lovelace", null)).toBe("AL");
    expect(getInitials("Ada", null)).toBe("A");
    expect(getInitials(null, "zed@b.edu")).toBe("Z");
    expect(getInitials(null, null)).toBe("?");
  });

  it("resolves relationships in priority order", () => {
    expect(getRelationship("u1", lists)).toBe("friend");
    expect(getRelationship("u2", lists)).toBe("pending_sent");
    expect(getRelationship("u3", lists)).toBe("pending_received");
    expect(getRelationship("u9", lists)).toBeNull();
  });

  it("converts a friend row into a viewer user", () => {
    expect(toSearchUser(friend)).toEqual({ id: "u1", email: "a@b.edu", full_name: "Ada Lovelace", avatar_url: null });
  });

  it("offers report reasons", () => {
    expect(REPORT_REASONS.length).toBeGreaterThanOrEqual(4);
    expect(REPORT_REASONS).toContain("Spam");
  });
});

describe("useSuggestions.isFreshCache", () => {
  it("trusts a cache inside the TTL only", () => {
    const now = 1_000_000;
    expect(isFreshCache({ suggestions: [], ts: now - 1000 }, now)).toBe(true);
    expect(isFreshCache({ suggestions: [], ts: now - SUGGESTIONS_TTL_MS - 1 }, now)).toBe(false);
    expect(isFreshCache(null, now)).toBe(false);
  });
});

describe("the split", () => {
  it("removes the old file and keeps every piece under 300 lines", () => {
    expect(() => readFileSync(path.resolve(__dirname, "..", "components/settings/sections/ProfileSection.tsx"))).toThrow();
    for (const name of files) expect(read(name).split("\n").length, name).toBeLessThan(300);
    expect(files).toEqual(
      expect.arrayContaining([
        "ProfileSection.tsx",
        "ProfileHeader.tsx",
        "FriendsList.tsx",
        "FriendRequests.tsx",
        "PeopleSuggestions.tsx",
        "UserViewerModal.tsx",
      ])
    );
  });

  it("the profile page imports the new section", () => {
    const page = readFileSync(path.resolve(__dirname, "..", "app/app/profile/page.tsx"), "utf8");
    expect(page).toContain('from "@/components/profile/ProfileSection"');
  });

  it("drops the karma stat and never calls /api/users/karma", () => {
    for (const name of files) {
      const src = read(name);
      expect(src, name).not.toMatch(/karma/i);
      expect(src, name).not.toContain("Total messages sent in Chat");
    }
  });

  it("drops undefined animation classes and the mt-32 gaps", () => {
    for (const name of files) {
      const src = read(name);
      expect(src, name).not.toContain("fade-in");
      expect(src, name).not.toContain("zoom-in-95");
      expect(src, name).not.toContain("mt-32");
      expect(src, name).not.toContain("dark:hover:bg-zinc-800");
    }
  });
});

describe("friend cards", () => {
  it("are buttons with the remove and add controls outside them", () => {
    const list = read("FriendsList.tsx");
    expect(list).toContain('<button type="button" onClick={() => onView(friend)}');
    expect(list).not.toContain('role="button"');
    expect(list).toMatch(/<\/button>\s*<IconButton\s+aria-label=\{`Remove \$\{name\} as a friend`\}/);
    const people = read("PeopleSuggestions.tsx");
    expect(people).toContain('<button type="button" onClick={() => onView(person)}');
    expect(people).not.toContain('role="button"');
    expect(people).toMatch(/<\/button>\s*\{rel === "pending_sent"[\s\S]*<IconButton\s+aria-label=\{`Add \$\{name\} as a friend`\}/);
  });

  it("never hide the remove control until hover", () => {
    expect(read("FriendsList.tsx")).not.toContain("opacity-0");
  });
});

describe("UserViewerModal", () => {
  const src = read("UserViewerModal.tsx");

  it("is built on Modal with a labelled close and report button", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).toContain("aria-label={`${name}'s profile`}");
    expect(src).toContain("aria-label={`Report ${name}`}");
    expect(src).not.toContain("createPortal");
  });

  it("confirms report with a reason select and remove-friend through ConfirmDialog", () => {
    expect(src).toContain('open={pending === "report"}');
    expect(src).toContain('open={pending === "remove"}');
    expect(src).toContain("REPORT_REASONS.map");
    expect(src).toContain("body: JSON.stringify({ userId: user!.id, reason })");
  });
});

describe("load failures", () => {
  it("show an error state with retry instead of an empty list", () => {
    expect(read("FriendsList.tsx")).toContain('title="Friends could not load"');
    expect(read("PeopleSuggestions.tsx")).toContain('title="Suggestions could not load"');
    expect(read("FriendSearch.tsx")).toContain("Search failed.");
    expect(read("useFriends.ts")).toContain("setError(message)");
    expect(read("useSuggestions.ts")).toContain("if (!hadCache) setError(message)");
  });

  it("toast every failure with the error variant", () => {
    for (const name of files) {
      const failures = read(name).match(/showToast\([^;]*Failed[^;]*\);/g) ?? [];
      for (const call of failures) expect(call, name).toContain('variant: "error"');
    }
  });
});
