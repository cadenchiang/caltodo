/**
 * Tests for clearing per-user caches on sign-out (L9).
 *
 * The task cache in particular hydrates before the first paint, so on a
 * shared machine the previous account's tasks showed for the next person
 * whenever the preload failed. Sign-out has to drop it, and every other
 * cache of one user's data, while leaving device preferences alone.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

vi.mock("@/lib/board-layout-cache", () => ({ clearLayoutCache: vi.fn() }));
vi.mock("@/components/SWRProvider", () => ({ clearSWRCache: vi.fn() }));

import { clearUserCaches, USER_CACHE_KEYS, USER_CACHE_KEY_PREFIXES } from "@/lib/user-caches";
import { clearLayoutCache } from "@/lib/board-layout-cache";
import { clearSWRCache } from "@/components/SWRProvider";

/** A Storage stand-in with the parts clearUserCaches uses. */
function fakeStorage(entries: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(entries));
  return {
    get length() { return map.size; },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => map.clear(),
  } as Storage;
}

let local: Storage;
let session: Storage;

beforeEach(() => {
  vi.clearAllMocks();
  local = fakeStorage({
    caltodo_tasks_cache: "{}",
    caltodo_last_auto_sync_at: "1",
    caltodo_user_profile: "{}",
    caltodo_friends_cache: "[]",
    gcal_status: "{}",
    "gcal-widget-cache:primary": "{}",
    // Device preferences, not user data: must survive.
    theme: "dark",
    "inbox-view-mode": "board",
    caltodo_sync_dismissed: "true",
  });
  session = fakeStorage({ other: "x" });
  vi.stubGlobal("window", { localStorage: local, sessionStorage: session });
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("clearUserCaches", () => {
  it("drops the task cache and the other per-user caches", () => {
    clearUserCaches();
    expect(local.getItem("caltodo_tasks_cache")).toBeNull();
    expect(local.getItem("caltodo_last_auto_sync_at")).toBeNull();
    expect(local.getItem("caltodo_user_profile")).toBeNull();
    expect(local.getItem("caltodo_friends_cache")).toBeNull();
    expect(local.getItem("gcal_status")).toBeNull();
  });

  it("drops prefixed per-widget keys", () => {
    clearUserCaches();
    expect(local.getItem("gcal-widget-cache:primary")).toBeNull();
  });

  it("leaves device preferences and unrelated keys alone", () => {
    clearUserCaches();
    expect(local.getItem("theme")).toBe("dark");
    expect(local.getItem("inbox-view-mode")).toBe("board");
    expect(local.getItem("caltodo_sync_dismissed")).toBe("true");
    expect(session.getItem("other")).toBe("x");
  });

  it("still clears the board and SWR caches it replaced", () => {
    clearUserCaches();
    expect(clearLayoutCache).toHaveBeenCalledTimes(1);
    expect(clearSWRCache).toHaveBeenCalledTimes(1);
  });

  it("logs what it cleared", () => {
    clearUserCaches();
    expect(console.info).toHaveBeenCalledWith(
      "[user-caches] cleared on sign-out",
      { local: 6, session: 0 },
    );
  });

  it("logs and does not throw when storage is unavailable", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage { throw new Error("SecurityError"); },
      sessionStorage: session,
    });
    expect(() => clearUserCaches()).not.toThrow();
    expect(console.error).toHaveBeenCalledWith(
      "[user-caches] could not clear storage",
      expect.objectContaining({ error: "SecurityError" }),
    );
  });

  it("is a no-op on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(() => clearUserCaches()).not.toThrow();
    expect(clearLayoutCache).not.toHaveBeenCalled();
  });
});

describe("the keys match what the app actually writes", () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

  it.each([
    ["caltodo_tasks_cache", "src/contexts/TaskContext.tsx"],
    ["caltodo_last_auto_sync_at", "src/contexts/TaskContext.tsx"],
    ["caltodo_user_profile", "src/components/layout/Sidebar.tsx"],
    ["caltodo_friends_cache", "src/components/settings/sections/ProfileSection.tsx"],
    ["caltodo_suggestions_cache", "src/components/settings/sections/ProfileSection.tsx"],
    ["caltodo_credentials_cache", "src/components/settings/IntegrationSettings.tsx"],
    ["caltodo_calendar_token_cache", "src/components/settings/CalendarFeedSettings.tsx"],
    ["caltodo_course_totals", "src/components/settings/ClassesSection.tsx"],
    ["caltodo_sync_course_selections", "src/app/app/inbox/page.tsx"],
    ["caltodo_hidden_nav_items", "src/hooks/useHiddenNavItems.ts"],
    ["gcal_status", "src/components/calendar/CalendarHeader.tsx"],
  ])("%s is written by %s", (key, file) => {
    expect(USER_CACHE_KEYS).toContain(key);
    expect(read(file)).toContain(`"${key}"`);
  });

  it.each([
    ["gcal-widget-cache:", "src/components/home/widgets/GoogleCalendarWidget.tsx"],
  ])("prefix %s is written by %s", (prefix, file) => {
    expect(USER_CACHE_KEY_PREFIXES).toContain(prefix);
    expect(read(file)).toContain(`"${prefix}"`);
  });
});

describe("both sign-out paths clear the caches", () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

  it("useAuth.signOut clears before the signout request", () => {
    const src = read("src/hooks/useAuth.ts");
    expect(src.indexOf("clearUserCaches();")).toBeLessThan(src.indexOf('fetch("/auth/signout"'));
  });

  it("ProfilePopup's log-out clears before the signout request", () => {
    const src = read("src/components/layout/ProfilePopup.tsx");
    expect(src.indexOf("clearUserCaches();")).toBeGreaterThan(0);
    expect(src.indexOf("clearUserCaches();")).toBeLessThan(src.indexOf('fetch("/auth/signout"'));
  });
});
