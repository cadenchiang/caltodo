/**
 * Audit section 4, chrome: route guards redirected in useEffect after the
 * page painted; ThemeToggle flashed light with hardcoded zinc/gray; two
 * stacked page fades and no-op animation classes; no aria-current on nav;
 * no add button in the mobile tab bar; the autoSync effect re-armed on
 * every syncing toggle; calendar skeleton flipped view after mount.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { resolveGuardedRoute } from "@/lib/landing-path";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("resolveGuardedRoute", () => {
  it("redirects hidden routes and desktop-only routes on a phone, before render", () => {
    expect(resolveGuardedRoute("/app/home", { hidden_nav_items: ["/app/home"] }, false)).toBe("/app/inbox");
    expect(resolveGuardedRoute("/app/home/anything", {}, true)).toBe("/app/inbox");
    expect(resolveGuardedRoute("/app/discussions/abc", {}, true)).toBe("/app/inbox");
    expect(resolveGuardedRoute("/app/inbox", { hidden_nav_items: ["/app/inbox"] }, false)).toBe("/app/calendar");
  });

  it("lets allowed routes render and never loops onto itself", () => {
    expect(resolveGuardedRoute("/app/inbox", {}, true)).toBeNull();
    expect(resolveGuardedRoute("/app/settings", { hidden_nav_items: ["/app/inbox"] }, false)).toBeNull();
    expect(resolveGuardedRoute("/app/inbox", { hidden_nav_items: ["/app/inbox", "/app/calendar"] }, true)).toBeNull();
    expect(resolveGuardedRoute("/app/discussions", {}, false)).toBeNull();
  });

  it("is wired into the proxy for the guarded routes", () => {
    const src = read("proxy.ts");
    expect(src).toContain("resolveGuardedRoute(pathname, user.user_metadata, isMobileRequest(request.headers))");
    expect(src).toContain('"/app/inbox/:path*"');
    expect(src).toContain('"/app/discussions/:path*"');
  });
});

describe("ThemeToggle", () => {
  const src = read("components/layout/ThemeToggle.tsx");
  it("uses tokens and dark variants, not zinc/gray hex classes", () => {
    expect(src).not.toMatch(/zinc-|gray-/);
    expect(src).toContain("border-border bg-card");
    expect(src).toContain("bg-muted dark:bg-white/10");
    expect(src).toContain('role="group"');
  });
});

describe("motion", () => {
  const css = read("app/globals.css");
  it("keeps one 150ms page fade and drops the stacked one", () => {
    expect(css).toContain("animation: pageFadeIn 150ms ease-out;");
    expect(read("app/app/template.tsx")).toContain('className="animate-fade-in h-full"');
    expect(read("components/ui/PageTransition.tsx")).not.toContain("transition-opacity");
    expect(read("components/ui/PageTransition.tsx")).not.toContain("duration-[350ms]");
  });
  it("deletes the no-op animation classes", () => {
    for (const cls of [".animate-stagger", ".stagger-1", ".animate-section-in", ".animate-task-slide-in", ".animate-view-switch", ".no-page-anim"]) {
      expect(css, cls).not.toContain(`${cls} {`);
      expect(css, cls).not.toContain(`${cls},`);
    }
    expect(read("components/tasks/RepeatPicker.tsx")).not.toContain("zoom-in-95");
  });
});

describe("nav", () => {
  it("marks the current page and adds a labelled 44px Add button on mobile", () => {
    const tab = read("components/layout/MobileTabBar.tsx");
    expect(tab).toContain('aria-current={isActive ? "page" : undefined}');
    expect(tab).toContain('aria-label="Add task"');
    expect(tab).toContain("min-h-11 min-w-11");
    expect(tab).toContain('export const ADD_TASK_EVENT = "caltodo-add-task";');
    expect(tab).toContain('"7 days"');
    expect(read("components/layout/SidebarNavItem.tsx")).toContain('aria-current={isActive ? "page" : undefined}');
    expect(read("components/layout/SidebarNavItem.tsx")).not.toContain("#0e89d6");
    expect(read("app/app/inbox/page.tsx")).toContain("window.addEventListener(ADD_TASK_EVENT, open);");
  });
});

describe("perf and skeletons", () => {
  it("the autoSync effect reads syncing from a ref", () => {
    const src = read("contexts/TaskContext.tsx");
    expect(src).toContain("if (syncingRef.current || now - lastAutoSyncRef.current < AUTO_SYNC_COOLDOWN_MS) return;");
    expect(src).toContain("}, [fetchTasks, syncUnsyncedToGCal]);");
    expect(src).not.toContain("}, [syncing, fetchTasks, syncUnsyncedToGCal]);");
  });
  it("the calendar skeleton mirrors the panel wrapper", () => {
    const src = read("app/app/calendar/loading.tsx");
    expect(src).toContain("-m-4 md:-m-10");
    expect(src).toContain("mx-4 md:mx-8 rounded-2xl border border-border bg-card");
  });
});
